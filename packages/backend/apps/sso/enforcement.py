"""
SSO enforcement utilities.

Provides helpers to check whether a user's session (based on auth_method in JWT)
should be blocked from accessing tenants that enforce SSO login.
"""

import logging
from typing import Optional

from django.db import transaction
from django.db.models import QuerySet

from apps.sso.constants import SSOAuditEventType
from apps.sso.models import TenantSSOConnection, SSOAuditLog
from apps.users.jwt import get_auth_method_from_token

logger = logging.getLogger(__name__)


def get_sso_enforced_tenant_ids(user) -> set:
    """
    Return the set of tenant IDs that enforce SSO for this user's email domain.
    Only considers active connections with enforce_sso=True.
    """
    if not user or not user.is_authenticated:
        return set()

    email = getattr(user, 'email', '') or ''
    domain = email.rsplit('@', 1)[-1].lower() if '@' in email else ''
    if not domain:
        return set()

    connections = TenantSSOConnection.objects.filter(
        enforce_sso=True,
        status='active',
        tenant__user_memberships__user=user,
    )

    enforced_ids = set()
    for conn in connections:
        if domain in [d.lower() for d in (conn.allowed_domains or [])]:
            enforced_ids.add(conn.tenant_id)

    return enforced_ids


def is_password_session(request) -> bool:
    """Check if the current session was authenticated via password."""
    return get_auth_method_from_token(request) == 'password'


def filter_tenants_for_password_session(request, queryset: QuerySet) -> QuerySet:
    """
    If the user authenticated via password, exclude tenants that enforce SSO
    for the user's email domain -- unless the user has break-glass permission
    (security.sso.manage) on that tenant.
    """
    if not is_password_session(request):
        return queryset

    enforced_ids = get_sso_enforced_tenant_ids(request.user)
    if not enforced_ids:
        return queryset

    from apps.multitenancy.models import get_user_permissions_for_tenant, Tenant

    ids_to_exclude = set()
    for tenant_id in enforced_ids:
        try:
            tenant = Tenant.objects.get(pk=tenant_id)
        except Tenant.DoesNotExist:
            continue
        permissions = get_user_permissions_for_tenant(request.user, tenant)
        if 'security.sso.manage' not in permissions:
            ids_to_exclude.add(tenant_id)

    if ids_to_exclude:
        return queryset.exclude(pk__in=ids_to_exclude)

    return queryset


def check_tenant_sso_enforcement(request, tenant, user) -> Optional[str]:
    """
    Check if the user is blocked from accessing this tenant due to SSO enforcement.

    Returns None if access is allowed, or an error message string if blocked.
    For users with 'security.sso.manage' permission, access is granted (break-glass)
    and an audit log entry is recorded.
    """
    if not is_password_session(request):
        return None

    enforced_ids = get_sso_enforced_tenant_ids(user)
    if tenant.pk not in enforced_ids:
        return None

    from apps.multitenancy.models import get_user_permissions_for_tenant

    permissions = get_user_permissions_for_tenant(user, tenant)
    if 'security.sso.manage' in permissions:
        jti = _get_token_jti(request)
        if jti:
            _log_bypass_once(tenant, user, jti, _get_ip(request))
        else:
            logger.warning(
                f"Break-glass SSO enforcement bypass: user={user.email} tenant={tenant.id}"
            )
            SSOAuditLog.log_event(
                event_type=SSOAuditEventType.SSO_ENFORCE_BYPASS,
                tenant=tenant,
                user=user,
                description=f'Break-glass bypass: {user.email} accessed SSO-enforced tenant via password',
                ip_address=_get_ip(request),
            )
        return None

    return "sso_login_required"


def _log_bypass_once(tenant, user, jti: str, ip_address: str):
    """Log a break-glass bypass exactly once per login session (jti) per tenant."""
    with transaction.atomic():
        already_logged = (
            SSOAuditLog.objects
            .select_for_update(skip_locked=True)
            .filter(
                event_type=SSOAuditEventType.SSO_ENFORCE_BYPASS,
                tenant=tenant,
                user=user,
                metadata__jti=jti,
            )
            .exists()
        )
        if not already_logged:
            logger.warning(
                f"Break-glass SSO enforcement bypass: user={user.email} tenant={tenant.id}"
            )
            SSOAuditLog.log_event(
                event_type=SSOAuditEventType.SSO_ENFORCE_BYPASS,
                tenant=tenant,
                user=user,
                description=f'Break-glass bypass: {user.email} accessed SSO-enforced tenant via password',
                ip_address=ip_address,
                metadata={'jti': jti},
            )


def _get_token_jti(request) -> Optional[str]:
    """Extract the JWT token ID (jti) from the request. Unique per login session."""
    try:
        if hasattr(request, 'auth') and request.auth:
            return request.auth.get('jti')
    except (AttributeError, TypeError):
        pass
    return None


def _get_ip(request) -> str:
    """Extract client IP from request."""
    xff = request.META.get('HTTP_X_FORWARDED_FOR', '')
    if xff:
        return xff.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR', '')
