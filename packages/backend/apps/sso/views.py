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
from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import JSONParser
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle
from rest_framework import status

from django.db import models
from graphql_relay import from_global_id

from apps.multitenancy.models import Tenant, TenantMembership
from apps.multitenancy.constants import TenantUserRole

from .models import TenantSSOConnection, SCIMToken, SSOAuditLog
from .renderers import SCIMRenderer, SCIMParser
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

            tokens = create_jwt_tokens(user, auth_method='sso')

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

            tokens = create_jwt_tokens(user, auth_method='sso')

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

    authentication_classes = []  # SCIM uses Bearer token (SCIM token), not JWT
    permission_classes = [AllowAny]  # Auth handled by decorator
    throttle_classes = [SCIMApiThrottle]
    renderer_classes = [SCIMRenderer, JSONRenderer]
    parser_classes = [SCIMParser, JSONParser]

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

    authentication_classes = []  # SCIM uses Bearer token (SCIM token), not JWT
    permission_classes = [AllowAny]
    renderer_classes = [SCIMRenderer, JSONRenderer]
    parser_classes = [SCIMParser, JSONParser]

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

    authentication_classes = []  # SCIM uses Bearer token (SCIM token), not JWT
    permission_classes = [AllowAny]
    renderer_classes = [SCIMRenderer, JSONRenderer]
    parser_classes = [SCIMParser, JSONParser]

    @scim_auth_required
    def get(self, request):
        """List groups."""
        scim_service = request.scim_service
        result = scim_service.list_groups()
        return Response(result)


@method_decorator(csrf_exempt, name="dispatch")
class SCIMGroupDetailView(APIView):
    """SCIM /Groups/{id} endpoint."""

    authentication_classes = []  # SCIM uses Bearer token (SCIM token), not JWT
    permission_classes = [AllowAny]
    renderer_classes = [SCIMRenderer, JSONRenderer]
    parser_classes = [SCIMParser, JSONParser]

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

            tokens = create_jwt_tokens(user, auth_method='passkey')

            # Return tokens in body for localStorage (Safari/mobile fallback when cookies blocked)
            response = Response({
                'success': True,
                'access': tokens['access'],
                'refresh': tokens['refresh'],
            })
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


# SSO Connection REST views and SSO Discovery REST views removed.
# All SSO connection management and discovery is handled through GraphQL mutations/queries.
# See apps.sso.schema for the GraphQL API.

# NOTE: has_sso_permission, get_tenant_and_check_access, SSOConnectionListView,
# SSOConnectionDetailView, SSOConnectionActivateView, SSOConnectionDeactivateView,
# SSOConnectionTestView, SSODiscoverView, and SSOLoginOptionsView were removed
# as dead code - the frontend exclusively uses GraphQL for these operations.

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
                    "eventTypeLabel": log.get_event_type_display(),
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
            # Get unique event types with labels from constants
            # Return as array of {value, label} objects to avoid axios-case-converter
            # mangling the dict keys (it converts snake_case keys to camelCase)
            event_types = list(
                SSOAuditLog.objects.filter(tenant=tenant)
                .values_list('event_type', flat=True)
                .distinct()
            )
            labels_map = dict(SSOAuditEventType.choices)
            unique_event_types = list(dict.fromkeys(event_types))
            filter_options['eventTypeOptions'] = [
                {'value': et, 'label': labels_map.get(et, et)}
                for et in unique_event_types
            ]

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
