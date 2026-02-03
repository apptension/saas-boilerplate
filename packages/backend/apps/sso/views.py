"""
SSO Views for SAML, OIDC, SCIM, and WebAuthn endpoints.

Security Features:
- Open redirect prevention via validate_redirect_path
- Safe error handling to prevent information disclosure
- Rate limiting on authentication endpoints
- Proper input validation
"""

import logging
from functools import wraps

from django.conf import settings
from django.http import HttpResponse, JsonResponse, HttpResponseRedirect
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.utils import timezone
from django.core.cache import cache
from django_ratelimit.decorators import ratelimit
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle
from rest_framework import status

from django.db import models
from graphql_relay import from_global_id

from apps.multitenancy.models import Tenant, TenantMembership
from apps.multitenancy.constants import TenantUserRole

from .models import TenantSSOConnection, SCIMToken, SSOAuditLog
from .constants import SSOConnectionStatus, SSOAuditEventType
from .services import SAMLService, OIDCService, SCIMService, WebAuthnService
from .services.scim import SCIMError
from .services.provisioning import JITProvisioningService
from .security import (
    build_safe_redirect_url,
    get_safe_error_code,
    validate_pagination_params,
    safe_log_user_identifier,
)

logger = logging.getLogger(__name__)


# ===================
# Rate Limiting Classes
# ===================


class SSOLoginThrottle(AnonRateThrottle):
    """Rate limit for SSO login initiation endpoints."""

    rate = "20/minute"


class SSODiscoveryThrottle(AnonRateThrottle):
    """Rate limit for SSO discovery endpoints."""

    rate = "60/minute"


class PasskeyAuthThrottle(AnonRateThrottle):
    """Rate limit for passkey authentication attempts."""

    rate = "10/minute"


class SCIMApiThrottle(UserRateThrottle):
    """Rate limit for SCIM API operations."""

    rate = "100/minute"


def get_client_ip(request):
    """Get client IP from request."""
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        return x_forwarded_for.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")


# ==================
# SAML Views
# ==================


class SAMLMetadataView(View):
    """Serve SP metadata for SAML configuration."""

    def get(self, request, connection_id):
        try:
            # SECURITY: Only expose metadata for active or testing connections
            connection = TenantSSOConnection.objects.get(
                pk=connection_id,
                connection_type="saml",
                status__in=[SSOConnectionStatus.ACTIVE, SSOConnectionStatus.DRAFT],
            )
        except TenantSSOConnection.DoesNotExist:
            return HttpResponse("Not found", status=404)

        try:
            saml_service = SAMLService(connection)
            metadata = saml_service.generate_sp_metadata()
        except Exception as e:
            # SECURITY: Don't expose internal error details
            logger.error(f"Failed to generate SAML metadata for connection {connection_id}: {e}")
            return HttpResponse("Failed to generate metadata", status=500)

        return HttpResponse(
            metadata,
            content_type="application/xml",
        )


@method_decorator(ratelimit(key="ip", rate="20/m", method="GET", block=True), name="get")
class SAMLLoginView(View):
    """Initiate SAML SSO login with rate limiting."""

    def get(self, request, connection_id):
        try:
            connection = TenantSSOConnection.objects.get(
                pk=connection_id,
                connection_type="saml",
                status=SSOConnectionStatus.ACTIVE,
            )
        except TenantSSOConnection.DoesNotExist:
            return HttpResponse("SSO connection not found or inactive", status=404)

        # Validate that the connection has required SAML configuration
        if not connection.saml_sso_url:
            logger.error(f"SAML connection {connection_id} has no SSO URL configured")
            return HttpResponse("SSO connection is not properly configured (missing SSO URL)", status=400)

        # Store relay state (return URL)
        relay_state = request.GET.get("next", "/")

        try:
            saml_service = SAMLService(connection)
            redirect_url, request_id = saml_service.create_authn_request(
                relay_state=relay_state,
            )
        except Exception as e:
            # SECURITY: Log detailed error server-side, return generic message to client
            logger.error(f"Failed to create SAML AuthnRequest for connection {connection_id}: {e}", exc_info=True)
            error_code = get_safe_error_code(e)
            return HttpResponse(f"Failed to initiate SSO login. Error code: {error_code}", status=500)

        # Store request ID for validation
        cache.set(
            f"saml_request_{request_id}",
            {
                "connection_id": str(connection_id),
                "relay_state": relay_state,
            },
            timeout=600,
        )  # 10 minutes

        SSOAuditLog.log_event(
            event_type=SSOAuditEventType.SSO_LOGIN_INITIATED,
            tenant=connection.tenant,
            sso_connection=connection,
            description="SAML login initiated",
            ip_address=get_client_ip(request),
        )

        return HttpResponseRedirect(redirect_url)


@method_decorator(csrf_exempt, name="dispatch")
class SAMLACSView(View):
    """SAML Assertion Consumer Service - handles SAML responses."""

    def post(self, request, connection_id):
        try:
            connection = TenantSSOConnection.objects.get(
                pk=connection_id,
                connection_type="saml",
            )
        except TenantSSOConnection.DoesNotExist:
            return HttpResponse("Not found", status=404)

        saml_response = request.POST.get("SAMLResponse")
        relay_state = request.POST.get("RelayState", "/")

        if not saml_response:
            return HttpResponse("Missing SAMLResponse", status=400)

        saml_service = SAMLService(connection)

        try:
            # Parse and validate SAML response
            logger.info(f"Processing SAML response for connection {connection_id}")
            user_attrs = saml_service.parse_saml_response(saml_response)

            # Validate we have required attributes
            email = user_attrs.get("email")
            if not email:
                logger.error(
                    f"SAML response missing email. NameID: {user_attrs.get('name_id')}, "
                    f"raw_attrs: {list(user_attrs.get('raw_attributes', {}).keys())}"
                )
                raise ValueError("No email found in SAML response. Check attribute mapping in your IdP.")

            # Provision or update user
            logger.info(f"Provisioning user with email: {email}")
            provisioning_service = JITProvisioningService(connection)
            user, sso_link, is_new = provisioning_service.provision_or_update_user(
                idp_user_id=user_attrs.get("name_id", email),
                email=email,
                first_name=user_attrs.get("first_name", ""),
                last_name=user_attrs.get("last_name", ""),
                groups=user_attrs.get("groups", []),
                raw_attributes=user_attrs.get("raw_attributes", {}),
                ip_address=get_client_ip(request),
            )

            # Create session and set auth cookies (same as regular login)
            from apps.users.jwt import create_jwt_tokens
            from apps.users.utils import set_auth_cookie
            from .services import SessionService

            # Create SSOSession for tracking
            session_service = SessionService(user)
            try:
                session, session_id = session_service.create_session(request, sso_link=sso_link)
            except Exception:
                session_id = None

            tokens = create_jwt_tokens(user)

            # Build redirect URL with open redirect protection
            web_app_url = getattr(settings, "WEB_APP_URL", "http://localhost:3000")
            # SECURITY: Validate relay_state to prevent open redirect
            redirect_url = build_safe_redirect_url(web_app_url, relay_state, default_path="/en/")

            SSOAuditLog.log_event(
                event_type=SSOAuditEventType.SSO_LOGIN_SUCCESS,
                tenant=connection.tenant,
                user=user,
                sso_connection=connection,
                description=f"SAML login successful for {user.email}",
                ip_address=get_client_ip(request),
            )

            # Create redirect response and set auth cookies
            response = HttpResponseRedirect(redirect_url)
            auth_cookies = {
                settings.ACCESS_TOKEN_COOKIE: tokens["access"],
                settings.REFRESH_TOKEN_COOKIE: tokens["refresh"],
            }
            if session_id:
                auth_cookies[settings.SESSION_ID_COOKIE] = session_id
            set_auth_cookie(response, auth_cookies)
            return response

        except Exception as e:
            # Log detailed error server-side only (not exposed to client)
            logger.error(f"SAML authentication failed for connection {connection_id}: {e}", exc_info=True)

            SSOAuditLog.log_event(
                event_type=SSOAuditEventType.SSO_LOGIN_FAILED,
                tenant=connection.tenant,
                sso_connection=connection,
                description="SAML login failed",
                error_message=str(e)[:500],  # Store for admin review
                ip_address=get_client_ip(request),
                success=False,
            )

            # SECURITY: Return safe error code instead of raw exception message
            web_app_url = getattr(settings, "WEB_APP_URL", "http://localhost:3000")
            error_code = get_safe_error_code(e)
            return HttpResponseRedirect(f"{web_app_url}/en/auth/sso/error?code={error_code}")


# ==================
# OIDC Views
# ==================


@method_decorator(ratelimit(key="ip", rate="20/m", method="GET", block=True), name="get")
class OIDCLoginView(View):
    """Initiate OIDC SSO login with rate limiting."""

    def get(self, request, connection_id):
        try:
            connection = TenantSSOConnection.objects.get(
                pk=connection_id,
                connection_type="oidc",
                status=SSOConnectionStatus.ACTIVE,
            )
        except TenantSSOConnection.DoesNotExist:
            return HttpResponse("SSO connection not found or inactive", status=404)

        # Validate that the connection has required OIDC configuration
        if not connection.oidc_issuer and not connection.oidc_authorization_endpoint:
            logger.error(f"OIDC connection {connection_id} has no issuer or authorization endpoint configured")
            return HttpResponse(
                "SSO connection is not properly configured (missing issuer/authorization endpoint)", status=400
            )

        try:
            oidc_service = OIDCService(connection)

            # Generate PKCE
            code_verifier, code_challenge = oidc_service.generate_pkce()

            # Create authorization URL
            auth_url, auth_params = oidc_service.create_authorization_url(
                code_challenge=code_challenge,
                login_hint=request.GET.get("login_hint"),
            )
        except Exception as e:
            # SECURITY: Log detailed error server-side, return generic message to client
            logger.error(f"Failed to create OIDC authorization URL for connection {connection_id}: {e}", exc_info=True)
            error_code = get_safe_error_code(e)
            return HttpResponse(f"Failed to initiate SSO login. Error code: {error_code}", status=500)

        # Store state for callback validation
        cache.set(
            f"oidc_state_{auth_params['state']}",
            {
                "connection_id": str(connection_id),
                "nonce": auth_params["nonce"],
                "code_verifier": code_verifier,
                "next": request.GET.get("next", "/"),
            },
            timeout=600,
        )  # 10 minutes

        SSOAuditLog.log_event(
            event_type=SSOAuditEventType.SSO_LOGIN_INITIATED,
            tenant=connection.tenant,
            sso_connection=connection,
            description="OIDC login initiated",
            ip_address=get_client_ip(request),
        )

        return HttpResponseRedirect(auth_url)


class OIDCCallbackView(View):
    """Handle OIDC callback after authentication."""

    def get(self, request, connection_id):
        try:
            connection = TenantSSOConnection.objects.get(
                pk=connection_id,
                connection_type="oidc",
            )
        except TenantSSOConnection.DoesNotExist:
            return HttpResponse("Not found", status=404)

        # Check for errors from IdP
        error = request.GET.get("error")
        if error:
            error_desc = request.GET.get("error_description", error)
            # Log the actual error server-side
            logger.warning(f"OIDC error from IdP: {error} - {error_desc}")
            SSOAuditLog.log_event(
                event_type=SSOAuditEventType.SSO_LOGIN_FAILED,
                tenant=connection.tenant,
                sso_connection=connection,
                description=f"OIDC error: {error}",
                error_message=error_desc[:500],  # Store for admin review
                success=False,
                ip_address=get_client_ip(request),
            )
            # SECURITY: Return safe error code, not raw IdP error
            web_app_url = getattr(settings, "WEB_APP_URL", "http://localhost:3000")
            return HttpResponseRedirect(f"{web_app_url}/en/auth/sso/error?code=auth_failed")

        code = request.GET.get("code")
        state = request.GET.get("state")

        if not code or not state:
            return HttpResponse("Missing code or state", status=400)

        # Retrieve stored state
        stored_data = cache.get(f"oidc_state_{state}")
        if not stored_data:
            return HttpResponse("Invalid or expired state", status=400)

        cache.delete(f"oidc_state_{state}")

        oidc_service = OIDCService(connection)

        try:
            # Process callback
            user_attrs = oidc_service.process_callback(
                code=code,
                state=state,
                stored_state=state,
                stored_nonce=stored_data["nonce"],
                code_verifier=stored_data["code_verifier"],
            )

            # Provision or update user
            provisioning_service = JITProvisioningService(connection)
            user, sso_link, is_new = provisioning_service.provision_or_update_user(
                idp_user_id=user_attrs.get("idp_user_id", user_attrs.get("sub")),
                email=user_attrs.get("email"),
                first_name=user_attrs.get("first_name", ""),
                last_name=user_attrs.get("last_name", ""),
                groups=user_attrs.get("groups", []),
                raw_attributes=user_attrs.get("raw_claims", {}),
                ip_address=get_client_ip(request),
            )

            # Create session and set auth cookies (same as regular login)
            from apps.users.jwt import create_jwt_tokens
            from apps.users.utils import set_auth_cookie
            from .services import SessionService

            # Create SSOSession for tracking
            session_service = SessionService(user)
            try:
                session, session_id = session_service.create_session(request, sso_link=sso_link)
            except Exception:
                session_id = None

            tokens = create_jwt_tokens(user)

            # Build redirect URL with open redirect protection
            web_app_url = getattr(settings, "WEB_APP_URL", "http://localhost:3000")
            # SECURITY: Validate next URL to prevent open redirect
            next_url = stored_data.get("next", "/en/")
            redirect_url = build_safe_redirect_url(web_app_url, next_url, default_path="/en/")

            SSOAuditLog.log_event(
                event_type=SSOAuditEventType.SSO_LOGIN_SUCCESS,
                tenant=connection.tenant,
                user=user,
                sso_connection=connection,
                description=f"OIDC login successful for {safe_log_user_identifier(user.email)}",
                ip_address=get_client_ip(request),
            )

            # Create redirect response and set auth cookies
            response = HttpResponseRedirect(redirect_url)
            auth_cookies = {
                settings.ACCESS_TOKEN_COOKIE: tokens["access"],
                settings.REFRESH_TOKEN_COOKIE: tokens["refresh"],
            }
            if session_id:
                auth_cookies[settings.SESSION_ID_COOKIE] = session_id
            set_auth_cookie(response, auth_cookies)
            return response

        except Exception as e:
            # Log detailed error server-side only
            logger.error(f"OIDC authentication failed for connection {connection_id}: {e}", exc_info=True)

            SSOAuditLog.log_event(
                event_type=SSOAuditEventType.SSO_LOGIN_FAILED,
                tenant=connection.tenant,
                sso_connection=connection,
                description="OIDC login failed",
                error_message=str(e)[:500],  # Store for admin review
                success=False,
                ip_address=get_client_ip(request),
            )

            # SECURITY: Return safe error code instead of raw exception
            web_app_url = getattr(settings, "WEB_APP_URL", "http://localhost:3000")
            error_code = get_safe_error_code(e)
            return HttpResponseRedirect(f"{web_app_url}/en/auth/sso/error?code={error_code}")


# ==================
# SCIM Views
# ==================


def scim_auth_required(view_func):
    """Decorator to authenticate SCIM requests."""

    @wraps(view_func)
    def wrapper(self, request, *args, **kwargs):
        auth_header = request.META.get("HTTP_AUTHORIZATION", "")

        if not auth_header.startswith("Bearer "):
            return JsonResponse(
                SCIMError("Missing or invalid authorization header", 401).to_response(),
                status=401,
            )

        token_value = auth_header[7:]  # Remove 'Bearer '
        token = SCIMToken.objects.verify_token(token_value)

        if not token:
            return JsonResponse(
                SCIMError("Invalid or expired token", 401).to_response(),
                status=401,
            )

        # Record token usage
        token.record_usage(get_client_ip(request))

        # Attach token and service to request
        request.scim_token = token
        request.scim_service = SCIMService(token)

        return view_func(self, request, *args, **kwargs)

    return wrapper


@method_decorator(csrf_exempt, name="dispatch")
class SCIMUsersView(APIView):
    """SCIM /Users endpoint with secure input validation."""

    permission_classes = [AllowAny]  # Auth handled by decorator
    throttle_classes = [SCIMApiThrottle]

    @scim_auth_required
    def get(self, request):
        """List users or get a specific user."""
        scim_service = request.scim_service

        # SECURITY: Validate and sanitize filter expression
        filter_expr = request.GET.get("filter")

        # SECURITY: Validate pagination parameters to prevent DoS
        start_index, count = validate_pagination_params(
            request.GET.get("startIndex"),
            request.GET.get("count"),
            default_start=1,
            default_count=100,
            max_count=1000,
        )

        result = scim_service.list_users(
            filter_expr=filter_expr,
            start_index=start_index,
            count=count,
        )

        return Response(result)

    @scim_auth_required
    def post(self, request):
        """Create a new user."""
        scim_service = request.scim_service

        try:
            result = scim_service.create_user(
                request.data,
                ip_address=get_client_ip(request),
            )
            return Response(result, status=status.HTTP_201_CREATED)
        except SCIMError as e:
            return Response(e.to_response(), status=e.status)


@method_decorator(csrf_exempt, name="dispatch")
class SCIMUserDetailView(APIView):
    """SCIM /Users/{id} endpoint."""

    permission_classes = [AllowAny]

    @scim_auth_required
    def get(self, request, user_id):
        """Get a specific user."""
        scim_service = request.scim_service

        try:
            result = scim_service.get_user(user_id)
            return Response(result)
        except SCIMError as e:
            return Response(e.to_response(), status=e.status)

    @scim_auth_required
    def put(self, request, user_id):
        """Update a user."""
        scim_service = request.scim_service

        try:
            result = scim_service.update_user(
                user_id,
                request.data,
                ip_address=get_client_ip(request),
            )
            return Response(result)
        except SCIMError as e:
            return Response(e.to_response(), status=e.status)

    @scim_auth_required
    def patch(self, request, user_id):
        """Patch a user."""
        scim_service = request.scim_service

        operations = request.data.get("Operations", [])

        try:
            result = scim_service.patch_user(
                user_id,
                operations,
                ip_address=get_client_ip(request),
            )
            return Response(result)
        except SCIMError as e:
            return Response(e.to_response(), status=e.status)

    @scim_auth_required
    def delete(self, request, user_id):
        """Delete a user."""
        scim_service = request.scim_service

        try:
            scim_service.delete_user(user_id, ip_address=get_client_ip(request))
            return Response(status=status.HTTP_204_NO_CONTENT)
        except SCIMError as e:
            return Response(e.to_response(), status=e.status)


@method_decorator(csrf_exempt, name="dispatch")
class SCIMGroupsView(APIView):
    """SCIM /Groups endpoint."""

    permission_classes = [AllowAny]

    @scim_auth_required
    def get(self, request):
        """List groups."""
        scim_service = request.scim_service
        result = scim_service.list_groups()
        return Response(result)


@method_decorator(csrf_exempt, name="dispatch")
class SCIMGroupDetailView(APIView):
    """SCIM /Groups/{id} endpoint."""

    permission_classes = [AllowAny]

    @scim_auth_required
    def get(self, request, group_id):
        """Get a specific group."""
        scim_service = request.scim_service

        try:
            result = scim_service.get_group(group_id)
            return Response(result)
        except SCIMError as e:
            return Response(e.to_response(), status=e.status)


# ==================
# WebAuthn Views
# ==================


class PasskeyRegistrationOptionsView(APIView):
    """Get options for passkey registration."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        webauthn_service = WebAuthnService(request.user)

        options, challenge = webauthn_service.create_registration_options(
            user_verification=request.data.get("userVerification", "preferred"),
            authenticator_attachment=request.data.get("authenticatorAttachment"),
            require_resident_key=request.data.get("requireResidentKey", True),
        )

        return Response(options)


class PasskeyRegistrationVerifyView(APIView):
    """Verify passkey registration."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        webauthn_service = WebAuthnService(request.user)

        try:
            passkey = webauthn_service.verify_registration(
                challenge=request.data.get("challenge"),
                credential_id=request.data.get("credentialId"),
                public_key=request.data.get("publicKey"),
                attestation_object=request.data.get("attestationObject"),
                client_data_json=request.data.get("clientDataJSON"),
                name=request.data.get("name", "My Passkey"),
                transports=request.data.get("transports", []),
                ip_address=get_client_ip(request),
            )

            return Response(
                {
                    "id": str(passkey.id),
                    "name": passkey.name,
                    "createdAt": passkey.created_at.isoformat(),
                }
            )

        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class PasskeyAuthenticationOptionsView(APIView):
    """Get options for passkey authentication with rate limiting."""

    permission_classes = [AllowAny]
    throttle_classes = [PasskeyAuthThrottle]

    def post(self, request):
        # For discoverable credentials, user may not be known yet
        email = request.data.get("email")
        user = None

        if email:
            from apps.users.models import User

            user = User.objects.filter(email__iexact=email).first()

        webauthn_service = WebAuthnService(user)

        options, challenge = webauthn_service.create_authentication_options(
            user_verification=request.data.get("userVerification", "preferred"),
        )

        return Response(options)


class PasskeyAuthenticationVerifyView(APIView):
    """Verify passkey authentication with rate limiting."""

    permission_classes = [AllowAny]
    throttle_classes = [PasskeyAuthThrottle]

    def post(self, request):
        webauthn_service = WebAuthnService()

        try:
            user, passkey = webauthn_service.verify_authentication(
                challenge=request.data.get("challenge"),
                credential_id=request.data.get("credentialId"),
                authenticator_data=request.data.get("authenticatorData"),
                client_data_json=request.data.get("clientDataJSON"),
                signature=request.data.get("signature"),
                user_handle=request.data.get("userHandle"),
                ip_address=get_client_ip(request),
            )

            # Create JWT tokens and set auth cookies (same as regular login)
            from apps.users.jwt import create_jwt_tokens
            from apps.users.utils import set_auth_cookie
            from .services import SessionService

            # Create SSOSession for tracking
            session_service = SessionService(user)
            try:
                session, session_id = session_service.create_session(request)
            except Exception:
                session_id = None

            tokens = create_jwt_tokens(user)

            response = Response({"success": True})
            auth_cookies = {
                settings.ACCESS_TOKEN_COOKIE: tokens["access"],
                settings.REFRESH_TOKEN_COOKIE: tokens["refresh"],
            }
            if session_id:
                auth_cookies[settings.SESSION_ID_COOKIE] = session_id
            set_auth_cookie(response, auth_cookies)
            return response

        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class PasskeyListView(APIView):
    """List user's passkeys."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        webauthn_service = WebAuthnService(request.user)
        passkeys = webauthn_service.list_passkeys()

        return Response(
            [
                {
                    "id": str(p.id),
                    "name": p.name,
                    "authenticatorType": p.authenticator_type,
                    "createdAt": p.created_at.isoformat(),
                    "lastUsedAt": p.last_used_at.isoformat() if p.last_used_at else None,
                    "useCount": p.use_count,
                }
                for p in passkeys
            ]
        )


class TenantPasskeyListView(APIView):
    """
    List all passkeys for users in a tenant.
    Only accessible to tenant owners and admins.
    """

    permission_classes = [IsAuthenticated]
    throttle_classes = [SCIMApiThrottle]  # Reuse SCIM throttle for admin endpoints

    def get(self, request, tenant_id):
        from apps.multitenancy.models import Tenant, TenantMembership
        from graphql_relay import from_global_id
        from .models import UserPasskey

        # Decode tenant ID if it's a GraphQL global ID
        try:
            type_name, pk = from_global_id(tenant_id)
            if type_name and type_name != "":
                tenant_id = pk
        except Exception:
            pass

        try:
            tenant = Tenant.objects.get(pk=tenant_id)
        except Tenant.DoesNotExist:
            return Response({"error": "Tenant not found"}, status=status.HTTP_404_NOT_FOUND)

        # Check permissions
        try:
            membership = TenantMembership.objects.get(user=request.user, tenant=tenant)
            if not is_owner_or_admin(membership):
                return Response({"error": "Insufficient permissions"}, status=status.HTTP_403_FORBIDDEN)
        except TenantMembership.DoesNotExist:
            return Response({"error": "Not a member of this tenant"}, status=status.HTTP_403_FORBIDDEN)

        # Query parameters
        search = request.GET.get("search", "").strip().lower()

        # Get all members of the tenant
        tenant_members = TenantMembership.objects.filter(tenant=tenant).select_related("user")
        tenant_user_ids = [m.user_id for m in tenant_members]

        # Get all passkeys for tenant members
        passkeys = (
            UserPasskey.objects.filter(user_id__in=tenant_user_ids, is_active=True)
            .select_related("user")
            .order_by("-created_at")
        )

        # Filter by search term if provided
        if search:
            passkeys = passkeys.filter(
                models.Q(user__email__icontains=search)
                | models.Q(user__profile__first_name__icontains=search)
                | models.Q(user__profile__last_name__icontains=search)
                | models.Q(name__icontains=search)
            )

        return Response(
            [
                {
                    "id": str(p.id),
                    "name": p.name,
                    "authenticatorType": p.authenticator_type,
                    "createdAt": p.created_at.isoformat(),
                    "lastUsedAt": p.last_used_at.isoformat() if p.last_used_at else None,
                    "useCount": p.use_count,
                    "userEmail": p.user.email,
                    "userName": (
                        f"{getattr(p.user.profile, 'first_name', '')} {getattr(p.user.profile, 'last_name', '')}"
                    ).strip()
                    or p.user.email,
                }
                for p in passkeys
            ]
        )

    def delete(self, request, tenant_id, passkey_id=None):
        """Delete a passkey by owner/admin."""
        from apps.multitenancy.models import Tenant, TenantMembership
        from graphql_relay import from_global_id
        from .models import UserPasskey

        if not passkey_id:
            return Response({"error": "Passkey ID required"}, status=status.HTTP_400_BAD_REQUEST)

        # Decode tenant ID if it's a GraphQL global ID
        try:
            type_name, pk = from_global_id(tenant_id)
            if type_name and type_name != "":
                tenant_id = pk
        except Exception:
            pass

        try:
            tenant = Tenant.objects.get(pk=tenant_id)
        except Tenant.DoesNotExist:
            return Response({"error": "Tenant not found"}, status=status.HTTP_404_NOT_FOUND)

        # Check permissions
        try:
            membership = TenantMembership.objects.get(user=request.user, tenant=tenant)
            if not is_owner_or_admin(membership):
                return Response({"error": "Insufficient permissions"}, status=status.HTTP_403_FORBIDDEN)
        except TenantMembership.DoesNotExist:
            return Response({"error": "Not a member of this tenant"}, status=status.HTTP_403_FORBIDDEN)

        # Get the passkey
        try:
            passkey = UserPasskey.objects.get(pk=passkey_id, is_active=True)
        except UserPasskey.DoesNotExist:
            return Response({"error": "Passkey not found"}, status=status.HTTP_404_NOT_FOUND)

        # Verify the passkey belongs to a tenant member
        if not TenantMembership.objects.filter(tenant=tenant, user=passkey.user).exists():
            return Response({"error": "Passkey does not belong to a tenant member"}, status=status.HTTP_403_FORBIDDEN)

        # Log the deletion
        from .models import SSOAuditLog
        from .constants import SSOAuditEventType

        SSOAuditLog.log_event(
            event_type=SSOAuditEventType.PASSKEY_REMOVED,
            tenant=tenant,
            user=passkey.user,
            description=f'Passkey "{passkey.name}" removed by admin {request.user.email}',
            ip_address=get_client_ip(request),
            metadata={
                "removed_by": request.user.email,
                "passkey_owner": passkey.user.email,
            },
        )

        # Deactivate the passkey
        passkey.is_active = False
        passkey.save(update_fields=["is_active"])

        return Response(status=status.HTTP_204_NO_CONTENT)


class PasskeyDeleteView(APIView):
    """Delete a passkey."""

    permission_classes = [IsAuthenticated]

    def delete(self, request, passkey_id):
        webauthn_service = WebAuthnService(request.user)

        try:
            webauthn_service.delete_passkey(
                passkey_id,
                ip_address=get_client_ip(request),
            )
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ==================
# SSO Connection Management REST Views
# ==================


def decode_tenant_id(tenant_id):
    """
    Decode tenant ID - handles both raw IDs and GraphQL global IDs.
    """
    # Try to decode as GraphQL global ID
    try:
        type_name, pk = from_global_id(tenant_id)
        if type_name == "TenantType":
            return pk
    except Exception:
        pass
    # Return as-is if not a global ID
    return tenant_id


def is_owner_or_admin(membership):
    """
    Check if a membership has owner or admin privileges.
    Checks both legacy TenantMembership.role AND the new RBAC TenantMembershipRole system.

    Uses the same logic as the rest of the multitenancy permission system.
    """
    from apps.multitenancy.models import TenantMembershipRole
    from apps.multitenancy.constants import SystemRoleType

    # Check legacy role field
    if membership.role in [TenantUserRole.OWNER, TenantUserRole.ADMIN]:
        return True

    # Check new RBAC system - user has owner or admin role assigned
    has_admin_role = TenantMembershipRole.objects.filter(
        membership=membership,
        role__system_role_type__in=[SystemRoleType.OWNER, SystemRoleType.ADMIN],
    ).exists()

    return has_admin_role


def has_sso_permission(user, tenant, permission_code="security.sso.manage"):
    """
    Check if user has SSO management permission via the RBAC permission system.

    This is a convenience wrapper around the multitenancy permission system.
    Falls back to is_owner_or_admin for legacy compatibility.
    """
    from apps.multitenancy.models import user_has_permission, TenantMembership

    # First check RBAC permissions
    if user_has_permission(user, tenant, permission_code):
        return True

    # Fall back to legacy owner/admin check for backward compatibility
    membership = TenantMembership.objects.filter(user=user, tenant=tenant, is_accepted=True).first()
    return bool(membership and is_owner_or_admin(membership))


def get_tenant_and_check_access(request, tenant_id, require_admin=False):
    """
    Helper to get tenant and check user access.
    Returns (tenant, membership, error_response).
    """
    # Decode GraphQL global ID if needed
    decoded_id = decode_tenant_id(tenant_id)

    try:
        tenant = Tenant.objects.get(pk=decoded_id)
    except Tenant.DoesNotExist:
        return None, None, Response({"error": "Tenant not found"}, status=status.HTTP_404_NOT_FOUND)

    membership = TenantMembership.objects.filter(
        tenant=tenant,
        user=request.user,
    ).first()

    if not membership:
        return None, None, Response({"error": "Access denied"}, status=status.HTTP_403_FORBIDDEN)

    if require_admin and not is_owner_or_admin(membership):
        return (
            None,
            None,
            Response({"error": "Only owners and admins can manage SSO connections"}, status=status.HTTP_403_FORBIDDEN),
        )

    return tenant, membership, None


class SSOConnectionListView(APIView):
    """List and create SSO connections for a tenant."""

    permission_classes = [IsAuthenticated]

    def get(self, request, tenant_id):
        """List all SSO connections for the tenant."""
        tenant, membership, error = get_tenant_and_check_access(request, tenant_id)
        if error:
            return error

        connections = TenantSSOConnection.objects.filter(tenant=tenant).order_by("-created_at")

        return Response(
            [
                {
                    "id": str(conn.id),
                    "name": conn.name,
                    "connectionType": conn.connection_type,
                    "status": conn.status,
                    "isActive": conn.is_active,
                    "isSaml": conn.is_saml,
                    "isOidc": conn.is_oidc,
                    "allowedDomains": conn.allowed_domains,
                    "createdAt": conn.created_at.isoformat(),
                    "lastLoginAt": conn.last_login_at.isoformat() if conn.last_login_at else None,
                    "loginCount": conn.login_count,
                    "spMetadataUrl": conn.sp_metadata_url,
                    "spAcsUrl": conn.sp_acs_url,
                    "spEntityId": conn.sp_entity_id,
                    "oidcCallbackUrl": conn.oidc_callback_url,
                    "loginUrl": conn.login_url,
                }
                for conn in connections
            ]
        )

    def post(self, request, tenant_id):
        """Create a new SSO connection."""
        tenant, membership, error = get_tenant_and_check_access(request, tenant_id, require_admin=True)
        if error:
            return error

        data = request.data
        # SECURITY: Don't log raw POST data (may contain secrets)
        logger.info(f"SSO connection creation requested for tenant {tenant_id}")
        # Support both camelCase and snake_case (apiClient transforms to snake_case)
        connection_type = data.get("connection_type") or data.get("connectionType", "saml")
        logger.debug(f"SSO connection type: {connection_type}")

        # Parse allowed_domains (support both camelCase and snake_case)
        allowed_domains = data.get("allowed_domains") or data.get("allowedDomains", [])
        if isinstance(allowed_domains, str):
            # Handle comma-separated string input
            allowed_domains = [d.strip().lower() for d in allowed_domains.split(",") if d.strip()]
        elif isinstance(allowed_domains, list):
            allowed_domains = [d.strip().lower() for d in allowed_domains if isinstance(d, str) and d.strip()]
        else:
            allowed_domains = []

        try:
            connection = TenantSSOConnection.objects.create(
                tenant=tenant,
                name=data.get("name", "SSO Connection"),
                connection_type=connection_type,
                status=SSOConnectionStatus.DRAFT,
                allowed_domains=allowed_domains,
                # SAML fields (support both camelCase and snake_case)
                saml_entity_id=data.get("saml_entity_id") or data.get("samlEntityId", ""),
                saml_sso_url=data.get("saml_sso_url") or data.get("samlSsoUrl", ""),
                saml_certificate=data.get("saml_certificate") or data.get("samlCertificate", ""),
                # OIDC fields (support both camelCase and snake_case)
                oidc_issuer=data.get("oidc_issuer") or data.get("oidcIssuer", ""),
                oidc_client_id=data.get("oidc_client_id") or data.get("oidcClientId", ""),
                oidc_client_secret=data.get("oidc_client_secret") or data.get("oidcClientSecret", ""),
            )

            return Response(
                {
                    "id": str(connection.id),
                    "name": connection.name,
                    "connectionType": connection.connection_type,
                    "status": connection.status,
                    "allowedDomains": connection.allowed_domains,
                    "spMetadataUrl": connection.sp_metadata_url,
                    "spAcsUrl": connection.sp_acs_url,
                    "spEntityId": connection.sp_entity_id,
                    "oidcCallbackUrl": connection.oidc_callback_url,
                    "loginUrl": connection.login_url,
                    "createdAt": connection.created_at.isoformat(),
                },
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            # SECURITY: Log detailed error server-side, return generic message to client
            logger.error(f"Failed to create SSO connection: {e}", exc_info=True)
            return Response(
                {"error": "Failed to create SSO connection. Please check your configuration."},
                status=status.HTTP_400_BAD_REQUEST,
            )


class SSOConnectionDetailView(APIView):
    """Get, update, or delete an SSO connection."""

    permission_classes = [IsAuthenticated]

    def get(self, request, tenant_id, connection_id):
        """Get SSO connection details."""
        tenant, membership, error = get_tenant_and_check_access(request, tenant_id)
        if error:
            return error

        try:
            connection = TenantSSOConnection.objects.get(pk=connection_id, tenant=tenant)
        except TenantSSOConnection.DoesNotExist:
            return Response({"error": "Connection not found"}, status=status.HTTP_404_NOT_FOUND)

        return Response(
            {
                "id": str(connection.id),
                "name": connection.name,
                "connectionType": connection.connection_type,
                "status": connection.status,
                "isActive": connection.is_active,
                "isSaml": connection.is_saml,
                "isOidc": connection.is_oidc,
                "allowedDomains": connection.allowed_domains,
                "createdAt": connection.created_at.isoformat(),
                "lastLoginAt": connection.last_login_at.isoformat() if connection.last_login_at else None,
                "loginCount": connection.login_count,
                "spMetadataUrl": connection.sp_metadata_url,
                "spAcsUrl": connection.sp_acs_url,
                "spEntityId": connection.sp_entity_id,
                # SAML fields (only if SAML)
                "samlEntityId": connection.saml_entity_id if connection.is_saml else None,
                "samlSsoUrl": connection.saml_sso_url if connection.is_saml else None,
                # OIDC fields (only if OIDC)
                "oidcIssuer": connection.oidc_issuer if connection.is_oidc else None,
                "oidcClientId": connection.oidc_client_id if connection.is_oidc else None,
                "oidcCallbackUrl": connection.oidc_callback_url,
            }
        )

    def delete(self, request, tenant_id, connection_id):
        """Delete an SSO connection."""
        tenant, membership, error = get_tenant_and_check_access(request, tenant_id, require_admin=True)
        if error:
            return error

        try:
            connection = TenantSSOConnection.objects.get(pk=connection_id, tenant=tenant)
            connection.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except TenantSSOConnection.DoesNotExist:
            return Response({"error": "Connection not found"}, status=status.HTTP_404_NOT_FOUND)


class SSOConnectionActivateView(APIView):
    """Activate an SSO connection."""

    permission_classes = [IsAuthenticated]

    def post(self, request, tenant_id, connection_id):
        tenant, membership, error = get_tenant_and_check_access(request, tenant_id, require_admin=True)
        if error:
            return error

        try:
            connection = TenantSSOConnection.objects.get(pk=connection_id, tenant=tenant)
            connection.activate()
            return Response(
                {
                    "id": str(connection.id),
                    "status": connection.status,
                    "isActive": connection.is_active,
                }
            )
        except TenantSSOConnection.DoesNotExist:
            return Response({"error": "Connection not found"}, status=status.HTTP_404_NOT_FOUND)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class SSOConnectionDeactivateView(APIView):
    """Deactivate an SSO connection."""

    permission_classes = [IsAuthenticated]

    def post(self, request, tenant_id, connection_id):
        tenant, membership, error = get_tenant_and_check_access(request, tenant_id, require_admin=True)
        if error:
            return error

        try:
            connection = TenantSSOConnection.objects.get(pk=connection_id, tenant=tenant)
            connection.deactivate()
            return Response(
                {
                    "id": str(connection.id),
                    "status": connection.status,
                    "isActive": connection.is_active,
                }
            )
        except TenantSSOConnection.DoesNotExist:
            return Response({"error": "Connection not found"}, status=status.HTTP_404_NOT_FOUND)


class SSOConnectionTestView(APIView):
    """Test an SSO connection configuration."""

    permission_classes = [IsAuthenticated]

    def post(self, request, tenant_id, connection_id):
        """
        Test the SSO connection configuration.

        Returns a detailed report of configuration checks:
        - For SAML: entity ID, SSO URL reachability, certificate validity
        - For OIDC: issuer, discovery endpoint, required endpoints
        """
        import requests
        from datetime import datetime
        from cryptography import x509
        from cryptography.hazmat.backends import default_backend

        tenant, membership, error = get_tenant_and_check_access(request, tenant_id, require_admin=True)
        if error:
            return error

        try:
            connection = TenantSSOConnection.objects.get(pk=connection_id, tenant=tenant)
        except TenantSSOConnection.DoesNotExist:
            return Response({"error": "Connection not found"}, status=status.HTTP_404_NOT_FOUND)

        checks = []
        overall_status = "success"  # success, warning, error

        def add_check(name, status, message, details=None):
            nonlocal overall_status
            check = {
                "name": name,
                "status": status,  # success, warning, error
                "message": message,
            }
            if details:
                check["details"] = details
            checks.append(check)

            # Update overall status
            if status == "error":
                overall_status = "error"
            elif status == "warning" and overall_status != "error":
                overall_status = "warning"

        if connection.is_saml:
            # SAML Configuration Checks

            # 1. Check Entity ID
            if connection.saml_entity_id:
                add_check(
                    "IdP Entity ID",
                    "success",
                    "Identity Provider Entity ID is configured",
                    {
                        "value": (
                            connection.saml_entity_id[:100] + "..."
                            if len(connection.saml_entity_id) > 100
                            else connection.saml_entity_id
                        )
                    },
                )
            else:
                add_check("IdP Entity ID", "error", "Identity Provider Entity ID is not configured")

            # 2. Check SSO URL
            if connection.saml_sso_url:
                add_check(
                    "SSO URL Format", "success", "Single Sign-On URL is configured", {"value": connection.saml_sso_url}
                )

                # Try to reach the SSO URL (HEAD request with timeout)
                try:
                    resp = requests.head(connection.saml_sso_url, timeout=10, allow_redirects=True)
                    if resp.status_code < 400:
                        add_check(
                            "SSO URL Reachable", "success", f"SSO endpoint is reachable (HTTP {resp.status_code})"
                        )
                    elif resp.status_code == 405:
                        # Method not allowed is OK - endpoint exists but doesn't accept HEAD
                        add_check(
                            "SSO URL Reachable",
                            "success",
                            "SSO endpoint exists (returned 405 - expected for SAML endpoints)",
                        )
                    else:
                        add_check(
                            "SSO URL Reachable",
                            "warning",
                            f"SSO endpoint returned HTTP {resp.status_code}",
                            {"hint": "The endpoint might still work for SAML requests"},
                        )
                except requests.exceptions.Timeout:
                    add_check(
                        "SSO URL Reachable",
                        "warning",
                        "Connection timed out when reaching SSO endpoint",
                        {"hint": "The IdP might be behind a firewall or slow to respond"},
                    )
                except requests.exceptions.SSLError as e:
                    add_check(
                        "SSO URL Reachable",
                        "error",
                        "SSL/TLS error when connecting to SSO endpoint",
                        {"error": str(e)[:200]},
                    )
                except requests.exceptions.RequestException as e:
                    add_check(
                        "SSO URL Reachable", "error", "Failed to connect to SSO endpoint", {"error": str(e)[:200]}
                    )
            else:
                add_check("SSO URL Format", "error", "Single Sign-On URL is not configured")

            # 3. Check Certificate
            cert_pem = connection.saml_certificate
            if cert_pem:
                try:
                    # Parse certificate
                    if "-----BEGIN CERTIFICATE-----" not in cert_pem:
                        cert_pem = f"-----BEGIN CERTIFICATE-----\n{cert_pem}\n-----END CERTIFICATE-----"

                    cert = x509.load_pem_x509_certificate(cert_pem.encode(), default_backend())

                    # Check expiration
                    now = datetime.utcnow()
                    expires = (
                        cert.not_valid_after_utc.replace(tzinfo=None)
                        if hasattr(cert.not_valid_after_utc, "replace")
                        else cert.not_valid_after
                    )
                    if hasattr(expires, "replace"):
                        expires = expires.replace(tzinfo=None)

                    days_until_expiry = (expires - now).days

                    if days_until_expiry < 0:
                        add_check(
                            "IdP Certificate",
                            "error",
                            f"Certificate expired {abs(days_until_expiry)} days ago",
                            {"expires": str(expires)},
                        )
                    elif days_until_expiry < 30:
                        add_check(
                            "IdP Certificate",
                            "warning",
                            f"Certificate expires in {days_until_expiry} days",
                            {"expires": str(expires), "hint": "Consider renewing the certificate soon"},
                        )
                    else:
                        add_check(
                            "IdP Certificate",
                            "success",
                            f"Certificate is valid (expires in {days_until_expiry} days)",
                            {"expires": str(expires)},
                        )
                except Exception as e:
                    add_check(
                        "IdP Certificate",
                        "error",
                        "Failed to parse certificate",
                        {"error": str(e)[:200], "hint": "Ensure the certificate is in valid PEM or base64 format"},
                    )
            else:
                add_check(
                    "IdP Certificate",
                    "warning",
                    "IdP certificate is not configured",
                    {"hint": "Certificate is recommended for signature validation"},
                )

            # 4. Check SP Configuration
            sp_entity_id = connection.sp_entity_id
            sp_acs_url = connection.sp_acs_url

            if sp_entity_id and sp_acs_url:
                # Check if using localhost (won't work with external IdPs)
                is_localhost = "localhost" in sp_acs_url or "127.0.0.1" in sp_acs_url
                if is_localhost:
                    add_check(
                        "SP Configuration",
                        "error",
                        "Service Provider URLs are using localhost - external IdPs cannot reach these URLs",
                        {
                            "entityId": sp_entity_id,
                            "acsUrl": sp_acs_url,
                            "hint": "Set the API_URL environment variable to your public API domain (e.g., https://api.yourapp.com)",
                        },
                    )
                else:
                    add_check(
                        "SP Configuration",
                        "success",
                        "Service Provider URLs are configured",
                        {"entityId": sp_entity_id, "acsUrl": sp_acs_url},
                    )
            else:
                add_check("SP Configuration", "warning", "Service Provider configuration may be incomplete")

            # 5. Verify SAML AuthnRequest can be generated
            try:
                from .services import SAMLService

                saml_service = SAMLService(connection)
                # Try generating a test request (won't actually redirect)
                test_url, test_id = saml_service.create_authn_request(relay_state="/test")
                if test_url and test_id:
                    add_check(
                        "SAML Request Generation",
                        "success",
                        "SAML AuthnRequest can be generated successfully",
                        {"requestIdFormat": test_id[:10] + "..."},
                    )
            except Exception as e:
                add_check(
                    "SAML Request Generation", "error", "Failed to generate SAML AuthnRequest", {"error": str(e)[:200]}
                )

        elif connection.is_oidc:
            # OIDC Configuration Checks

            # 1. Check Issuer
            if connection.oidc_issuer:
                add_check("OIDC Issuer", "success", "Issuer URL is configured", {"value": connection.oidc_issuer})

                # Try to fetch .well-known/openid-configuration
                discovery_url = connection.oidc_issuer.rstrip("/") + "/.well-known/openid-configuration"
                try:
                    resp = requests.get(discovery_url, timeout=10)
                    if resp.status_code == 200:
                        try:
                            config = resp.json()
                            add_check(
                                "OIDC Discovery",
                                "success",
                                "OpenID Connect discovery endpoint is accessible",
                                {"discoveredEndpoints": len(config.keys())},
                            )

                            # Check required endpoints
                            required = ["authorization_endpoint", "token_endpoint"]
                            missing = [ep for ep in required if ep not in config]

                            if missing:
                                add_check(
                                    "Required Endpoints",
                                    "warning",
                                    f"Missing endpoints in discovery: {', '.join(missing)}",
                                )
                            else:
                                add_check(
                                    "Required Endpoints",
                                    "success",
                                    "All required OIDC endpoints are present",
                                    {
                                        "authorization": config.get("authorization_endpoint", "")[:80],
                                        "token": config.get("token_endpoint", "")[:80],
                                    },
                                )
                        except ValueError:
                            add_check("OIDC Discovery", "error", "Discovery endpoint returned invalid JSON")
                    else:
                        add_check(
                            "OIDC Discovery",
                            "warning",
                            f"Discovery endpoint returned HTTP {resp.status_code}",
                            {"hint": "Some IdPs may not support automatic discovery"},
                        )
                except requests.exceptions.Timeout:
                    add_check("OIDC Discovery", "warning", "Connection timed out when fetching discovery document")
                except requests.exceptions.SSLError as e:
                    add_check(
                        "OIDC Discovery", "error", "SSL/TLS error when connecting to issuer", {"error": str(e)[:200]}
                    )
                except requests.exceptions.RequestException as e:
                    add_check(
                        "OIDC Discovery",
                        "warning",
                        "Could not fetch discovery document",
                        {"error": str(e)[:200], "hint": "Manual endpoint configuration may be required"},
                    )
            else:
                add_check("OIDC Issuer", "error", "Issuer URL is not configured")

            # 2. Check Client ID
            if connection.oidc_client_id:
                add_check(
                    "Client ID",
                    "success",
                    "OAuth Client ID is configured",
                    {
                        "value": (
                            connection.oidc_client_id[:20] + "..."
                            if len(connection.oidc_client_id) > 20
                            else connection.oidc_client_id
                        )
                    },
                )
            else:
                add_check("Client ID", "error", "OAuth Client ID is not configured")

            # 3. Check Client Secret
            if connection.oidc_client_secret or connection.oidc_client_secret_arn:
                add_check("Client Secret", "success", "OAuth Client Secret is configured")
            else:
                add_check("Client Secret", "error", "OAuth Client Secret is not configured")

            # 4. Check Callback URL
            callback_url = connection.oidc_callback_url
            if callback_url:
                # Check if using localhost (won't work with external IdPs)
                is_localhost = "localhost" in callback_url or "127.0.0.1" in callback_url
                if is_localhost:
                    add_check(
                        "Callback URL",
                        "error",
                        "Callback URL is using localhost - external IdPs cannot reach this URL",
                        {
                            "value": callback_url,
                            "hint": "Set the API_URL environment variable to your public API domain (e.g., https://api.yourapp.com)",
                        },
                    )
                else:
                    add_check("Callback URL", "success", "OAuth callback URL is configured", {"value": callback_url})
            else:
                add_check("Callback URL", "warning", "Callback URL configuration may be incomplete")

        # Check API_URL configuration (applies to both SAML and OIDC)
        api_url = getattr(settings, "API_URL", None)
        is_localhost_api = api_url and ("localhost" in api_url or "127.0.0.1" in api_url)

        if api_url and not is_localhost_api:
            add_check("API URL", "success", "API URL is configured for production", {"value": api_url})
        elif is_localhost_api:
            add_check(
                "API URL",
                "error",
                "API URL is set to localhost - SSO will not work with external identity providers",
                {
                    "value": api_url,
                    "hint": "Set API_URL environment variable to your public API domain (e.g., https://api.yourapp.com)",
                },
            )
        else:
            add_check(
                "API URL",
                "error",
                "API_URL environment variable is not set",
                {"hint": "This will cause SSO redirects to fail. Set API_URL to your public API domain."},
            )

        return Response(
            {
                "connectionId": str(connection.id),
                "connectionName": connection.name,
                "connectionType": connection.connection_type,
                "overallStatus": overall_status,
                "checks": checks,
                "testedAt": timezone.now().isoformat(),
            }
        )


# ==================
# SSO Discovery (for login page)
# ==================


class SSODiscoverView(APIView):
    """
    Discover SSO options for a given email domain.
    Used on the login page to show SSO options to users.

    Rate limited to prevent email enumeration attacks.
    """

    permission_classes = [AllowAny]
    throttle_classes = [SSODiscoveryThrottle]

    def get(self, request):
        """
        Check if SSO is available for the given email domain.

        Query params:
            - email: User's email address

        Returns:
            - sso_available: Whether SSO is configured for this domain
            - connections: List of available SSO connections (if any)
            - require_sso: Whether SSO is required (no password login allowed)
        """
        email = request.GET.get("email", "").strip().lower()

        if not email or "@" not in email:
            return Response(
                {
                    "sso_available": False,
                    "connections": [],
                    "require_sso": False,
                }
            )

        domain = email.split("@")[1]

        # Find active SSO connections that allow this domain
        connections = (
            TenantSSOConnection.objects.filter(
                status=SSOConnectionStatus.ACTIVE,
            )
            .filter(
                # Check if domain is allowed
                # Empty allowed_domains means all domains allowed for that tenant
                models.Q(allowed_domains__contains=[domain])
                | models.Q(allowed_domains=[])
                | models.Q(allowed_domains__isnull=True)
            )
            .select_related("tenant")
        )

        # SECURITY: Filter by domain configuration ONLY to prevent email enumeration
        # Do NOT check for existing users - this would leak account existence information
        matching_connections = []
        for conn in connections:
            # Check if tenant has this domain configured
            tenant_domains = getattr(conn.tenant, "domains", None)
            domain_matches = tenant_domains and domain in tenant_domains
            allowed_matches = conn.allowed_domains and domain in conn.allowed_domains
            if domain_matches or allowed_matches:
                matching_connections.append(conn)

        # Remove duplicates while preserving order
        seen_ids = set()
        unique_connections = []
        for conn in matching_connections:
            if conn.id not in seen_ids:
                seen_ids.add(conn.id)
                unique_connections.append(conn)

        if not unique_connections:
            return Response(
                {
                    "sso_available": False,
                    "connections": [],
                    "require_sso": False,
                }
            )

        # Check if any connection requires SSO (no password fallback)
        require_sso = any(getattr(conn, "enforce_sso", False) for conn in unique_connections)

        return Response(
            {
                "sso_available": True,
                "require_sso": require_sso,
                "connections": [
                    {
                        "id": str(conn.id),
                        "name": conn.name,
                        "type": conn.connection_type,
                        "tenant_id": str(conn.tenant.id),
                        "tenant_name": conn.tenant.name,
                        "login_url": f"/api/sso/{conn.connection_type}/{conn.id}/login",
                    }
                    for conn in unique_connections
                ],
            }
        )


class SSOLoginOptionsView(APIView):
    """
    Get available SSO login options without requiring email.
    Used for "Sign in with SSO" button flow.
    """

    permission_classes = [AllowAny]

    def get(self, request):
        """
        Get list of all public SSO connections.
        Only returns connections that have been marked as publicly visible.
        """
        # In most cases, users will enter their email first
        # This endpoint is for cases where SSO discovery by email isn't used
        return Response(
            {
                "message": "Please enter your work email to discover SSO options.",
                "flow": "email_discovery",
            }
        )


# ==================
# Audit Log Views
# ==================


class AuditLogListView(APIView):
    """
    List audit logs for a tenant.
    Only accessible to tenant owners and admins.

    Query Parameters:
        - limit: Max number of results (default 50, max 500)
        - offset: Pagination offset (default 0)
        - page: Page number (alternative to offset, 1-indexed)
        - event_type: Filter by event type
        - user_email: Filter by user email (partial match)
        - success: Filter by success status ('true', 'false', or omit for all)
        - start_date: Filter by start date (ISO format: YYYY-MM-DD)
        - end_date: Filter by end date (ISO format: YYYY-MM-DD)
        - search: Search in event description
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, tenant_id):
        from datetime import datetime, timedelta
        from apps.multitenancy.models import Tenant, TenantMembership
        from graphql_relay import from_global_id

        # Decode tenant ID if it's a GraphQL global ID
        try:
            type_name, pk = from_global_id(tenant_id)
            if type_name and type_name != "":
                tenant_id = pk
        except Exception:
            pass

        try:
            tenant = Tenant.objects.get(pk=tenant_id)
        except Tenant.DoesNotExist:
            return Response({"error": "Tenant not found"}, status=status.HTTP_404_NOT_FOUND)

        # Check permissions
        try:
            membership = TenantMembership.objects.get(user=request.user, tenant=tenant)
            if not is_owner_or_admin(membership):
                return Response({"error": "Insufficient permissions"}, status=status.HTTP_403_FORBIDDEN)
        except TenantMembership.DoesNotExist:
            return Response({"error": "Not a member of this tenant"}, status=status.HTTP_403_FORBIDDEN)

        # Query parameters
        limit = min(int(request.GET.get("limit", 50)), 500)
        page = request.GET.get("page")
        if page:
            page = max(1, int(page))
            offset = (page - 1) * limit
        else:
            offset = int(request.GET.get("offset", 0))

        event_type = request.GET.get("event_type", "").strip()
        user_email = request.GET.get("user_email", "").strip()
        success_param = request.GET.get("success", "").strip().lower()
        start_date = request.GET.get("start_date", "").strip()
        end_date = request.GET.get("end_date", "").strip()
        search = request.GET.get("search", "").strip()

        # Build base query
        logs = SSOAuditLog.objects.filter(tenant=tenant).select_related("user", "sso_connection")

        # Apply date range filter
        if start_date:
            try:
                start_dt = datetime.fromisoformat(start_date)
                logs = logs.filter(created_at__gte=start_dt)
            except ValueError:
                pass

        if end_date:
            try:
                # Include the entire end date by adding 1 day
                end_dt = datetime.fromisoformat(end_date) + timedelta(days=1)
                logs = logs.filter(created_at__lt=end_dt)
            except ValueError:
                pass

        # If no date range specified, default to last 90 days for performance
        if not start_date and not end_date:
            default_cutoff = timezone.now() - timedelta(days=90)
            logs = logs.filter(created_at__gte=default_cutoff)

        # Apply event type filter
        if event_type:
            logs = logs.filter(event_type=event_type)

        # Apply user email filter (partial match)
        if user_email:
            logs = logs.filter(user__email__icontains=user_email)

        # Apply success filter
        if success_param == "true":
            logs = logs.filter(success=True)
        elif success_param == "false":
            logs = logs.filter(success=False)

        # Apply search filter
        if search:
            logs = logs.filter(
                models.Q(event_description__icontains=search)
                | models.Q(user__email__icontains=search)
                | models.Q(ip_address__icontains=search)
            )

        # Order by created_at descending
        logs = logs.order_by("-created_at")

        # Get total count for pagination
        total_count = logs.count()
        total_pages = (total_count + limit - 1) // limit  # Ceiling division
        current_page = (offset // limit) + 1

        # Apply pagination
        logs = logs[offset : offset + limit]

        # Serialize logs
        log_data = []
        for log in logs:
            log_data.append(
                {
                    "id": str(log.id),
                    "eventType": log.event_type,
                    "eventDescription": log.event_description,
                    "userEmail": log.user.email if log.user else None,
                    "connectionName": log.sso_connection.name if log.sso_connection else None,
                    "ipAddress": log.ip_address,
                    "userAgent": log.user_agent,
                    "success": log.success,
                    "errorMessage": log.error_message,
                    "metadata": log.metadata,
                    "createdAt": log.created_at.isoformat(),
                }
            )

        # Get unique users and event types for filter options
        # Only do this if explicitly requested to avoid performance hit
        include_filter_options = request.GET.get("include_filter_options", "false").lower() == "true"
        filter_options = {}

        if include_filter_options:
            # Get unique event types
            event_types = SSOAuditLog.objects.filter(tenant=tenant).values_list("event_type", flat=True).distinct()
            filter_options["eventTypes"] = list(event_types)

            # Get unique user emails
            user_emails = (
                SSOAuditLog.objects.filter(tenant=tenant, user__isnull=False)
                .values_list("user__email", flat=True)
                .distinct()[:100]
            )
            filter_options["userEmails"] = list(user_emails)

        return Response(
            {
                "logs": log_data,
                "totalCount": total_count,
                "totalPages": total_pages,
                "currentPage": current_page,
                "pageSize": limit,
                "hasMore": offset + limit < total_count,
                "hasPrevious": offset > 0,
                **filter_options,
            }
        )


# ==================
# SCIM Token Views
# ==================


class SCIMTokenListView(APIView):
    """
    List and create SCIM tokens for a tenant.
    Only accessible to tenant owners and admins.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, tenant_id):
        from apps.multitenancy.models import Tenant, TenantMembership
        from graphql_relay import from_global_id

        # Decode tenant ID if it's a GraphQL global ID
        try:
            type_name, pk = from_global_id(tenant_id)
            if type_name and type_name != "":
                tenant_id = pk
        except Exception:
            pass

        try:
            tenant = Tenant.objects.get(pk=tenant_id)
        except Tenant.DoesNotExist:
            return Response({"error": "Tenant not found"}, status=status.HTTP_404_NOT_FOUND)

        # Check permissions
        try:
            membership = TenantMembership.objects.get(user=request.user, tenant=tenant)
            if not is_owner_or_admin(membership):
                return Response({"error": "Insufficient permissions"}, status=status.HTTP_403_FORBIDDEN)
        except TenantMembership.DoesNotExist:
            return Response({"error": "Not a member of this tenant"}, status=status.HTTP_403_FORBIDDEN)

        # Get SCIM tokens (only active by default)
        include_revoked = request.GET.get("include_revoked", "false").lower() == "true"
        tokens = SCIMToken.objects.filter(tenant=tenant).order_by("-created_at")

        if not include_revoked:
            tokens = tokens.filter(is_active=True)

        return Response(
            [
                {
                    "id": str(t.id),
                    "name": t.name,
                    "tokenPrefix": t.token_prefix,
                    "isActive": t.is_active,
                    "createdAt": t.created_at.isoformat(),
                    "lastUsedAt": t.last_used_at.isoformat() if t.last_used_at else None,
                    "requestCount": t.request_count,
                }
                for t in tokens
            ]
        )

    def post(self, request, tenant_id):
        import secrets
        import hashlib
        from apps.multitenancy.models import Tenant, TenantMembership
        from graphql_relay import from_global_id

        # Decode tenant ID if it's a GraphQL global ID
        try:
            type_name, pk = from_global_id(tenant_id)
            if type_name and type_name != "":
                tenant_id = pk
        except Exception:
            pass

        try:
            tenant = Tenant.objects.get(pk=tenant_id)
        except Tenant.DoesNotExist:
            return Response({"error": "Tenant not found"}, status=status.HTTP_404_NOT_FOUND)

        # Check permissions
        try:
            membership = TenantMembership.objects.get(user=request.user, tenant=tenant)
            if not is_owner_or_admin(membership):
                return Response({"error": "Insufficient permissions"}, status=status.HTTP_403_FORBIDDEN)
        except TenantMembership.DoesNotExist:
            return Response({"error": "Not a member of this tenant"}, status=status.HTTP_403_FORBIDDEN)

        # Check if there's an active SSO connection
        active_connections = TenantSSOConnection.objects.filter(tenant=tenant, status=SSOConnectionStatus.ACTIVE)
        if not active_connections.exists():
            return Response(
                {"error": "An active SSO connection is required to create SCIM tokens"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        name = request.data.get("name", "SCIM Token")

        # Generate token
        raw_token = secrets.token_urlsafe(48)
        token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
        token_prefix = raw_token[:8]

        # Create token
        token = SCIMToken.objects.create(
            tenant=tenant,
            sso_connection=active_connections.first(),
            name=name,
            token_hash=token_hash,
            token_prefix=token_prefix,
        )

        # Log the creation
        SSOAuditLog.log_event(
            event_type=SSOAuditEventType.IDP_CONFIG_UPDATED,
            tenant=tenant,
            user=request.user,
            description=f'SCIM token "{name}" created',
            ip_address=get_client_ip(request),
        )

        return Response(
            {
                "id": str(token.id),
                "name": token.name,
                "token": raw_token,  # Only returned once!
                "tokenPrefix": token_prefix,
                "createdAt": token.created_at.isoformat(),
                "endpointUrl": "/api/sso/scim/v2",
            },
            status=status.HTTP_201_CREATED,
        )


class SCIMTokenDetailView(APIView):
    """Delete a SCIM token."""

    permission_classes = [IsAuthenticated]

    def delete(self, request, tenant_id, token_id):
        from apps.multitenancy.models import Tenant, TenantMembership
        from graphql_relay import from_global_id

        # Decode tenant ID if it's a GraphQL global ID
        try:
            type_name, pk = from_global_id(tenant_id)
            if type_name and type_name != "":
                tenant_id = pk
        except Exception:
            pass

        try:
            tenant = Tenant.objects.get(pk=tenant_id)
        except Tenant.DoesNotExist:
            return Response({"error": "Tenant not found"}, status=status.HTTP_404_NOT_FOUND)

        # Check permissions
        try:
            membership = TenantMembership.objects.get(user=request.user, tenant=tenant)
            if not is_owner_or_admin(membership):
                return Response({"error": "Insufficient permissions"}, status=status.HTTP_403_FORBIDDEN)
        except TenantMembership.DoesNotExist:
            return Response({"error": "Not a member of this tenant"}, status=status.HTTP_403_FORBIDDEN)

        try:
            token = SCIMToken.objects.get(pk=token_id, tenant=tenant)
        except SCIMToken.DoesNotExist:
            return Response({"error": "Token not found"}, status=status.HTTP_404_NOT_FOUND)

        token_name = token.name
        token.is_active = False
        token.save(update_fields=["is_active"])

        # Log the revocation
        SSOAuditLog.log_event(
            event_type=SSOAuditEventType.IDP_CONFIG_UPDATED,
            tenant=tenant,
            user=request.user,
            description=f'SCIM token "{token_name}" revoked',
            ip_address=get_client_ip(request),
        )

        return Response(status=status.HTTP_204_NO_CONTENT)
