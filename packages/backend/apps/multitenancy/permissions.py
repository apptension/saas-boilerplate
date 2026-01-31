"""
Permission Registry for RBAC System.

This module defines all available permissions in the system, organized by category.
Permissions are seeded into the database via data migration.
"""

from dataclasses import dataclass
from typing import List

from .constants import PermissionCategory, SystemRoleType


@dataclass
class PermissionDefinition:
    """Definition of a permission for the registry."""

    code: str
    name: str
    description: str
    category: PermissionCategory
    sort_order: int = 0


# ============ Permission Registry ============

PERMISSIONS: List[PermissionDefinition] = [
    # ============ Organization Permissions ============
    PermissionDefinition(
        code='org.settings.view',
        name='View Organization Settings',
        description='View organization name, billing email, and general settings',
        category=PermissionCategory.ORGANIZATION,
        sort_order=10,
    ),
    PermissionDefinition(
        code='org.settings.edit',
        name='Edit Organization Settings',
        description='Modify organization name, billing email, and general settings',
        category=PermissionCategory.ORGANIZATION,
        sort_order=20,
    ),
    PermissionDefinition(
        code='org.delete',
        name='Delete Organization',
        description='Permanently delete the organization and all its data',
        category=PermissionCategory.ORGANIZATION,
        sort_order=30,
    ),
    PermissionDefinition(
        code='org.roles.view',
        name='View Organization Roles',
        description='View defined roles and their permissions',
        category=PermissionCategory.ORGANIZATION,
        sort_order=40,
    ),
    PermissionDefinition(
        code='org.roles.manage',
        name='Manage Organization Roles',
        description='Create, edit, and delete custom roles',
        category=PermissionCategory.ORGANIZATION,
        sort_order=50,
    ),
    # ============ Members Permissions ============
    PermissionDefinition(
        code='members.view',
        name='View Members',
        description='View the list of organization members and their roles',
        category=PermissionCategory.MEMBERS,
        sort_order=10,
    ),
    PermissionDefinition(
        code='members.invite',
        name='Invite Members',
        description='Send invitations to new members',
        category=PermissionCategory.MEMBERS,
        sort_order=20,
    ),
    PermissionDefinition(
        code='members.roles.edit',
        name='Edit Member Roles',
        description='Change roles assigned to existing members',
        category=PermissionCategory.MEMBERS,
        sort_order=30,
    ),
    PermissionDefinition(
        code='members.remove',
        name='Remove Members',
        description='Remove members from the organization',
        category=PermissionCategory.MEMBERS,
        sort_order=40,
    ),
    # ============ Security Permissions ============
    PermissionDefinition(
        code='security.view',
        name='View Security Settings',
        description='View SSO connections, passkeys, and security configurations',
        category=PermissionCategory.SECURITY,
        sort_order=10,
    ),
    PermissionDefinition(
        code='security.sso.manage',
        name='Manage SSO',
        description='Configure Single Sign-On connections and SCIM provisioning',
        category=PermissionCategory.SECURITY,
        sort_order=20,
    ),
    PermissionDefinition(
        code='security.passkeys.manage',
        name='Manage Passkeys',
        description='View and manage organization passkey policies',
        category=PermissionCategory.SECURITY,
        sort_order=30,
    ),
    PermissionDefinition(
        code='security.logs.view',
        name='View Activity Logs',
        description='View audit logs of actions performed in the organization',
        category=PermissionCategory.SECURITY,
        sort_order=40,
    ),
    PermissionDefinition(
        code='security.logs.export',
        name='Export Activity Logs',
        description='Export activity logs to CSV or other formats',
        category=PermissionCategory.SECURITY,
        sort_order=50,
    ),
    # ============ Billing Permissions ============
    PermissionDefinition(
        code='billing.view',
        name='View Billing',
        description='View subscription status, invoices, and payment methods',
        category=PermissionCategory.BILLING,
        sort_order=10,
    ),
    PermissionDefinition(
        code='billing.manage',
        name='Manage Billing',
        description='Change subscription plan, update payment methods, and manage billing',
        category=PermissionCategory.BILLING,
        sort_order=20,
    ),
    # ============ Features Permissions ============
    PermissionDefinition(
        code='features.ai.use',
        name='Use AI Features',
        description='Access and use OpenAI integration and AI-powered features',
        category=PermissionCategory.FEATURES,
        sort_order=10,
    ),
    PermissionDefinition(
        code='features.documents.view',
        name='View Documents',
        description='View uploaded documents',
        category=PermissionCategory.FEATURES,
        sort_order=20,
    ),
    PermissionDefinition(
        code='features.documents.manage',
        name='Manage Documents',
        description='Upload, edit, and delete documents',
        category=PermissionCategory.FEATURES,
        sort_order=30,
    ),
    PermissionDefinition(
        code='features.content.view',
        name='View Content Items',
        description='View content items from CMS',
        category=PermissionCategory.FEATURES,
        sort_order=40,
    ),
    PermissionDefinition(
        code='features.crud.view',
        name='View CRUD Demo Items',
        description='View CRUD demo items',
        category=PermissionCategory.FEATURES,
        sort_order=50,
    ),
    PermissionDefinition(
        code='features.crud.manage',
        name='Manage CRUD Demo Items',
        description='Create, edit, and delete CRUD demo items',
        category=PermissionCategory.FEATURES,
        sort_order=60,
    ),
    # ============ Dashboard Permissions (Main App Dashboard/Home) ============
    PermissionDefinition(
        code='dashboard.view',
        name='View Dashboard',
        description='Access the main app dashboard/home page',
        category=PermissionCategory.DASHBOARD,
        sort_order=10,
    ),
]


# ============ Role Templates ============

# Define which permissions each system role template has by default
ROLE_TEMPLATE_PERMISSIONS = {
    SystemRoleType.OWNER: None,  # None means ALL permissions
    SystemRoleType.ADMIN: [
        # Organization (no delete)
        'org.settings.view',
        'org.settings.edit',
        'org.roles.view',
        'org.roles.manage',
        # Members
        'members.view',
        'members.invite',
        'members.roles.edit',
        'members.remove',
        # Security
        'security.view',
        'security.sso.manage',
        'security.passkeys.manage',
        'security.logs.view',
        'security.logs.export',
        # Billing (view only)
        'billing.view',
        # Features (all)
        'features.ai.use',
        'features.documents.view',
        'features.documents.manage',
        'features.content.view',
        'features.crud.view',
        'features.crud.manage',
        # Dashboard (main app)
        'dashboard.view',
    ],
    SystemRoleType.MEMBER: [
        # Organization (view only)
        'org.settings.view',
        'org.roles.view',
        # Members (view only)
        'members.view',
        # Security (view only)
        'security.view',
        # Features (view only)
        'features.ai.use',
        'features.documents.view',
        'features.content.view',
        'features.crud.view',
        # Dashboard (main app)
        'dashboard.view',
    ],
}


def seed_permissions(apps=None, schema_editor=None):
    """
    Seed all permissions into the database.
    Can be called from a data migration or management command.
    """
    if apps:
        Permission = apps.get_model('multitenancy', 'Permission')
    else:
        from .models import Permission

    for perm_def in PERMISSIONS:
        Permission.objects.update_or_create(
            code=perm_def.code,
            defaults={
                'name': perm_def.name,
                'description': perm_def.description,
                'category': perm_def.category,
                'sort_order': perm_def.sort_order,
                'is_system': True,
            },
        )


def get_permission_codes_for_category(category: PermissionCategory) -> list:
    """Get all permission codes for a specific category."""
    return [p.code for p in PERMISSIONS if p.category == category]


def get_all_permission_codes() -> list:
    """Get all permission codes."""
    return [p.code for p in PERMISSIONS]


def create_system_roles_for_tenant(tenant, apps=None):
    """
    Create system template roles (OWNER, ADMIN, MEMBER) for a tenant.
    Can be called from a data migration or when creating a new tenant.
    """
    if apps:
        OrganizationRole = apps.get_model('multitenancy', 'OrganizationRole')
        OrganizationRolePermission = apps.get_model('multitenancy', 'OrganizationRolePermission')
        Permission = apps.get_model('multitenancy', 'Permission')
    else:
        from .models import OrganizationRole, OrganizationRolePermission, Permission

    from .constants import RoleColor

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

    created_roles = []
    for config in role_configs:
        role, created = OrganizationRole.objects.get_or_create(
            tenant=tenant,
            system_role_type=config['system_role_type'],
            defaults={
                'name': config['name'],
                'description': config['description'],
                'color': config['color'],
            },
        )
        created_roles.append(role)

        # Assign permissions based on template
        permission_codes = ROLE_TEMPLATE_PERMISSIONS.get(config['system_role_type'])
        if permission_codes is None:
            # OWNER gets all permissions
            permissions = Permission.objects.all()
        else:
            permissions = Permission.objects.filter(code__in=permission_codes)

        for permission in permissions:
            OrganizationRolePermission.objects.get_or_create(
                role=role,
                permission=permission,
            )

    return created_roles
