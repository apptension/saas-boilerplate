import logging

from graphql_relay import from_global_id
from django.utils.functional import SimpleLazyObject
from .models import Tenant, TenantMembership

logger = logging.getLogger(__name__)


def get_current_tenant(tenant_id):
    """
    Retrieve the current tenant based on the provided tenant ID.

    Args:
        tenant_id (str): The global ID of the tenant.

    Returns:
        Tenant or None: The retrieved tenant or None if not found.
    """
    try:
        return Tenant.objects.get(pk=tenant_id)
    except (Tenant.DoesNotExist, TypeError):
        return None


def get_current_tenant_with_membership_check(tenant_id, user, request=None):
    """
    Retrieve the current tenant with membership verification.

    SECURITY: This function ensures the user has an active membership
    in the tenant before returning it. This prevents unauthorized
    access to tenant data by manipulating tenant_id in requests.

    When the request was authenticated via password, tenants that enforce SSO
    for the user's domain are blocked (unless the user has break-glass permission).

    Args:
        tenant_id (str): The tenant ID (hashid).
        user: The authenticated user.
        request: The HTTP request (used for auth_method checks).

    Returns:
        Tenant or None: The tenant if found AND user has membership, else None.
    """
    if not tenant_id:
        return None

    try:
        tenant = Tenant.objects.get(pk=tenant_id)
    except (Tenant.DoesNotExist, TypeError):
        return None

    # SECURITY: Verify user has accepted membership in this tenant
    if not TenantMembership.objects.filter(user=user, tenant=tenant, is_accepted=True).exists():
        return None

    # SECURITY: Block password sessions from accessing SSO-enforced tenants
    if request is not None:
        from apps.sso.enforcement import check_tenant_sso_enforcement

        block_reason = check_tenant_sso_enforcement(request, tenant, user)
        if block_reason:
            logger.warning(
                f"Blocked tenant access: user={user.email} tenant={tenant.id} reason={block_reason}"
            )
            return None

    return tenant

    return None


def get_current_user_role(tenant, user):
    """
    Retrieve the user role within the specified tenant.

    Args:
        tenant (Tenant): The current tenant.
        user (User): The user for whom the role is to be retrieved.

    Returns:
        str or None: The user role or None if not found or invalid conditions.
    """
    if user and user.is_authenticated and tenant:
        try:
            membership = TenantMembership.objects.get(user=user, tenant=tenant)
            return membership.role
        except TenantMembership.DoesNotExist:
            return None

    return None


def is_ai_agent_request(request):
    """
    Check if the current request is from an AI Agent (MCP server).

    The AI Agent sets the 'X-AI-Agent-Request' header when making
    GraphQL requests through the MCP server.

    Args:
        request: The HTTP request object.

    Returns:
        bool: True if the request is from an AI Agent, False otherwise.
    """
    if request is None:
        return False

    # Check for the X-AI-Agent-Request header
    # Django converts headers to META format: X-AI-Agent-Request -> HTTP_X_AI_AGENT_REQUEST
    return request.META.get("HTTP_X_AI_AGENT_REQUEST", "").lower() == "true"


class TenantUserRoleMiddleware(object):
    """
    Middleware for resolving the current tenant and user role lazily.

    This middleware is responsible for setting the "tenant" and "user_role" attributes in the GraphQL execution context.
    The actual retrieval of the current tenant and user role is deferred until the values are accessed. Lazy loading is
    employed to optimize performance by loading these values only when necessary.

    SECURITY: The tenant is only set if the user has a valid, accepted membership.
    This prevents tenant confusion attacks where an attacker could manipulate
    the tenant_id parameter to access another organization's data.

    Additionally, this middleware detects AI Agent requests (from MCP server) by checking for the
    'X-AI-Agent-Request' header and sets the 'is_ai_agent_request' flag on the context for use
    in action logging.
    """

    @staticmethod
    def _get_tenant_id_from_arguments(args):
        """
        Extract the tenant ID from GraphQL arguments.

        SECURITY: Only looks for explicit tenant_id/tenantId fields.
        Generic 'id' must NOT be used as tenant_id fallback - this prevents
        tenant confusion attacks in mutations like updateProject where 'id'
        refers to the entity being updated, not the tenant.

        Args:
            args (dict): GraphQL arguments.

        Returns:
            str or None: The extracted tenant ID or None if not found.
        """
        request_input = args.get("input")

        tenant_id = None
        if request_input:
            tenant_id = request_input.get("tenant_id") or request_input.get("tenantId")
        else:
            tenant_id = args.get("tenant_id") or args.get("tenantId")

        if tenant_id:
            try:
                id_type, pk = from_global_id(tenant_id)
                if id_type == "TenantType":
                    return pk
                # Accept raw hashid when client sends tenant id without Relay global ID prefix
                if pk:
                    return pk
            except (TypeError, ValueError):
                # Invalid global ID; try using as raw tenant pk (hashid)
                return tenant_id

        return None

    def resolve(self, next, root, info, **args):
        # Always refresh tenant_id from current resolver args when present (e.g. createDocument
        # has input.tenantId; root "mutation" has no tenant_id so we must not stick with None)
        tenant_id_from_args = self._get_tenant_id_from_arguments(args)
        if tenant_id_from_args is not None:
            info.context.tenant_id = tenant_id_from_args
        elif not hasattr(info.context, "tenant_id"):
            info.context.tenant_id = None

        # SECURITY: Use membership-verified tenant retrieval
        # This ensures info.context.tenant is only set if the user has access
        user = getattr(info.context, "user", None)
        request = info.context
        info.context.tenant = SimpleLazyObject(
            lambda: get_current_tenant_with_membership_check(info.context.tenant_id, user, request)
        )
        info.context.user_role = SimpleLazyObject(lambda: get_current_user_role(info.context.tenant, info.context.user))

        # Detect AI Agent requests from MCP server
        if not hasattr(info.context, "is_ai_agent_request"):
            request = getattr(info.context, "request", info.context)
            info.context.is_ai_agent_request = is_ai_agent_request(request)

        return next(root, info, **args)
