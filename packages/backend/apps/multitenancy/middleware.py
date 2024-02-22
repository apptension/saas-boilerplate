from graphql_relay import from_global_id
from django.utils.functional import SimpleLazyObject
from .models import Tenant, TenantMembership


def get_current_tenant(args):
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
    def resolve(self, next, root, info, **args):
        info.context.tenant = SimpleLazyObject(lambda: get_current_tenant(args))
        info.context.user_role = SimpleLazyObject(lambda: get_current_user_role(info))
        return next(root, info, **args)
