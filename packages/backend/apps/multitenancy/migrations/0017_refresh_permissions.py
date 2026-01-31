# Generated manually - refresh permissions to add invoice permissions

from django.db import migrations


def refresh_permissions(apps, schema_editor):
    """
    Re-seed all permissions from the registry to add any new permissions.
    This uses update_or_create to avoid duplicates while adding new ones.
    """
    from apps.multitenancy.permissions import PERMISSIONS
    
    Permission = apps.get_model('multitenancy', 'Permission')
    
    for perm_def in PERMISSIONS:
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


def update_system_roles_with_new_permissions(apps, schema_editor):
    """
    Update existing system roles (OWNER, ADMIN, MEMBER) with any new permissions
    that were added to the permission templates.
    """
    from apps.multitenancy.permissions import ROLE_TEMPLATE_PERMISSIONS
    from apps.multitenancy.constants import SystemRoleType
    
    OrganizationRole = apps.get_model('multitenancy', 'OrganizationRole')
    OrganizationRolePermission = apps.get_model('multitenancy', 'OrganizationRolePermission')
    Permission = apps.get_model('multitenancy', 'Permission')
    
    # Update each system role type
    for system_role_type in [SystemRoleType.OWNER, SystemRoleType.ADMIN, SystemRoleType.MEMBER]:
        roles = OrganizationRole.objects.filter(system_role_type=system_role_type)
        
        permission_codes = ROLE_TEMPLATE_PERMISSIONS.get(system_role_type)
        
        for role in roles:
            if permission_codes is None:
                # OWNER gets all permissions
                permissions = Permission.objects.all()
            else:
                permissions = Permission.objects.filter(code__in=permission_codes)
            
            # Add any missing permissions to the role
            for permission in permissions:
                OrganizationRolePermission.objects.get_or_create(
                    role=role,
                    permission=permission,
                )


class Migration(migrations.Migration):
    dependencies = [
        ('multitenancy', '0016_alter_permission_category'),
    ]

    operations = [
        migrations.RunPython(refresh_permissions, migrations.RunPython.noop),
        migrations.RunPython(update_system_roles_with_new_permissions, migrations.RunPython.noop),
    ]
