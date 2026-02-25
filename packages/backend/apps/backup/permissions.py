"""
Backup app permission definitions and category.

Category and description are defined locally and registered so the tenant roles UI can show them.
"""

from typing import List

from apps.multitenancy.constants import SystemRoleType
from apps.multitenancy.permissions import (
    PermissionDefinition,
    register_app_permissions,
    register_permission_category,
    register_system_role_permissions,
)

# Category (UPPERCASE) and description for the roles UI
BACKUP_CATEGORY = 'BACKUP'
BACKUP_CATEGORY_LABEL = 'Backup'
BACKUP_CATEGORY_DESCRIPTION = 'Tenant backup and restore'

register_permission_category(BACKUP_CATEGORY, BACKUP_CATEGORY_LABEL, BACKUP_CATEGORY_DESCRIPTION)

# Grant backup permissions to ADMIN (OWNER gets all permissions)
register_system_role_permissions(SystemRoleType.ADMIN, ['backup.view', 'backup.manage'])

BACKUP_PERMISSIONS: List[PermissionDefinition] = [
    PermissionDefinition(
        code='backup.view',
        name='View Backup Settings',
        description='View backup configuration and history',
        category=BACKUP_CATEGORY,
        sort_order=10,
    ),
    PermissionDefinition(
        code='backup.manage',
        name='Manage Backups',
        description='Configure backups, trigger manual backups, and manage backup settings',
        category=BACKUP_CATEGORY,
        sort_order=20,
    ),
]

register_app_permissions(BACKUP_PERMISSIONS)
