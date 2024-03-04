from graphql_relay import from_global_id
from django.utils.functional import SimpleLazyObject
from .models import Tenant, TenantMembership


def get_current_tenant(tenant_id):
    """
    Retrieves the current tenant based on the GraphQL arguments.

    Args:
    - args (dict): Dictionary containing GraphQL arguments.

    Returns:
    - Tenant or None: The current tenant or None if not found.
    """
    try:
        return Tenant.objects.get(pk=tenant_id)
    except (Tenant.DoesNotExist, TypeError):
        return None


def get_current_user_role(tenant, user):
    """
    Retrieves the current user's role within the current tenant.

    Args:
    - info (GraphQL ResolveInfo): Contains information about the GraphQL execution.

    Returns:
    - str or None: The user's role or None if not found.
    """
    if user and user.is_authenticated and tenant:
        try:
            membership = TenantMembership.objects.get(user=user, tenant=tenant)
            return membership.role
        except TenantMembership.DoesNotExist:
            return None

    return None


def get_tenant_id_from_arguments(args):
    request_input = args.get("input")
    if request_input:
        tenant_id = request_input.get("tenant_id")
        if not tenant_id:
            # for the purpose of Tenant CRUD actions
            tenant_id = request_input.get("id")
    else:
        # for the purpose of queries, where is no input, just parameters
        tenant_id = args.get("id")
    if tenant_id:
        id_type, pk = from_global_id(tenant_id)
        if id_type == "TenantType":
            return pk
    return None


class TenantUserRoleMiddleware(object):
    """
    Middleware for resolving the current tenant and user role lazily.

    This middleware is responsible for setting the "tenant" and "user_role" attributes in the GraphQL execution context.
    The actual retrieval of the current tenant and user role is deferred until the values are accessed. Lazy loading is
    employed to optimize performance by loading these values only when necessary.
    """

    def resolve(self, next, root, info, **args):
        if not hasattr(info.context, "tenant_id"):
            info.context.tenant_id = get_tenant_id_from_arguments(args)
        info.context.tenant = SimpleLazyObject(lambda: get_current_tenant(info.context.tenant_id))
        info.context.user_role = SimpleLazyObject(lambda: get_current_user_role(info.context.tenant, info.context.user))
        return next(root, info, **args)
