# Backfill RBAC for tenants that have no system roles (e.g. default tenants created
# after 0013) and for memberships that have no TenantMembershipRole. Allows removing
# the legacy role fallback so RBAC is the sole source of truth for all tenants.

from django.db import migrations


def create_system_roles_for_tenants_without_roles(apps, schema_editor):
    """
    Create system roles (OWNER, ADMIN, MEMBER) for tenants that have none.
    Idempotent: only touches tenants with zero organization roles.
    """
    from apps.multitenancy.permissions import ROLE_TEMPLATE_PERMISSIONS
    from apps.multitenancy.constants import SystemRoleType, RoleColor

    Tenant = apps.get_model('multitenancy', 'Tenant')
    OrganizationRole = apps.get_model('multitenancy', 'OrganizationRole')
    OrganizationRolePermission = apps.get_model('multitenancy', 'OrganizationRolePermission')
    Permission = apps.get_model('multitenancy', 'Permission')

    role_configs = [
        {
            'system_role_type': SystemRoleType.OWNER,
            'name': 'Owner',
            'description': 'Full access to all organization features',
            'color': RoleColor.PURPLE,
        },
        {
            'system_role_type': SystemRoleType.ADMIN,
            'name': 'Administrator',
            'description': 'Manage organization settings and members',
            'color': RoleColor.BLUE,
        },
        {
            'system_role_type': SystemRoleType.MEMBER,
            'name': 'Member',
            'description': 'View access to organization data',
            'color': RoleColor.GREEN,
        },
    ]

    for tenant in Tenant.objects.all():
        if OrganizationRole.objects.filter(tenant=tenant).exists():
            continue
        for config in role_configs:
            role, _ = OrganizationRole.objects.get_or_create(
                tenant=tenant,
                system_role_type=config['system_role_type'],
                defaults={
                    'name': config['name'],
                    'description': config['description'],
                    'color': config['color'],
                },
            )
            permission_codes = ROLE_TEMPLATE_PERMISSIONS.get(config['system_role_type'])
            if permission_codes is None:
                permissions = Permission.objects.all()
            else:
                permissions = Permission.objects.filter(code__in=permission_codes)
            for permission in permissions:
                OrganizationRolePermission.objects.get_or_create(
                    role=role,
                    permission=permission,
                )


def assign_rbac_roles_to_memberships_without_roles(apps, schema_editor):
    """
    Assign TenantMembershipRole based on legacy membership.role for any membership
    that has no RBAC role assignment. Idempotent: only touches memberships with
    zero TenantMembershipRole.
    """
    from apps.multitenancy.constants import TenantUserRole, SystemRoleType

    TenantMembership = apps.get_model('multitenancy', 'TenantMembership')
    TenantMembershipRole = apps.get_model('multitenancy', 'TenantMembershipRole')
    OrganizationRole = apps.get_model('multitenancy', 'OrganizationRole')

    legacy_to_system = {
        TenantUserRole.OWNER: SystemRoleType.OWNER,
        TenantUserRole.ADMIN: SystemRoleType.ADMIN,
        TenantUserRole.MEMBER: SystemRoleType.MEMBER,
    }

    for membership in TenantMembership.objects.all():
        if TenantMembershipRole.objects.filter(membership=membership).exists():
            continue
        system_role_type = legacy_to_system.get(membership.role)
        if not system_role_type:
            continue
        org_role = OrganizationRole.objects.filter(
            tenant=membership.tenant,
            system_role_type=system_role_type,
        ).first()
        if org_role:
            TenantMembershipRole.objects.get_or_create(
                membership=membership,
                role=org_role,
            )


class Migration(migrations.Migration):
    dependencies = [
        ('multitenancy', '0021_remove_organizationrole_unique_system_role_per_tenant_and_more'),
    ]

    operations = [
        migrations.RunPython(create_system_roles_for_tenants_without_roles, migrations.RunPython.noop),
        migrations.RunPython(assign_rbac_roles_to_memberships_without_roles, migrations.RunPython.noop),
    ]
