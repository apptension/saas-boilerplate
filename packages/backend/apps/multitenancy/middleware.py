from graphql_relay import from_global_id
from django.utils.functional import SimpleLazyObject
from .models import Tenant, TenantMembership


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


def get_current_tenant_with_membership_check(tenant_id, user):
    """
    Retrieve the current tenant with membership verification.

    SECURITY: This function ensures the user has an active membership
    in the tenant before returning it. This prevents unauthorized
    access to tenant data by manipulating tenant_id in requests.

    Args:
        tenant_id (str): The tenant ID (hashid).
        user: The authenticated user.

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
    if (
        user
        and user.is_authenticated
        and TenantMembership.objects.filter(user=user, tenant=tenant, is_accepted=True).exists()
    ):
        return tenant

    # User is not authenticated or not a member - don't set tenant
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

        SECURITY: Primarily looks for explicit tenant_id/tenantId fields.
        As a fallback, checks if the 'id' field is a TenantType ID (for mutations like deleteTenant).
        This fallback is safe because:
        1. It only applies when no explicit tenant_id is found
        2. It verifies the id_type is "TenantType"
        3. Permission checks will still verify user access

        Args:
            args (dict): GraphQL arguments.

        Returns:
            str or None: The extracted tenant ID or None if not found.
        """
        request_input = args.get("input")

        # Check for both snake_case and camelCase variants of tenant_id
        # GraphQL uses camelCase, but some internal calls may use snake_case
        tenant_id = None
        if request_input:
            tenant_id = request_input.get("tenant_id") or request_input.get("tenantId")
        else:
            tenant_id = args.get("tenant_id") or args.get("tenantId")

        if tenant_id:
            id_type, pk = from_global_id(tenant_id)
            if id_type == "TenantType":
                return pk

        # Fallback: Check if 'id' field is a TenantType ID (for mutations like deleteTenant)
        # This is safe because we verify the id_type and permission checks will still run
        id_value = request_input.get("id") if request_input else args.get("id")

        if id_value:
            try:
                id_type, pk = from_global_id(id_value)
                if id_type == "TenantType":
                    return pk
            except (TypeError, ValueError):
                # Invalid global ID format, ignore
                pass

        return None

    def resolve(self, next, root, info, **args):
        if not hasattr(info.context, "tenant_id"):
            info.context.tenant_id = self._get_tenant_id_from_arguments(args)

        # SECURITY: Use membership-verified tenant retrieval
        # This ensures info.context.tenant is only set if the user has access
        user = getattr(info.context, "user", None)
        info.context.tenant = SimpleLazyObject(
            lambda: get_current_tenant_with_membership_check(info.context.tenant_id, user)
        )
        info.context.user_role = SimpleLazyObject(lambda: get_current_user_role(info.context.tenant, info.context.user))

        # Detect AI Agent requests from MCP server
        if not hasattr(info.context, "is_ai_agent_request"):
            request = getattr(info.context, "request", info.context)
            info.context.is_ai_agent_request = is_ai_agent_request(request)

        return next(root, info, **args)
