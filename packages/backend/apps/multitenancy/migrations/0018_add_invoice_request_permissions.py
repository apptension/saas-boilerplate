# Generated manually - add invoice request and review permissions

from django.db import migrations


def add_invoice_permissions(apps, schema_editor):
    """
    Add new invoice request and review permissions.
    """
    from apps.multitenancy.permissions import PERMISSIONS
    
    Permission = apps.get_model('multitenancy', 'Permission')
    
    # Find and create the new invoice permissions
    new_permission_codes = ['management.invoices.request', 'management.invoices.review']
    
    for perm_def in PERMISSIONS:
        if perm_def.code in new_permission_codes:
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


def update_system_roles_with_invoice_permissions(apps, schema_editor):
    """
    Update existing system roles with the new invoice permissions:
    - OWNER: gets all permissions (handled automatically)
    - ADMIN: gets both request and review permissions
    - MEMBER: gets request permission only (can submit requests, not review them)
    """
    from apps.multitenancy.constants import SystemRoleType
    
    OrganizationRole = apps.get_model('multitenancy', 'OrganizationRole')
    OrganizationRolePermission = apps.get_model('multitenancy', 'OrganizationRolePermission')
    Permission = apps.get_model('multitenancy', 'Permission')
    
    request_perm = Permission.objects.filter(code='management.invoices.request').first()
    review_perm = Permission.objects.filter(code='management.invoices.review').first()
    
    if not request_perm or not review_perm:
        return
    
    # Update OWNER roles (they get all permissions)
    owner_roles = OrganizationRole.objects.filter(system_role_type=SystemRoleType.OWNER)
    for role in owner_roles:
        OrganizationRolePermission.objects.get_or_create(role=role, permission=request_perm)
        OrganizationRolePermission.objects.get_or_create(role=role, permission=review_perm)
    
    # Update ADMIN roles (they get both permissions)
    admin_roles = OrganizationRole.objects.filter(system_role_type=SystemRoleType.ADMIN)
    for role in admin_roles:
        OrganizationRolePermission.objects.get_or_create(role=role, permission=request_perm)
        OrganizationRolePermission.objects.get_or_create(role=role, permission=review_perm)
    
    # Update MEMBER roles (they can request but not review)
    member_roles = OrganizationRole.objects.filter(system_role_type=SystemRoleType.MEMBER)
    for role in member_roles:
        OrganizationRolePermission.objects.get_or_create(role=role, permission=request_perm)


class Migration(migrations.Migration):
    dependencies = [
        ('multitenancy', '0017_refresh_permissions'),
    ]

    operations = [
        migrations.RunPython(add_invoice_permissions, migrations.RunPython.noop),
        migrations.RunPython(update_system_roles_with_invoice_permissions, migrations.RunPython.noop),
    ]
