import factory

from .. import models
from .. import constants


class TenantFactory(factory.django.DjangoModelFactory):
    creator = factory.SubFactory("apps.users.tests.factories.UserFactory")
    type = factory.Iterator(constants.TenantType.values)
    name = factory.Faker("pystr")
    slug = factory.Faker("pystr")
    billing_email = factory.Faker("email")
    created_at = factory.Faker("date_time")
    updated_at = factory.Faker("date_time")

    class Meta:
        model = models.Tenant


def _ensure_rbac_role_for_membership(membership):
    """
    Ensure the tenant has system roles and assign the RBAC role matching
    membership.role (legacy) so permission checks work without legacy fallback.
    """
    from ..constants import SystemRoleType
    from ..permissions import create_system_roles_for_tenant

    if not membership.user_id:
        return
    legacy_to_system = {
        constants.TenantUserRole.OWNER: SystemRoleType.OWNER,
        constants.TenantUserRole.ADMIN: SystemRoleType.ADMIN,
        constants.TenantUserRole.MEMBER: SystemRoleType.MEMBER,
    }
    system_role_type = legacy_to_system.get(membership.role)
    if not system_role_type:
        return
    tenant = membership.tenant
    if not models.OrganizationRole.objects.filter(tenant=tenant).exists():
        create_system_roles_for_tenant(tenant)
    org_role = models.OrganizationRole.objects.filter(
        tenant=tenant, system_role_type=system_role_type
    ).first()
    if org_role:
        models.TenantMembershipRole.objects.get_or_create(
            membership=membership,
            role=org_role,
            defaults={"assigned_by_id": membership.user_id},
        )


class TenantMembershipFactory(factory.django.DjangoModelFactory):
    user = factory.SubFactory("apps.users.tests.factories.UserFactory")
    creator = factory.SubFactory("apps.users.tests.factories.UserFactory")
    tenant = factory.SubFactory(TenantFactory)
    role = factory.Iterator(constants.TenantUserRole.values)
    created_at = factory.Faker("date_time")
    updated_at = factory.Faker("date_time")
    is_accepted = True

    class Meta:
        model = models.TenantMembership

    @factory.post_generation
    def ensure_rbac_role(obj, create, extracted, **kwargs):
        if create and obj.pk:
            _ensure_rbac_role_for_membership(obj)
