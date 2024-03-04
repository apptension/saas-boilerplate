from graphql_relay import from_global_id
from django.utils.functional import SimpleLazyObject
from .models import Tenant, TenantMembership


def get_current_tenant(args):
    """
    Retrieves the current tenant based on the GraphQL arguments.

    Args:
    - args (dict): Dictionary containing GraphQL arguments.

    Returns:
    - Tenant or None: The current tenant or None if not found.
    """
    tenant_id = args.get("input").get('tenantId')
    if not tenant_id:
        # for the purpose of Tenant CRUD actions
        tenant_id = args.get("input").get('id')
    try:
        id_type, pk = from_global_id(tenant_id)
        if id_type == "TenantType":
            return Tenant.objects.get(pk=pk)
    except (Tenant.DoesNotExist, TypeError):
        return None


def get_current_user_role(info):
    """
    Retrieves the current user's role within the current tenant.

    Args:
    - info (GraphQL ResolveInfo): Contains information about the GraphQL execution.

    Returns:
    - str or None: The user's role or None if not found.
    """
    user = info.context.user
    tenant = info.context.tenant

    if user and user.is_authenticated and tenant:
        try:
            membership = TenantMembership.objects.get(user=user, tenant=tenant)
            return membership.role
        except TenantMembership.DoesNotExist:
            return None

    return None


class TenantUserRoleMiddleware(object):
    """
    Middleware for resolving the current tenant and user role lazily.

    This middleware is responsible for setting the 'tenant' and 'user_role' attributes in the GraphQL execution context.
    The actual retrieval of the current tenant and user role is deferred until the values are accessed. Lazy loading is
    employed to optimize performance by loading these values only when necessary.
    """

    def resolve(self, next, root, info, **args):
        info.context.tenant = SimpleLazyObject(lambda: get_current_tenant(args))
        info.context.user_role = SimpleLazyObject(lambda: get_current_user_role(info))
        return next(root, info, **args)
