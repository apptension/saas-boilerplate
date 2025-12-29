"""
SSO Views for SAML, OIDC, SCIM, and WebAuthn endpoints.
"""

import json
import logging
from functools import wraps

from django.conf import settings
from django.http import HttpResponse, JsonResponse, HttpResponseRedirect
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.utils import timezone
from django.core.cache import cache
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status

from django.db import models
from .models import TenantSSOConnection, SCIMToken, SSOAuditLog
from .constants import SSOConnectionStatus, SSOAuditEventType
from .services import SAMLService, OIDCService, SCIMService, WebAuthnService
from .services.scim import SCIMError
from .services.provisioning import JITProvisioningService

logger = logging.getLogger(__name__)


def get_client_ip(request):
    """Get client IP from request."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


# ==================
# SAML Views
# ==================


class SAMLMetadataView(View):
    """Serve SP metadata for SAML configuration."""

    def get(self, request, connection_id):
        try:
            connection = TenantSSOConnection.objects.get(
                pk=connection_id,
                connection_type='saml',
            )
        except TenantSSOConnection.DoesNotExist:
            return HttpResponse('Not found', status=404)

        saml_service = SAMLService(connection)
        metadata = saml_service.generate_sp_metadata()

        return HttpResponse(
            metadata,
            content_type='application/xml',
        )


class SAMLLoginView(View):
    """Initiate SAML SSO login."""

    def get(self, request, connection_id):
        try:
            connection = TenantSSOConnection.objects.get(
                pk=connection_id,
                connection_type='saml',
                status=SSOConnectionStatus.ACTIVE,
            )
        except TenantSSOConnection.DoesNotExist:
            return HttpResponse('SSO connection not found or inactive', status=404)

        # Store relay state (return URL)
        relay_state = request.GET.get('next', '/')

        saml_service = SAMLService(connection)
        redirect_url, request_id = saml_service.create_authn_request(
            relay_state=relay_state,
        )

        # Store request ID for validation
        cache.set(
            f'saml_request_{request_id}',
            {
                'connection_id': str(connection_id),
                'relay_state': relay_state,
            },
            timeout=600,
        )  # 10 minutes

        SSOAuditLog.log_event(
            event_type=SSOAuditEventType.SSO_LOGIN_INITIATED,
            tenant=connection.tenant,
            sso_connection=connection,
            description='SAML login initiated',
            ip_address=get_client_ip(request),
        )

        return HttpResponseRedirect(redirect_url)


@method_decorator(csrf_exempt, name='dispatch')
class SAMLACSView(View):
    """SAML Assertion Consumer Service - handles SAML responses."""

    def post(self, request, connection_id):
        try:
            connection = TenantSSOConnection.objects.get(
                pk=connection_id,
                connection_type='saml',
            )
        except TenantSSOConnection.DoesNotExist:
            return HttpResponse('Not found', status=404)

        saml_response = request.POST.get('SAMLResponse')
        relay_state = request.POST.get('RelayState', '/')

        if not saml_response:
            return HttpResponse('Missing SAMLResponse', status=400)

        saml_service = SAMLService(connection)

        try:
            # Parse and validate SAML response
            user_attrs = saml_service.parse_saml_response(saml_response)

            # Provision or update user
            provisioning_service = JITProvisioningService(connection)
            user, sso_link, is_new = provisioning_service.provision_or_update_user(
                idp_user_id=user_attrs.get('name_id', user_attrs.get('email')),
                email=user_attrs.get('email'),
                first_name=user_attrs.get('first_name', ''),
                last_name=user_attrs.get('last_name', ''),
                groups=user_attrs.get('groups', []),
                raw_attributes=user_attrs.get('raw_attributes', {}),
                ip_address=get_client_ip(request),
            )

            # Create session and set auth cookies (same as regular login)
            from apps.users.jwt import create_jwt_tokens
            from apps.users.utils import set_auth_cookie

            tokens = create_jwt_tokens(user)

            # Build redirect URL
            web_app_url = getattr(settings, 'WEB_APP_URL', 'http://localhost:3000')
            next_url = relay_state if relay_state and relay_state != '/' else '/en/'
            redirect_url = f"{web_app_url}{next_url}"

            SSOAuditLog.log_event(
                event_type=SSOAuditEventType.SSO_LOGIN_SUCCESS,
                tenant=connection.tenant,
                user=user,
                sso_connection=connection,
                description=f'SAML login successful for {user.email}',
                ip_address=get_client_ip(request),
            )

            # Create redirect response and set auth cookies
            response = HttpResponseRedirect(redirect_url)
            set_auth_cookie(
                response,
                {
                    settings.ACCESS_TOKEN_COOKIE: tokens['access'],
                    settings.REFRESH_TOKEN_COOKIE: tokens['refresh'],
                },
            )
            return response

        except Exception as e:
            logger.error(f"SAML authentication failed: {e}")

            SSOAuditLog.log_event(
                event_type=SSOAuditEventType.SSO_LOGIN_FAILED,
                tenant=connection.tenant,
                sso_connection=connection,
                description='SAML login failed',
                error_message=str(e),
                ip_address=get_client_ip(request),
                success=False,
            )

            web_app_url = getattr(settings, 'WEB_APP_URL', 'http://localhost:3000')
            return HttpResponseRedirect(f"{web_app_url}/en/auth/sso/error?message=Authentication failed")


# ==================
# OIDC Views
# ==================


class OIDCLoginView(View):
    """Initiate OIDC SSO login."""

    def get(self, request, connection_id):
        try:
            connection = TenantSSOConnection.objects.get(
                pk=connection_id,
                connection_type='oidc',
                status=SSOConnectionStatus.ACTIVE,
            )
        except TenantSSOConnection.DoesNotExist:
            return HttpResponse('SSO connection not found or inactive', status=404)

        oidc_service = OIDCService(connection)

        # Generate PKCE
        code_verifier, code_challenge = oidc_service.generate_pkce()

        # Create authorization URL
        auth_url, auth_params = oidc_service.create_authorization_url(
            code_challenge=code_challenge,
            login_hint=request.GET.get('login_hint'),
        )

        # Store state for callback validation
        cache.set(
            f"oidc_state_{auth_params['state']}",
            {
                'connection_id': str(connection_id),
                'nonce': auth_params['nonce'],
                'code_verifier': code_verifier,
                'next': request.GET.get('next', '/'),
            },
            timeout=600,
        )  # 10 minutes

        SSOAuditLog.log_event(
            event_type=SSOAuditEventType.SSO_LOGIN_INITIATED,
            tenant=connection.tenant,
            sso_connection=connection,
            description='OIDC login initiated',
            ip_address=get_client_ip(request),
        )

        return HttpResponseRedirect(auth_url)


class OIDCCallbackView(View):
    """Handle OIDC callback after authentication."""

    def get(self, request, connection_id):
        try:
            connection = TenantSSOConnection.objects.get(
                pk=connection_id,
                connection_type='oidc',
            )
        except TenantSSOConnection.DoesNotExist:
            return HttpResponse('Not found', status=404)

        # Check for errors
        error = request.GET.get('error')
        if error:
            error_desc = request.GET.get('error_description', error)
            SSOAuditLog.log_event(
                event_type=SSOAuditEventType.SSO_LOGIN_FAILED,
                tenant=connection.tenant,
                sso_connection=connection,
                description=f'OIDC error: {error_desc}',
                success=False,
                ip_address=get_client_ip(request),
            )
            web_app_url = getattr(settings, 'WEB_APP_URL', 'http://localhost:3000')
            return HttpResponseRedirect(f"{web_app_url}/en/en/auth/sso/error?message={error_desc}")

        code = request.GET.get('code')
        state = request.GET.get('state')

        if not code or not state:
            return HttpResponse('Missing code or state', status=400)

        # Retrieve stored state
        stored_data = cache.get(f"oidc_state_{state}")
        if not stored_data:
            return HttpResponse('Invalid or expired state', status=400)

        cache.delete(f"oidc_state_{state}")

        oidc_service = OIDCService(connection)

        try:
            # Process callback
            user_attrs = oidc_service.process_callback(
                code=code,
                state=state,
                stored_state=state,
                stored_nonce=stored_data['nonce'],
                code_verifier=stored_data['code_verifier'],
            )

            # Provision or update user
            provisioning_service = JITProvisioningService(connection)
            user, sso_link, is_new = provisioning_service.provision_or_update_user(
                idp_user_id=user_attrs.get('idp_user_id', user_attrs.get('sub')),
                email=user_attrs.get('email'),
                first_name=user_attrs.get('first_name', ''),
                last_name=user_attrs.get('last_name', ''),
                groups=user_attrs.get('groups', []),
                raw_attributes=user_attrs.get('raw_claims', {}),
                ip_address=get_client_ip(request),
            )

            # Create session and set auth cookies (same as regular login)
            from apps.users.jwt import create_jwt_tokens
            from apps.users.utils import set_auth_cookie

            tokens = create_jwt_tokens(user)

            web_app_url = getattr(settings, 'WEB_APP_URL', 'http://localhost:3000')
            # Ensure next URL has language prefix
            next_url = stored_data.get('next', '/en/')
            if next_url == '/':
                next_url = '/en/'
            redirect_url = f"{web_app_url}{next_url}"

            SSOAuditLog.log_event(
                event_type=SSOAuditEventType.SSO_LOGIN_SUCCESS,
                tenant=connection.tenant,
                user=user,
                sso_connection=connection,
                description=f'OIDC login successful for {user.email}',
                ip_address=get_client_ip(request),
            )

            # Create redirect response and set auth cookies
            response = HttpResponseRedirect(redirect_url)
            set_auth_cookie(
                response,
                {
                    settings.ACCESS_TOKEN_COOKIE: tokens['access'],
                    settings.REFRESH_TOKEN_COOKIE: tokens['refresh'],
                },
            )
            return response

        except Exception as e:
            logger.error(f"OIDC authentication failed: {e}")

            SSOAuditLog.log_event(
                event_type=SSOAuditEventType.SSO_LOGIN_FAILED,
                tenant=connection.tenant,
                sso_connection=connection,
                description='OIDC login failed',
                error_message=str(e),
                success=False,
                ip_address=get_client_ip(request),
            )

            web_app_url = getattr(settings, 'WEB_APP_URL', 'http://localhost:3000')
            return HttpResponseRedirect(f"{web_app_url}/en/auth/sso/error?message=Authentication failed")


# ==================
# SCIM Views
# ==================


def scim_auth_required(view_func):
    """Decorator to authenticate SCIM requests."""

    @wraps(view_func)
    def wrapper(self, request, *args, **kwargs):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')

        if not auth_header.startswith('Bearer '):
            return JsonResponse(
                SCIMError('Missing or invalid authorization header', 401).to_response(),
                status=401,
            )

        token_value = auth_header[7:]  # Remove 'Bearer '
        token = SCIMToken.objects.verify_token(token_value)

        if not token:
            return JsonResponse(
                SCIMError('Invalid or expired token', 401).to_response(),
                status=401,
            )

        # Record token usage
        token.record_usage(get_client_ip(request))

        # Attach token and service to request
        request.scim_token = token
        request.scim_service = SCIMService(token)

        return view_func(self, request, *args, **kwargs)

    return wrapper


@method_decorator(csrf_exempt, name='dispatch')
class SCIMUsersView(APIView):
    """SCIM /Users endpoint."""

    permission_classes = [AllowAny]  # Auth handled by decorator

    @scim_auth_required
    def get(self, request):
        """List users or get a specific user."""
        scim_service = request.scim_service

        filter_expr = request.GET.get('filter')
        start_index = int(request.GET.get('startIndex', 1))
        count = int(request.GET.get('count', 100))

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


@method_decorator(csrf_exempt, name='dispatch')
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

        operations = request.data.get('Operations', [])

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


@method_decorator(csrf_exempt, name='dispatch')
class SCIMGroupsView(APIView):
    """SCIM /Groups endpoint."""

    permission_classes = [AllowAny]

    @scim_auth_required
    def get(self, request):
        """List groups."""
        scim_service = request.scim_service
        result = scim_service.list_groups()
        return Response(result)


@method_decorator(csrf_exempt, name='dispatch')
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
            user_verification=request.data.get('userVerification', 'preferred'),
            authenticator_attachment=request.data.get('authenticatorAttachment'),
            require_resident_key=request.data.get('requireResidentKey', True),
        )

        return Response(options)


class PasskeyRegistrationVerifyView(APIView):
    """Verify passkey registration."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        webauthn_service = WebAuthnService(request.user)

        try:
            passkey = webauthn_service.verify_registration(
                challenge=request.data.get('challenge'),
                credential_id=request.data.get('credentialId'),
                public_key=request.data.get('publicKey'),
                attestation_object=request.data.get('attestationObject'),
                client_data_json=request.data.get('clientDataJSON'),
                name=request.data.get('name', 'My Passkey'),
                transports=request.data.get('transports', []),
                ip_address=get_client_ip(request),
            )

            return Response(
                {
                    'id': str(passkey.id),
                    'name': passkey.name,
                    'createdAt': passkey.created_at.isoformat(),
                }
            )

        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class PasskeyAuthenticationOptionsView(APIView):
    """Get options for passkey authentication."""

    permission_classes = [AllowAny]

    def post(self, request):
        # For discoverable credentials, user may not be known yet
        email = request.data.get('email')
        user = None

        if email:
            from apps.users.models import User

            user = User.objects.filter(email__iexact=email).first()

        webauthn_service = WebAuthnService(user)

        options, challenge = webauthn_service.create_authentication_options(
            user_verification=request.data.get('userVerification', 'preferred'),
        )

        return Response(options)


class PasskeyAuthenticationVerifyView(APIView):
    """Verify passkey authentication."""

    permission_classes = [AllowAny]

    def post(self, request):
        webauthn_service = WebAuthnService()

        try:
            user, passkey = webauthn_service.verify_authentication(
                challenge=request.data.get('challenge'),
                credential_id=request.data.get('credentialId'),
                authenticator_data=request.data.get('authenticatorData'),
                client_data_json=request.data.get('clientDataJSON'),
                signature=request.data.get('signature'),
                user_handle=request.data.get('userHandle'),
                ip_address=get_client_ip(request),
            )

            # Create JWT tokens and set auth cookies (same as regular login)
            from apps.users.jwt import create_jwt_tokens
            from apps.users.utils import set_auth_cookie

            tokens = create_jwt_tokens(user)

            response = Response({'success': True})
            set_auth_cookie(
                response,
                {
                    settings.ACCESS_TOKEN_COOKIE: tokens['access'],
                    settings.REFRESH_TOKEN_COOKIE: tokens['refresh'],
                },
            )
            return response

        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class PasskeyListView(APIView):
    """List user's passkeys."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        webauthn_service = WebAuthnService(request.user)
        passkeys = webauthn_service.list_passkeys()

        return Response(
            [
                {
                    'id': str(p.id),
                    'name': p.name,
                    'authenticatorType': p.authenticator_type,
                    'createdAt': p.created_at.isoformat(),
                    'lastUsedAt': p.last_used_at.isoformat() if p.last_used_at else None,
                    'useCount': p.use_count,
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

    def get(self, request, tenant_id):
        from apps.multitenancy.models import Tenant, TenantMembership
        from apps.multitenancy.constants import TenantUserRole
        from graphql_relay import from_global_id
        from .models import UserPasskey

        # Decode tenant ID if it's a GraphQL global ID
        try:
            type_name, pk = from_global_id(tenant_id)
            if type_name and type_name != '':
                tenant_id = pk
        except Exception:
            pass

        try:
            tenant = Tenant.objects.get(pk=tenant_id)
        except Tenant.DoesNotExist:
            return Response({'error': 'Tenant not found'}, status=status.HTTP_404_NOT_FOUND)

        # Check permissions
        try:
            membership = TenantMembership.objects.get(user=request.user, tenant=tenant)
            if membership.role not in [TenantUserRole.OWNER, TenantUserRole.ADMIN]:
                return Response({'error': 'Insufficient permissions'}, status=status.HTTP_403_FORBIDDEN)
        except TenantMembership.DoesNotExist:
            return Response({'error': 'Not a member of this tenant'}, status=status.HTTP_403_FORBIDDEN)

        # Query parameters
        search = request.GET.get('search', '').strip().lower()

        # Get all members of the tenant
        tenant_members = TenantMembership.objects.filter(tenant=tenant).select_related('user')
        tenant_user_ids = [m.user_id for m in tenant_members]

        # Get all passkeys for tenant members
        passkeys = (
            UserPasskey.objects.filter(user_id__in=tenant_user_ids, is_active=True)
            .select_related('user')
            .order_by('-created_at')
        )

        # Filter by search term if provided
        if search:
            passkeys = passkeys.filter(
                models.Q(user__email__icontains=search)
                | models.Q(user__first_name__icontains=search)
                | models.Q(user__last_name__icontains=search)
                | models.Q(name__icontains=search)
            )

        return Response(
            [
                {
                    'id': str(p.id),
                    'name': p.name,
                    'authenticatorType': p.authenticator_type,
                    'createdAt': p.created_at.isoformat(),
                    'lastUsedAt': p.last_used_at.isoformat() if p.last_used_at else None,
                    'useCount': p.use_count,
                    'userEmail': p.user.email,
                    'userName': f"{p.user.first_name} {p.user.last_name}".strip() or p.user.email,
                }
                for p in passkeys
            ]
        )

    def delete(self, request, tenant_id, passkey_id=None):
        """Delete a passkey by owner/admin."""
        from apps.multitenancy.models import Tenant, TenantMembership
        from apps.multitenancy.constants import TenantUserRole
        from graphql_relay import from_global_id
        from .models import UserPasskey

        if not passkey_id:
            return Response({'error': 'Passkey ID required'}, status=status.HTTP_400_BAD_REQUEST)

        # Decode tenant ID if it's a GraphQL global ID
        try:
            type_name, pk = from_global_id(tenant_id)
            if type_name and type_name != '':
                tenant_id = pk
        except Exception:
            pass

        try:
            tenant = Tenant.objects.get(pk=tenant_id)
        except Tenant.DoesNotExist:
            return Response({'error': 'Tenant not found'}, status=status.HTTP_404_NOT_FOUND)

        # Check permissions
        try:
            membership = TenantMembership.objects.get(user=request.user, tenant=tenant)
            if membership.role not in [TenantUserRole.OWNER, TenantUserRole.ADMIN]:
                return Response({'error': 'Insufficient permissions'}, status=status.HTTP_403_FORBIDDEN)
        except TenantMembership.DoesNotExist:
            return Response({'error': 'Not a member of this tenant'}, status=status.HTTP_403_FORBIDDEN)

        # Get the passkey
        try:
            passkey = UserPasskey.objects.get(pk=passkey_id, is_active=True)
        except UserPasskey.DoesNotExist:
            return Response({'error': 'Passkey not found'}, status=status.HTTP_404_NOT_FOUND)

        # Verify the passkey belongs to a tenant member
        if not TenantMembership.objects.filter(tenant=tenant, user=passkey.user).exists():
            return Response({'error': 'Passkey does not belong to a tenant member'}, status=status.HTTP_403_FORBIDDEN)

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
                'removed_by': request.user.email,
                'passkey_owner': passkey.user.email,
            },
        )

        # Deactivate the passkey
        passkey.is_active = False
        passkey.save(update_fields=['is_active'])

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
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ==================
# SSO Connection Management REST Views
# ==================

from graphql_relay import from_global_id
from apps.multitenancy.models import Tenant, TenantMembership
from apps.multitenancy.constants import TenantUserRole


def decode_tenant_id(tenant_id):
    """
    Decode tenant ID - handles both raw IDs and GraphQL global IDs.
    """
    # Try to decode as GraphQL global ID
    try:
        type_name, pk = from_global_id(tenant_id)
        if type_name == 'TenantType':
            return pk
    except Exception:
        pass
    # Return as-is if not a global ID
    return tenant_id


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
        return None, None, Response({'error': 'Tenant not found'}, status=status.HTTP_404_NOT_FOUND)

    membership = TenantMembership.objects.filter(
        tenant=tenant,
        user=request.user,
    ).first()

    if not membership:
        return None, None, Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)

    if require_admin and membership.role not in [TenantUserRole.OWNER, TenantUserRole.ADMIN]:
        return (
            None,
            None,
            Response({'error': 'Only owners and admins can manage SSO connections'}, status=status.HTTP_403_FORBIDDEN),
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

        connections = TenantSSOConnection.objects.filter(tenant=tenant).order_by('-created_at')

        return Response(
            [
                {
                    'id': str(conn.id),
                    'name': conn.name,
                    'connectionType': conn.connection_type,
                    'status': conn.status,
                    'isActive': conn.is_active,
                    'isSaml': conn.is_saml,
                    'isOidc': conn.is_oidc,
                    'createdAt': conn.created_at.isoformat(),
                    'lastLoginAt': conn.last_login_at.isoformat() if conn.last_login_at else None,
                    'loginCount': conn.login_count,
                    'spMetadataUrl': conn.sp_metadata_url,
                    'oidcCallbackUrl': conn.oidc_callback_url,
                    'loginUrl': conn.login_url,
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
        logger.info(f"SSO connection POST data: {data}")
        # Support both camelCase and snake_case (apiClient transforms to snake_case)
        connection_type = data.get('connection_type') or data.get('connectionType', 'saml')
        logger.info(f"SSO connection type: {connection_type}")

        try:
            connection = TenantSSOConnection.objects.create(
                tenant=tenant,
                name=data.get('name', 'SSO Connection'),
                connection_type=connection_type,
                status=SSOConnectionStatus.DRAFT,
                # SAML fields (support both camelCase and snake_case)
                saml_entity_id=data.get('saml_entity_id') or data.get('samlEntityId', ''),
                saml_sso_url=data.get('saml_sso_url') or data.get('samlSsoUrl', ''),
                saml_certificate=data.get('saml_certificate') or data.get('samlCertificate', ''),
                # OIDC fields (support both camelCase and snake_case)
                oidc_issuer=data.get('oidc_issuer') or data.get('oidcIssuer', ''),
                oidc_client_id=data.get('oidc_client_id') or data.get('oidcClientId', ''),
                oidc_client_secret=data.get('oidc_client_secret') or data.get('oidcClientSecret', ''),
            )

            return Response(
                {
                    'id': str(connection.id),
                    'name': connection.name,
                    'connectionType': connection.connection_type,
                    'status': connection.status,
                    'spMetadataUrl': connection.sp_metadata_url,
                    'oidcCallbackUrl': connection.oidc_callback_url,
                    'loginUrl': connection.login_url,
                    'createdAt': connection.created_at.isoformat(),
                },
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            logger.error(f"Failed to create SSO connection: {e}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


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
            return Response({'error': 'Connection not found'}, status=status.HTTP_404_NOT_FOUND)

        return Response(
            {
                'id': str(connection.id),
                'name': connection.name,
                'connectionType': connection.connection_type,
                'status': connection.status,
                'isActive': connection.is_active,
                'isSaml': connection.is_saml,
                'isOidc': connection.is_oidc,
                'createdAt': connection.created_at.isoformat(),
                'lastLoginAt': connection.last_login_at.isoformat() if connection.last_login_at else None,
                'loginCount': connection.login_count,
                'spMetadataUrl': connection.sp_metadata_url,
                # SAML fields (only if SAML)
                'samlEntityId': connection.saml_entity_id if connection.is_saml else None,
                'samlSsoUrl': connection.saml_sso_url if connection.is_saml else None,
                # OIDC fields (only if OIDC)
                'oidcIssuer': connection.oidc_issuer if connection.is_oidc else None,
                'oidcClientId': connection.oidc_client_id if connection.is_oidc else None,
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
            return Response({'error': 'Connection not found'}, status=status.HTTP_404_NOT_FOUND)


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
                    'id': str(connection.id),
                    'status': connection.status,
                    'isActive': connection.is_active,
                }
            )
        except TenantSSOConnection.DoesNotExist:
            return Response({'error': 'Connection not found'}, status=status.HTTP_404_NOT_FOUND)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


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
                    'id': str(connection.id),
                    'status': connection.status,
                    'isActive': connection.is_active,
                }
            )
        except TenantSSOConnection.DoesNotExist:
            return Response({'error': 'Connection not found'}, status=status.HTTP_404_NOT_FOUND)


# ==================
# SSO Discovery (for login page)
# ==================


class SSODiscoverView(APIView):
    """
    Discover SSO options for a given email domain.
    Used on the login page to show SSO options to users.
    """

    permission_classes = [AllowAny]

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
        email = request.GET.get('email', '').strip().lower()

        if not email or '@' not in email:
            return Response(
                {
                    'sso_available': False,
                    'connections': [],
                    'require_sso': False,
                }
            )

        domain = email.split('@')[1]

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
            .select_related('tenant')
        )

        # Filter further by checking the domain association
        # For SAML, check if tenant's domain matches
        matching_connections = []
        for conn in connections:
            # Check if tenant has this domain configured
            # This is a simple check - in production you'd want domain verification
            tenant_domains = getattr(conn.tenant, 'domains', None)
            if tenant_domains and domain in tenant_domains:
                matching_connections.append(conn)
            elif conn.allowed_domains and domain in conn.allowed_domains:
                matching_connections.append(conn)
            # Also check by email pattern in existing users
            from apps.users.models import User
            from apps.multitenancy.models import TenantMembership

            user = User.objects.filter(email__iexact=email).first()
            if user:
                membership = TenantMembership.objects.filter(user=user, tenant=conn.tenant).first()
                if membership:
                    matching_connections.append(conn)
                    break

        # Remove duplicates
        seen_ids = set()
        unique_connections = []
        for conn in matching_connections:
            if conn.id not in seen_ids:
                seen_ids.add(conn.id)
                unique_connections.append(conn)

        if not unique_connections:
            return Response(
                {
                    'sso_available': False,
                    'connections': [],
                    'require_sso': False,
                }
            )

        # Check if any connection requires SSO (no password fallback)
        require_sso = any(getattr(conn, 'enforce_sso', False) for conn in unique_connections)

        return Response(
            {
                'sso_available': True,
                'require_sso': require_sso,
                'connections': [
                    {
                        'id': str(conn.id),
                        'name': conn.name,
                        'type': conn.connection_type,
                        'tenant_id': str(conn.tenant.id),
                        'tenant_name': conn.tenant.name,
                        'login_url': f"/api/sso/{conn.connection_type}/{conn.id}/login",
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
                'message': 'Please enter your work email to discover SSO options.',
                'flow': 'email_discovery',
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
        from apps.multitenancy.constants import TenantUserRole
        from graphql_relay import from_global_id

        # Decode tenant ID if it's a GraphQL global ID
        try:
            type_name, pk = from_global_id(tenant_id)
            if type_name and type_name != '':
                tenant_id = pk
        except Exception:
            pass

        try:
            tenant = Tenant.objects.get(pk=tenant_id)
        except Tenant.DoesNotExist:
            return Response({'error': 'Tenant not found'}, status=status.HTTP_404_NOT_FOUND)

        # Check permissions
        try:
            membership = TenantMembership.objects.get(user=request.user, tenant=tenant)
            if membership.role not in [TenantUserRole.OWNER, TenantUserRole.ADMIN]:
                return Response({'error': 'Insufficient permissions'}, status=status.HTTP_403_FORBIDDEN)
        except TenantMembership.DoesNotExist:
            return Response({'error': 'Not a member of this tenant'}, status=status.HTTP_403_FORBIDDEN)

        # Query parameters
        limit = min(int(request.GET.get('limit', 50)), 500)
        page = request.GET.get('page')
        if page:
            page = max(1, int(page))
            offset = (page - 1) * limit
        else:
            offset = int(request.GET.get('offset', 0))

        event_type = request.GET.get('event_type', '').strip()
        user_email = request.GET.get('user_email', '').strip()
        success_param = request.GET.get('success', '').strip().lower()
        start_date = request.GET.get('start_date', '').strip()
        end_date = request.GET.get('end_date', '').strip()
        search = request.GET.get('search', '').strip()

        # Build base query
        logs = SSOAuditLog.objects.filter(tenant=tenant).select_related('user', 'sso_connection')

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
        if success_param == 'true':
            logs = logs.filter(success=True)
        elif success_param == 'false':
            logs = logs.filter(success=False)

        # Apply search filter
        if search:
            logs = logs.filter(
                models.Q(event_description__icontains=search)
                | models.Q(user__email__icontains=search)
                | models.Q(ip_address__icontains=search)
            )

        # Order by created_at descending
        logs = logs.order_by('-created_at')

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
                    'id': str(log.id),
                    'eventType': log.event_type,
                    'eventDescription': log.event_description,
                    'userEmail': log.user.email if log.user else None,
                    'connectionName': log.sso_connection.name if log.sso_connection else None,
                    'ipAddress': log.ip_address,
                    'userAgent': log.user_agent,
                    'success': log.success,
                    'errorMessage': log.error_message,
                    'metadata': log.metadata,
                    'createdAt': log.created_at.isoformat(),
                }
            )

        # Get unique users and event types for filter options
        # Only do this if explicitly requested to avoid performance hit
        include_filter_options = request.GET.get('include_filter_options', 'false').lower() == 'true'
        filter_options = {}

        if include_filter_options:
            # Get unique event types
            event_types = SSOAuditLog.objects.filter(tenant=tenant).values_list('event_type', flat=True).distinct()
            filter_options['eventTypes'] = list(event_types)

            # Get unique user emails
            user_emails = (
                SSOAuditLog.objects.filter(tenant=tenant, user__isnull=False)
                .values_list('user__email', flat=True)
                .distinct()[:100]
            )
            filter_options['userEmails'] = list(user_emails)

        return Response(
            {
                'logs': log_data,
                'totalCount': total_count,
                'totalPages': total_pages,
                'currentPage': current_page,
                'pageSize': limit,
                'hasMore': offset + limit < total_count,
                'hasPrevious': offset > 0,
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
        from apps.multitenancy.constants import TenantUserRole
        from graphql_relay import from_global_id

        # Decode tenant ID if it's a GraphQL global ID
        try:
            type_name, pk = from_global_id(tenant_id)
            if type_name and type_name != '':
                tenant_id = pk
        except Exception:
            pass

        try:
            tenant = Tenant.objects.get(pk=tenant_id)
        except Tenant.DoesNotExist:
            return Response({'error': 'Tenant not found'}, status=status.HTTP_404_NOT_FOUND)

        # Check permissions
        try:
            membership = TenantMembership.objects.get(user=request.user, tenant=tenant)
            if membership.role not in [TenantUserRole.OWNER, TenantUserRole.ADMIN]:
                return Response({'error': 'Insufficient permissions'}, status=status.HTTP_403_FORBIDDEN)
        except TenantMembership.DoesNotExist:
            return Response({'error': 'Not a member of this tenant'}, status=status.HTTP_403_FORBIDDEN)

        # Get SCIM tokens (only active by default)
        include_revoked = request.GET.get('include_revoked', 'false').lower() == 'true'
        tokens = SCIMToken.objects.filter(tenant=tenant).order_by('-created_at')

        if not include_revoked:
            tokens = tokens.filter(is_active=True)

        return Response(
            [
                {
                    'id': str(t.id),
                    'name': t.name,
                    'tokenPrefix': t.token_prefix,
                    'isActive': t.is_active,
                    'createdAt': t.created_at.isoformat(),
                    'lastUsedAt': t.last_used_at.isoformat() if t.last_used_at else None,
                    'requestCount': t.request_count,
                }
                for t in tokens
            ]
        )

    def post(self, request, tenant_id):
        import secrets
        import hashlib
        from apps.multitenancy.models import Tenant, TenantMembership
        from apps.multitenancy.constants import TenantUserRole
        from graphql_relay import from_global_id

        # Decode tenant ID if it's a GraphQL global ID
        try:
            type_name, pk = from_global_id(tenant_id)
            if type_name and type_name != '':
                tenant_id = pk
        except Exception:
            pass

        try:
            tenant = Tenant.objects.get(pk=tenant_id)
        except Tenant.DoesNotExist:
            return Response({'error': 'Tenant not found'}, status=status.HTTP_404_NOT_FOUND)

        # Check permissions
        try:
            membership = TenantMembership.objects.get(user=request.user, tenant=tenant)
            if membership.role not in [TenantUserRole.OWNER, TenantUserRole.ADMIN]:
                return Response({'error': 'Insufficient permissions'}, status=status.HTTP_403_FORBIDDEN)
        except TenantMembership.DoesNotExist:
            return Response({'error': 'Not a member of this tenant'}, status=status.HTTP_403_FORBIDDEN)

        # Check if there's an active SSO connection
        active_connections = TenantSSOConnection.objects.filter(tenant=tenant, status=SSOConnectionStatus.ACTIVE)
        if not active_connections.exists():
            return Response(
                {'error': 'An active SSO connection is required to create SCIM tokens'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        name = request.data.get('name', 'SCIM Token')

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
                'id': str(token.id),
                'name': token.name,
                'token': raw_token,  # Only returned once!
                'tokenPrefix': token_prefix,
                'createdAt': token.created_at.isoformat(),
                'endpointUrl': '/api/sso/scim/v2',
            },
            status=status.HTTP_201_CREATED,
        )


class SCIMTokenDetailView(APIView):
    """Delete a SCIM token."""

    permission_classes = [IsAuthenticated]

    def delete(self, request, tenant_id, token_id):
        from apps.multitenancy.models import Tenant, TenantMembership
        from apps.multitenancy.constants import TenantUserRole
        from graphql_relay import from_global_id

        # Decode tenant ID if it's a GraphQL global ID
        try:
            type_name, pk = from_global_id(tenant_id)
            if type_name and type_name != '':
                tenant_id = pk
        except Exception:
            pass

        try:
            tenant = Tenant.objects.get(pk=tenant_id)
        except Tenant.DoesNotExist:
            return Response({'error': 'Tenant not found'}, status=status.HTTP_404_NOT_FOUND)

        # Check permissions
        try:
            membership = TenantMembership.objects.get(user=request.user, tenant=tenant)
            if membership.role not in [TenantUserRole.OWNER, TenantUserRole.ADMIN]:
                return Response({'error': 'Insufficient permissions'}, status=status.HTTP_403_FORBIDDEN)
        except TenantMembership.DoesNotExist:
            return Response({'error': 'Not a member of this tenant'}, status=status.HTTP_403_FORBIDDEN)

        try:
            token = SCIMToken.objects.get(pk=token_id, tenant=tenant)
        except SCIMToken.DoesNotExist:
            return Response({'error': 'Token not found'}, status=status.HTTP_404_NOT_FOUND)

        token_name = token.name
        token.is_active = False
        token.save(update_fields=['is_active'])

        # Log the revocation
        SSOAuditLog.log_event(
            event_type=SSOAuditEventType.IDP_CONFIG_UPDATED,
            tenant=tenant,
            user=request.user,
            description=f'SCIM token "{token_name}" revoked',
            ip_address=get_client_ip(request),
        )

        return Response(status=status.HTTP_204_NO_CONTENT)
