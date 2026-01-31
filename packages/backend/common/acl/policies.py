from rest_access_policy import AccessPolicy

from .helpers import make_statement, Action, Effect, Principal, CommonGroups, TenantRoles


class AdminFullAccess(AccessPolicy):
    statements = [make_statement(principal=Principal.group(CommonGroups.Admin), action=Action.Any, effect=Effect.Allow)]


class UserFullAccess(AccessPolicy):
    statements = [make_statement(principal=Principal.group(CommonGroups.User), action=Action.Any, effect=Effect.Allow)]


class IsAnonymousFullAccess(AccessPolicy):
    statements = [make_statement(principal=Principal.Anonymous, action=Action.Any, effect=Effect.Allow)]


class IsAuthenticatedFullAccess(AccessPolicy):
    statements = [make_statement(principal=Principal.Authenticated, action=Action.Any, effect=Effect.Allow)]


class AnyoneFullAccess(AccessPolicy):
    statements = [make_statement(principal=Principal.Any, action=Action.Any, effect=Effect.Allow)]


class IsAdminUser(AccessPolicy):
    """Access policy that requires the user to be a Django admin (is_superuser)."""

    statements = [make_statement(principal=Principal.Authenticated, action=Action.Any, effect=Effect.Allow)]

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.is_superuser


class TenantDependentAccess(AccessPolicy):
    """
    Base class for tenant-dependent access policies.

    Now supports BOTH legacy TenantUserRole AND new RBAC system:
    - Legacy: request.user_role (TenantUserRole.OWNER, ADMIN, MEMBER)
    - RBAC: Organization roles with SystemRoleType (OWNER, ADMIN, MEMBER)
    - RBAC Permissions: Specific permission codes can grant equivalent access

    RBAC Priority:
    1. Legacy role check (backward compatibility)
    2. SystemRoleType check (OWNER, ADMIN, MEMBER)
    3. is_owner_role flag on custom roles
    4. Permission-based access (specific permissions grant equivalent access)
    """

    # Permissions that grant owner-level access
    OWNER_EQUIVALENT_PERMISSIONS = [
        'org.roles.manage',  # Can manage roles = owner-level
        'org.delete',  # Can delete org = owner-level
    ]

    # Permissions that grant admin-level access (in addition to owner permissions)
    ADMIN_EQUIVALENT_PERMISSIONS = [
        'org.settings.edit',  # Can edit org settings
        'members.roles.edit',  # Can edit member roles
        'members.remove',  # Can remove members
        'security.sso.manage',  # Can manage SSO
    ]

    def _get_user_rbac_info(self, request) -> dict:
        """
        Get comprehensive RBAC info for the user in the current tenant.

        Returns dict with:
        - system_role_type: Highest SystemRoleType ('OWNER', 'ADMIN', 'MEMBER') or None
        - is_owner_role: True if user has any role with is_owner_role=True
        - has_roles: True if user has any RBAC roles assigned
        - permissions: Set of all permission codes the user has
        """
        result = {
            'system_role_type': None,
            'is_owner_role': False,
            'has_roles': False,
            'permissions': set(),
        }

        user = getattr(request, 'user', None)
        tenant = getattr(request, 'tenant', None)

        if not user or not user.is_authenticated or not tenant:
            return result

        try:
            # Import here to avoid circular imports
            from apps.multitenancy.models import TenantMembership, TenantMembershipRole, get_user_permissions_for_tenant
            from apps.multitenancy.constants import SystemRoleType

            # Get the user's membership in this tenant
            membership = TenantMembership.objects.filter(user=user, tenant=tenant, is_accepted=True).first()

            if not membership:
                return result

            # Get all RBAC roles assigned to this membership
            role_assignments = TenantMembershipRole.objects.filter(membership=membership).select_related('role')

            if role_assignments.exists():
                result['has_roles'] = True

            # Analyze roles
            role_types = []
            for ra in role_assignments:
                role = ra.role
                if role.system_role_type:
                    role_types.append(role.system_role_type)
                if role.is_owner_role:
                    result['is_owner_role'] = True

            # Determine highest role type
            if SystemRoleType.OWNER in role_types:
                result['system_role_type'] = SystemRoleType.OWNER
            elif SystemRoleType.ADMIN in role_types:
                result['system_role_type'] = SystemRoleType.ADMIN
            elif SystemRoleType.MEMBER in role_types:
                result['system_role_type'] = SystemRoleType.MEMBER

            # Get all permissions
            result['permissions'] = get_user_permissions_for_tenant(user, tenant)

            return result
        except Exception:
            return result

    def _has_any_permission(self, request, permission_codes: list) -> bool:
        """Check if user has any of the specified permissions."""
        user = getattr(request, 'user', None)
        tenant = getattr(request, 'tenant', None)

        if not user or not user.is_authenticated or not tenant:
            return False

        try:
            from apps.multitenancy.models import user_has_permission

            return any(user_has_permission(user, tenant, perm) for perm in permission_codes)
        except Exception:
            return False

    def is_request_from_tenant_owner(self, request, view, action) -> bool:
        """
        Check if user has owner-level access via legacy role, RBAC, or permissions.

        Returns True if ANY of these conditions are met:
        1. Legacy: request.user_role is OWNER
        2. RBAC: User has a role with SystemRoleType.OWNER
        3. RBAC: User has a role with is_owner_role=True
        4. Permissions: User has owner-equivalent permissions (org.roles.manage, org.delete)
        """
        # 1. Check legacy role first (fast path)
        if request.user_role in TenantRoles.Owner:
            return True

        # 2-4. Check RBAC
        rbac_info = self._get_user_rbac_info(request)

        # SystemRoleType.OWNER
        if rbac_info['system_role_type'] == 'OWNER':
            return True

        # is_owner_role flag
        if rbac_info['is_owner_role']:
            return True

        # Owner-equivalent permissions
        return bool(
            rbac_info['permissions']
            and any(perm in rbac_info['permissions'] for perm in self.OWNER_EQUIVALENT_PERMISSIONS)
        )

    def is_request_from_tenant_admin(self, request, view, action) -> bool:
        """
        Check if user has admin-level access (or higher) via legacy role, RBAC, or permissions.

        Returns True if ANY of these conditions are met:
        1. Legacy: request.user_role is OWNER or ADMIN
        2. RBAC: User has a role with SystemRoleType.OWNER or ADMIN
        3. RBAC: User has a role with is_owner_role=True
        4. Permissions: User has admin-equivalent permissions
        """
        # 1. Check legacy role first (fast path)
        if request.user_role in TenantRoles.Admin:
            return True

        # 2-4. Check RBAC
        rbac_info = self._get_user_rbac_info(request)

        # SystemRoleType.OWNER or ADMIN
        if rbac_info['system_role_type'] in ('OWNER', 'ADMIN'):
            return True

        # is_owner_role flag
        if rbac_info['is_owner_role']:
            return True

        # Admin-equivalent permissions (includes owner permissions)
        admin_permissions = self.OWNER_EQUIVALENT_PERMISSIONS + self.ADMIN_EQUIVALENT_PERMISSIONS
        return bool(rbac_info['permissions'] and any(perm in rbac_info['permissions'] for perm in admin_permissions))

    def is_request_from_tenant_member(self, request, view, action) -> bool:
        """
        Check if user is a tenant member (any role) via legacy role OR RBAC.

        Returns True if ANY of these conditions are met:
        1. Legacy: request.user_role is OWNER, ADMIN, or MEMBER
        2. RBAC: User has any role assignment in the tenant
        """
        # 1. Check legacy role first (fast path)
        if request.user_role in TenantRoles.Member:
            return True

        # 2. Check RBAC - any role means they're a member
        rbac_info = self._get_user_rbac_info(request)
        return bool(rbac_info['has_roles'])


class IsTenantOwnerAccess(TenantDependentAccess):
    """
    Access policy requiring Owner-level access.

    Allows access if user has:
    - Legacy TenantUserRole.OWNER
    - OR RBAC role with SystemRoleType.OWNER
    """

    statements = [
        make_statement(
            principal=Principal.Authenticated,
            action=Action.Any,
            effect=Effect.Allow,
            condition=["is_request_from_tenant_owner"],
        )
    ]


class IsTenantAdminAccess(TenantDependentAccess):
    """
    Access policy requiring Admin-level access (or higher).

    Allows access if user has:
    - Legacy TenantUserRole.OWNER or ADMIN
    - OR RBAC role with SystemRoleType.OWNER or ADMIN
    """

    statements = [
        make_statement(
            principal=Principal.Authenticated,
            action=Action.Any,
            effect=Effect.Allow,
            condition=["is_request_from_tenant_admin"],
        )
    ]


class IsTenantMemberAccess(TenantDependentAccess):
    """
    Access policy requiring Member-level access (any tenant member).

    Allows access if user has:
    - Any legacy TenantUserRole (OWNER, ADMIN, or MEMBER)
    - OR any RBAC role assignment in the tenant
    """

    statements = [
        make_statement(
            principal=Principal.Authenticated,
            action=Action.Any,
            effect=Effect.Allow,
            condition=["is_request_from_tenant_member"],
        )
    ]


class HasPermissionAccess(TenantDependentAccess):
    """
    Access policy that checks for specific RBAC permissions.

    This policy checks if the user has a specific permission code
    via their assigned organization roles.

    Usage:
        @permission_classes(HasPermissionAccess('dashboard.projects.edit'))
        def resolve_something(root, info, **kwargs):
            ...

    Or for multiple permissions (OR logic):
        @permission_classes(HasPermissionAccess(['dashboard.projects.edit', 'dashboard.projects.view']))
    """

    required_permissions = None  # Set by __init__ or subclass

    def __init__(self, permissions=None):
        """
        Initialize with required permissions.

        Args:
            permissions: A single permission code or list of codes.
                        If a list, user needs at least one of them (OR logic).
        """
        super().__init__()
        if permissions is not None:
            if isinstance(permissions, str):
                self.required_permissions = [permissions]
            else:
                self.required_permissions = list(permissions)

    def has_permission(self, request, view):
        """Check if user has any of the required permissions."""
        if not self.required_permissions:
            return True  # No specific permission required

        if not request.user or not request.user.is_authenticated:
            return False

        tenant = getattr(request, 'tenant', None)
        if not tenant:
            return False

        # Import here to avoid circular imports
        from apps.multitenancy.models import user_has_permission

        # Check if user has any of the required permissions
        return any(user_has_permission(request.user, tenant, perm_code) for perm_code in self.required_permissions)

    statements = [
        make_statement(
            principal=Principal.Authenticated,
            action=Action.Any,
            effect=Effect.Allow,
            condition=["has_required_permission"],
        )
    ]

    def has_required_permission(self, request, view, action) -> bool:
        """Condition check for permission-based access."""
        return self.has_permission(request, view)


def require_permission(*permission_codes):
    """
    Factory function to create a permission-based access policy.

    Usage:
        @permission_classes(require_permission('dashboard.projects.edit'))
        def resolve_something(root, info, **kwargs):
            ...
    """

    class PermissionPolicy(HasPermissionAccess):
        def __init__(self):
            super().__init__(list(permission_codes))

    return PermissionPolicy
