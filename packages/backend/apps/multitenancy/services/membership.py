from django.contrib.auth import get_user_model

from ..models import Tenant, TenantMembership
from ..constants import TenantUserRole

User = get_user_model()


def create_tenant_membership(user: User, tenant: Tenant, role: TenantUserRole = TenantUserRole.OWNER):
    membership = TenantMembership.objects.create(user=user, tenant=tenant, role=role)
    return membership
