# Generated manually - add cost rates view permission

from django.db import migrations


def add_costrates_permission(apps, schema_editor):
    """
    Add new cost rates view permission.
    """
    from apps.multitenancy.permissions import PERMISSIONS

    Permission = apps.get_model('multitenancy', 'Permission')

    # Find and create the new permission
    new_permission_code = 'management.people.rates.costrates.view'

    for perm_def in PERMISSIONS:
        if perm_def.code == new_permission_code:
            Permission.objects.update_or_create(
                code=perm_def.code,
                defaults={
                    'name': perm_def.name,
                    'description': perm_def.description,
                    'category': perm_def.category,
                    'sort_order': perm_def.sort_order,
                    'is_system': True,
                }
            )
            break


def update_system_roles_with_costrates_permission(apps, schema_editor):
    """
    Update existing system roles with the new cost rates permission:
    - OWNER: gets all permissions (handled automatically)
    - ADMIN: gets cost rates view permission
    - MEMBER: does NOT get this permission (cost data is sensitive)
    """
    from apps.multitenancy.constants import SystemRoleType

    OrganizationRole = apps.get_model('multitenancy', 'OrganizationRole')
    OrganizationRolePermission = apps.get_model('multitenancy', 'OrganizationRolePermission')
    Permission = apps.get_model('multitenancy', 'Permission')

    costrates_perm = Permission.objects.filter(code='management.people.rates.costrates.view').first()

    if not costrates_perm:
        return

    # Update OWNER roles (they get all permissions)
    owner_roles = OrganizationRole.objects.filter(system_role_type=SystemRoleType.OWNER)
    for role in owner_roles:
        OrganizationRolePermission.objects.get_or_create(role=role, permission=costrates_perm)

    # Update ADMIN roles (they get cost rates permission)
    admin_roles = OrganizationRole.objects.filter(system_role_type=SystemRoleType.ADMIN)
    for role in admin_roles:
        OrganizationRolePermission.objects.get_or_create(role=role, permission=costrates_perm)

    # MEMBER roles do NOT get this permission - cost data is sensitive


class Migration(migrations.Migration):
    dependencies = [
        ('multitenancy', '0019_alter_actionlog_actor_type'),
    ]

    operations = [
        migrations.RunPython(add_costrates_permission, migrations.RunPython.noop),
        migrations.RunPython(update_system_roles_with_costrates_permission, migrations.RunPython.noop),
    ]
