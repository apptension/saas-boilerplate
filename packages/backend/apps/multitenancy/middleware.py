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


class TenantUserRoleMiddleware(object):
    """
    Middleware for resolving the current tenant and user role lazily.

    This middleware is responsible for setting the "tenant" and "user_role" attributes in the GraphQL execution context.
    The actual retrieval of the current tenant and user role is deferred until the values are accessed. Lazy loading is
    employed to optimize performance by loading these values only when necessary.
    """

    @staticmethod
    def _get_tenant_id_from_arguments(args):
        """
        Extract the tenant ID from GraphQL arguments.

        Args:
            args (dict): GraphQL arguments.

        Returns:
            str or None: The extracted tenant ID or None if not found.
        """
        request_input = args.get("input")

        tenant_id = (
            request_input.get("tenant_id") or request_input.get("id")
            if request_input
            else args.get("tenant_id") or args.get("id")
        )

        if tenant_id:
            id_type, pk = from_global_id(tenant_id)
            if id_type == "TenantType":
                return pk
        return None

    def resolve(self, next, root, info, **args):
        if not hasattr(info.context, "tenant_id"):
            info.context.tenant_id = self._get_tenant_id_from_arguments(args)
        info.context.tenant = SimpleLazyObject(lambda: get_current_tenant(info.context.tenant_id))
        info.context.user_role = SimpleLazyObject(lambda: get_current_user_role(info.context.tenant, info.context.user))
        return next(root, info, **args)
