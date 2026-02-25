from __future__ import annotations

"""
Permission Registry for RBAC System.

This module defines all available permissions in the system, organized by category.
Permissions are seeded into the database via data migration.
App modules can register a category with optional description via register_permission_category();
the tenant roles UI uses label + description from the API (generic Shield icon).
App modules can add permission codes to system roles (e.g. ADMIN) via register_system_role_permissions().
App modules can contribute permission definitions via register_app_permissions(); they are discovered
by importing each installed app's permissions module (apps.<app_label>.permissions), so no central edit
is needed when adding a new app.
"""

import importlib
from dataclasses import dataclass
from itertools import chain
from typing import List, Optional, Tuple, Union

from .constants import PermissionCategory, SystemRoleType

# App-defined categories (value, label, description); modules register on import
PERMISSION_CATEGORY_REGISTRY: List[Tuple[str, str, str]] = []

# Plugin-style: apps register their permission list; discovered by loading app.permissions modules
APP_PERMISSIONS_REGISTRY: List[List[PermissionDefinition]] = []

_perm_modules_loaded = False
_app_perm_modules_loaded = False


def register_app_permissions(permissions: List[PermissionDefinition]) -> None:
    """Register permission definitions from an app. Call from the app's permissions module on import."""
    APP_PERMISSIONS_REGISTRY.append(list(permissions))


def _load_app_permission_modules() -> None:
    """Import each installed app's permissions module (except multitenancy) so they call register_app_permissions."""
    global _app_perm_modules_loaded
    if _app_perm_modules_loaded:
        return
    _app_perm_modules_loaded = True
    try:
        from django.apps import apps

        for app_config in apps.get_app_configs():
            if not app_config.name.startswith("apps.") or app_config.name == "apps.multitenancy":
                continue
            try:
                importlib.import_module(f"{app_config.name}.permissions")
            except ImportError:
                pass
    except Exception:
        pass


def _ensure_permission_modules_loaded() -> None:
    """Load app permission modules once so they register categories."""
    global _perm_modules_loaded
    if not _perm_modules_loaded:
        get_all_permissions()
        _perm_modules_loaded = True


def register_permission_category(value: str, label: str, description: str = '') -> None:
    """Register an app-defined permission category with optional description."""
    if not any(v == value for v, _, _ in PERMISSION_CATEGORY_REGISTRY):
        PERMISSION_CATEGORY_REGISTRY.append((value, label, description or ''))


def get_category_display(value: str) -> Tuple[str, str]:
    """Return (label, description) for a category value. Used by GraphQL resolvers."""
    if not value:
        return ('', '')
    # Ensure app permission modules are loaded so they can register categories
    _ensure_permission_modules_loaded()
    value_upper = value.upper()
    for v, label, desc in PERMISSION_CATEGORY_REGISTRY:
        if v.upper() == value_upper:
            return (label, desc or '')
    from .constants import PermissionCategory

    value_lower = value.lower()
    for v, label in PermissionCategory.choices:
        if v == value_lower or v == value:
            return (label, '')
    return (value, '')


def _category_value(category: Union[PermissionCategory, str]) -> str:
    """Normalize category to DB string value."""
    return category if isinstance(category, str) else category.value


@dataclass
class PermissionDefinition:
    """Definition of a permission for the registry."""

    code: str
    name: str
    description: str
    category: Union[PermissionCategory, str]  # str for app-defined categories
    sort_order: int = 0


# ============ Permission Registry ============

PERMISSIONS: List[PermissionDefinition] = [
    # ============ Organization Permissions ============
    PermissionDefinition(
        code="org.settings.view",
        name="View Organization Settings",
        description="View organization name, billing email, and general settings",
        category=PermissionCategory.ORGANIZATION,
        sort_order=10,
    ),
    PermissionDefinition(
        code="org.settings.edit",
        name="Edit Organization Settings",
        description="Modify organization name, billing email, and general settings",
        category=PermissionCategory.ORGANIZATION,
        sort_order=20,
    ),
    PermissionDefinition(
        code="org.delete",
        name="Delete Organization",
        description="Permanently delete the organization and all its data",
        category=PermissionCategory.ORGANIZATION,
        sort_order=30,
    ),
    PermissionDefinition(
        code="org.roles.view",
        name="View Organization Roles",
        description="View defined roles and their permissions",
        category=PermissionCategory.ORGANIZATION,
        sort_order=40,
    ),
    PermissionDefinition(
        code="org.roles.manage",
        name="Manage Organization Roles",
        description="Create, edit, and delete custom roles",
        category=PermissionCategory.ORGANIZATION,
        sort_order=50,
    ),
    # ============ Members Permissions ============
    PermissionDefinition(
        code="members.view",
        name="View Members",
        description="View the list of organization members and their roles",
        category=PermissionCategory.MEMBERS,
        sort_order=10,
    ),
    PermissionDefinition(
        code="members.invite",
        name="Invite Members",
        description="Send invitations to new members",
        category=PermissionCategory.MEMBERS,
        sort_order=20,
    ),
    PermissionDefinition(
        code="members.roles.edit",
        name="Edit Member Roles",
        description="Change roles assigned to existing members",
        category=PermissionCategory.MEMBERS,
        sort_order=30,
    ),
    PermissionDefinition(
        code="members.remove",
        name="Remove Members",
        description="Remove members from the organization",
        category=PermissionCategory.MEMBERS,
        sort_order=40,
    ),
    # ============ Security Permissions ============
    PermissionDefinition(
        code="security.view",
        name="View Security Settings",
        description="View SSO connections, passkeys, and security configurations",
        category=PermissionCategory.SECURITY,
        sort_order=10,
    ),
    PermissionDefinition(
        code="security.sso.manage",
        name="Manage SSO",
        description="Configure Single Sign-On connections and SCIM provisioning",
        category=PermissionCategory.SECURITY,
        sort_order=20,
    ),
    PermissionDefinition(
        code="security.passkeys.manage",
        name="Manage Passkeys",
        description="View and manage organization passkey policies",
        category=PermissionCategory.SECURITY,
        sort_order=30,
    ),
    PermissionDefinition(
        code="security.logs.view",
        name="View Activity Logs",
        description="View audit logs of actions performed in the organization",
        category=PermissionCategory.SECURITY,
        sort_order=40,
    ),
    PermissionDefinition(
        code="security.logs.export",
        name="Export Activity Logs",
        description="Export activity logs to CSV or other formats",
        category=PermissionCategory.SECURITY,
        sort_order=50,
    ),
    # ============ Billing Permissions ============
    PermissionDefinition(
        code="billing.view",
        name="View Billing",
        description="View subscription status, invoices, and payment methods",
        category=PermissionCategory.BILLING,
        sort_order=10,
    ),
    PermissionDefinition(
        code="billing.manage",
        name="Manage Billing",
        description="Change subscription plan, update payment methods, and manage billing",
        category=PermissionCategory.BILLING,
        sort_order=20,
    ),
    # ============ Features Permissions ============
    PermissionDefinition(
        code="features.ai.use",
        name="Use AI Features",
        description="Access and use OpenAI integration and AI-powered features",
        category=PermissionCategory.FEATURES,
        sort_order=10,
    ),
    PermissionDefinition(
        code="features.documents.view",
        name="View Documents",
        description="View uploaded documents",
        category=PermissionCategory.FEATURES,
        sort_order=20,
    ),
    PermissionDefinition(
        code="features.documents.manage",
        name="Manage Documents",
        description="Upload, edit, and delete documents",
        category=PermissionCategory.FEATURES,
        sort_order=30,
    ),
    PermissionDefinition(
        code="features.content.view",
        name="View Content Items",
        description="View content items from CMS",
        category=PermissionCategory.FEATURES,
        sort_order=40,
    ),
    PermissionDefinition(
        code="features.crud.view",
        name="View CRUD Demo Items",
        description="View CRUD demo items",
        category=PermissionCategory.FEATURES,
        sort_order=50,
    ),
    PermissionDefinition(
        code="features.crud.manage",
        name="Manage CRUD Demo Items",
        description="Create, edit, and delete CRUD demo items",
        category=PermissionCategory.FEATURES,
        sort_order=60,
    ),
    # ============ Dashboard Permissions (Main App Dashboard/Home) ============
    PermissionDefinition(
        code="dashboard.view",
        name="View Dashboard",
        description="Access the main app dashboard/home page",
        category=PermissionCategory.DASHBOARD,
        sort_order=10,
    ),
]


def get_all_permissions() -> List[PermissionDefinition]:
    """All permissions (multitenancy + app-registered permissions from plugin modules)."""
    _load_app_permission_modules()
    return PERMISSIONS + list(chain.from_iterable(APP_PERMISSIONS_REGISTRY))


# ============ Role Templates ============

# App modules can add permission codes to system roles via register_system_role_permissions()
SYSTEM_ROLE_EXTRA_PERMISSIONS: List[Tuple[SystemRoleType, List[str]]] = []


def register_system_role_permissions(role_type: SystemRoleType, permission_codes: List[str]) -> None:
    """Register extra permission codes for a system role (e.g. backup app for ADMIN)."""
    SYSTEM_ROLE_EXTRA_PERMISSIONS.append((role_type, list(permission_codes)))


def get_effective_role_template_permissions(role_type: SystemRoleType) -> Optional[List[str]]:
    """Permission codes for a system role: base template + any registered by apps."""
    _ensure_permission_modules_loaded()
    base = ROLE_TEMPLATE_PERMISSIONS.get(role_type)
    extras = [codes for r, codes in SYSTEM_ROLE_EXTRA_PERMISSIONS if r == role_type]
    if base is None:
        return None
    all_codes = list(base) + [c for codes in extras for c in codes]
    seen: set = set()
    return [c for c in all_codes if c not in seen and not seen.add(c)]


# Define which permissions each system role template has by default (apps add via register_system_role_permissions)
ROLE_TEMPLATE_PERMISSIONS = {
    SystemRoleType.OWNER: None,  # None means ALL permissions
    SystemRoleType.ADMIN: [
        # Organization (no delete)
        "org.settings.view",
        "org.settings.edit",
        "org.roles.view",
        "org.roles.manage",
        # Members
        "members.view",
        "members.invite",
        "members.roles.edit",
        "members.remove",
        # Security
        "security.view",
        "security.sso.manage",
        "security.passkeys.manage",
        "security.logs.view",
        "security.logs.export",
        # Billing (view only)
        "billing.view",
        # Features (all)
        "features.ai.use",
        "features.documents.view",
        "features.documents.manage",
        "features.content.view",
        "features.crud.view",
        "features.crud.manage",
        # Dashboard (main app)
        "dashboard.view",
    ],
    SystemRoleType.MEMBER: [
        # Organization (view only)
        "org.settings.view",
        "org.roles.view",
        # Members (view only)
        "members.view",
        # Security (view only)
        "security.view",
        # Features (view only)
        "features.ai.use",
        "features.documents.view",
        "features.content.view",
        "features.crud.view",
        # Dashboard (main app)
        "dashboard.view",
    ],
}


def seed_permissions(apps=None, schema_editor=None):
    """
    Seed all permissions into the database.
    Can be called from a data migration or management command.
    """
    if apps:
        Permission = apps.get_model("multitenancy", "Permission")
    else:
        from .models import Permission

    for perm_def in get_all_permissions():
        Permission.objects.update_or_create(
            code=perm_def.code,
            defaults={
                "name": perm_def.name,
                "description": perm_def.description,
                'category': _category_value(perm_def.category),
                "sort_order": perm_def.sort_order,
                "is_system": True,
            },
        )


def get_permission_codes_for_category(category: Union[PermissionCategory, str]) -> list:
    """Get all permission codes for a specific category."""
    want = _category_value(category)
    return [p.code for p in get_all_permissions() if _category_value(p.category) == want]


def get_all_permission_codes() -> list:
    """Get all permission codes."""
    return [p.code for p in get_all_permissions()]


def create_system_roles_for_tenant(tenant, apps=None):
    """
    Create system template roles (OWNER, ADMIN, MEMBER) for a tenant.
    Can be called from a data migration or when creating a new tenant.
    """
    if apps:
        OrganizationRole = apps.get_model("multitenancy", "OrganizationRole")
        OrganizationRolePermission = apps.get_model("multitenancy", "OrganizationRolePermission")
        Permission = apps.get_model("multitenancy", "Permission")
    else:
        from .models import OrganizationRole, OrganizationRolePermission, Permission

    from .constants import RoleColor

    role_configs = [
        {
            "system_role_type": SystemRoleType.OWNER,
            "name": "Owner",
            "description": "Full access to all organization features",
            "color": RoleColor.PURPLE,
        },
        {
            "system_role_type": SystemRoleType.ADMIN,
            "name": "Administrator",
            "description": "Manage organization settings and members",
            "color": RoleColor.BLUE,
        },
        {
            "system_role_type": SystemRoleType.MEMBER,
            "name": "Member",
            "description": "View access to organization data",
            "color": RoleColor.GREEN,
        },
    ]

    created_roles = []
    for config in role_configs:
        role, created = OrganizationRole.objects.get_or_create(
            tenant=tenant,
            system_role_type=config["system_role_type"],
            defaults={
                "name": config["name"],
                "description": config["description"],
                "color": config["color"],
            },
        )
        created_roles.append(role)

        # Assign permissions based on template (base + app-registered extras)
        permission_codes = get_effective_role_template_permissions(config['system_role_type'])
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
