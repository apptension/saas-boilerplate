import hashid_field

from django.db import models, IntegrityError, transaction
from django.conf import settings
from django.utils.text import slugify
from django.db.models import UniqueConstraint, Q
from django.core.cache import cache

from . import constants
from .managers import TenantManager, TenantMembershipManager
from common.models import TimestampedMixin


class Tenant(TimestampedMixin, models.Model):
    """
    Represents a tenant within the application.

    Fields:
    - id: A unique identifier for the tenant.
    - creator: The user who created the tenant.
    - name: The name of the tenant.
    - slug: A URL-friendly version of the name.
    - type: The type of the tenant.
    - billing_email: Address used for billing purposes and it is provided to Stripe
    - members: Many-to-many relationship with users through TenantMembership.
    - action_logging_enabled: Whether action logging is enabled for this tenant.

    Methods:
    - save: Overrides the default save method to ensure unique slug generation based on the name field.

    Initialization:
    - __original_name: Private attribute to track changes to the name field during the instance's lifecycle.

    Slug Generation:
    - The save method ensures the generation of a unique slug for the tenant. If the name is modified or the slug is
      not provided, it generates a slug based on the name. In case of a name collision, a counter is appended to the
      base slug to ensure uniqueness.
    """

    id: str = hashid_field.HashidAutoField(primary_key=True)
    creator: settings.AUTH_USER_MODEL = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    name: str = models.CharField(max_length=100, unique=False)
    slug: str = models.SlugField(max_length=100, unique=True)
    type: str = models.CharField(choices=constants.TenantType.choices)
    members = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        through='TenantMembership',
        related_name='tenants',
        blank=True,
        through_fields=('tenant', 'user'),
    )
    billing_email = models.EmailField(
        db_collation="case_insensitive",
        verbose_name="billing email address",
        max_length=255,
        unique=False,
        blank=True,
    )
    action_logging_enabled = models.BooleanField(
        default=False,
        help_text="Enable action logging for this organization",
    )

    objects = TenantManager()

    MAX_SAVE_ATTEMPTS = 10

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.__original_name = self.name

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        counter = 0
        while counter < self.MAX_SAVE_ATTEMPTS:
            try:
                with transaction.atomic():
                    if not counter:
                        self.slug = slugify(self.name)
                    else:
                        self.slug = f"{slugify(self.name)}-{counter}"
                    super().save(*args, **kwargs)
                    break
            except IntegrityError as e:
                if 'duplicate key' in str(e).lower():
                    counter += 1
                else:
                    raise e

    @property
    def email(self):
        return self.billing_email if self.billing_email else self.creator.email

    @property
    def owners_count(self):
        """
        Calculate the total number of tenant owners for this tenant.
        Returns the count of tenant owners.
        """
        return self.members.filter(tenant_memberships__role=constants.TenantUserRole.OWNER).count()

    @property
    def owners(self):
        """
        Returns the list of Users with an owner role.
        """
        return self.members.filter(tenant_memberships__role=constants.TenantUserRole.OWNER).all()


class TenantMembership(TimestampedMixin, models.Model):
    """
    Represents the membership of a user in a tenant. As well accepted as not accepted (invitations).

    Fields:
    - id: A unique identifier for the membership.
    - user: The user associated with the membership.
    - role: The role of the user in the tenant. Can be owner, admin or member.
    - tenant: The tenant to which the user belongs.
    - is_accepted: Indicates whether the membership invitation is accepted.
    - invitation_accepted_at: Timestamp when the invitation was accepted.
    - invitee_email_address: The email address of the invited user if not connected to an existing user.

    Constraints:
    - unique_non_null_user_and_tenant: Ensures the uniqueness of non-null user and tenant combinations.
    - unique_non_null_user_and_invitee_email_address: Ensures the uniqueness of non-null user and invitee email address
      combinations.
    """

    id: str = hashid_field.HashidAutoField(primary_key=True)
    # User - Tenant connection fields
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="tenant_memberships", null=True
    )
    creator: settings.AUTH_USER_MODEL = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="created_tenant_memberships"
    )
    role = models.CharField(choices=constants.TenantUserRole.choices, default=constants.TenantUserRole.OWNER)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name="user_memberships")

    # Invitation connected fields
    is_accepted = models.BooleanField(default=False)
    invitation_accepted_at = models.DateTimeField(null=True)
    invitee_email_address = models.EmailField(
        db_collation="case_insensitive",
        verbose_name="invitee email address",
        max_length=255,
        default="",
    )

    objects = TenantMembershipManager()

    class Meta:
        constraints = [
            UniqueConstraint(
                name="unique_non_null_user_and_tenant", fields=["user", "tenant"], condition=Q(user__isnull=False)
            ),
            UniqueConstraint(
                name="unique_non_null_user_and_invitee_email_address",
                fields=["invitee_email_address", "tenant"],
                condition=~Q(invitee_email_address__exact=""),
            ),
        ]

    def __str__(self):
        return f"{self.user.email} {self.tenant.name} {self.role}"


class ActionLog(TimestampedMixin, models.Model):
    """
    Log of actions performed within a tenant/organization.
    Captures full audit trail with field-level changes (old/new values).

    This is a core feature available to all tenants, allowing owners to:
    - Track who made what changes and when
    - See detailed field-level diffs for each change
    - Filter by entity type, action type, actor, and date range
    """

    id: str = hashid_field.HashidAutoField(primary_key=True)
    tenant = models.ForeignKey(
        Tenant,
        on_delete=models.CASCADE,
        related_name='action_logs',
    )

    # Action details
    action_type = models.CharField(
        max_length=20,
        choices=constants.ActionType.choices,
        help_text="Type of action performed",
    )
    entity_type = models.CharField(
        max_length=50,
        help_text="Type of entity affected (e.g., client, project, user)",
    )
    entity_id = models.CharField(
        max_length=100,
        help_text="ID of the affected entity",
    )
    entity_name = models.CharField(
        max_length=255,
        blank=True,
        help_text="Human-readable name of the entity for display",
    )

    # Actor information
    actor_type = models.CharField(
        max_length=30,
        choices=constants.ActionActorType.choices,
        default=constants.ActionActorType.USER,
        help_text="Type of actor that performed the action",
    )
    actor_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='action_logs',
        help_text="User who performed the action (null for system actions)",
    )
    actor_email = models.EmailField(
        blank=True,
        help_text="Email of the actor (stored for historical reference)",
    )

    # Change details - stores {field: {old: value, new: value}}
    changes = models.JSONField(
        default=dict,
        help_text="Field-level changes with old and new values",
    )

    # Additional context
    metadata = models.JSONField(
        default=dict,
        blank=True,
        help_text="Additional context (import session ID, source system, etc.)",
    )

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Action Log"
        verbose_name_plural = "Action Logs"
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['tenant', '-created_at']),
            models.Index(fields=['entity_type']),
            models.Index(fields=['action_type']),
            models.Index(fields=['actor_user']),
        ]

    def __str__(self):
        actor = self.actor_email or self.actor_type
        return f"{self.action_type} {self.entity_type} '{self.entity_name}' by {actor}"


class ActionLogExport(TimestampedMixin, models.Model):
    """
    Tracks async export jobs for action logs.

    When a user requests an export, a job is created and processed asynchronously.
    Once complete, the user receives a notification with a download link.
    """

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        PROCESSING = 'processing', 'Processing'
        COMPLETED = 'completed', 'Completed'
        FAILED = 'failed', 'Failed'

    id: str = hashid_field.HashidAutoField(primary_key=True)
    tenant = models.ForeignKey(
        Tenant,
        on_delete=models.CASCADE,
        related_name='action_log_exports',
    )
    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='action_log_exports',
    )

    # Status tracking
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    error_message = models.TextField(blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    # Filter parameters (stored for the async task)
    filters = models.JSONField(
        default=dict,
        help_text="Filter parameters used for the export",
    )

    # Result
    file_path = models.CharField(
        max_length=500,
        blank=True,
        help_text="Path to the generated file in storage",
    )
    file_size = models.BigIntegerField(
        null=True,
        blank=True,
        help_text="Size of the generated file in bytes",
    )
    log_count = models.IntegerField(
        null=True,
        blank=True,
        help_text="Number of logs in the export",
    )

    # Celery task tracking
    celery_task_id = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Action Log Export"
        verbose_name_plural = "Action Log Exports"

    def __str__(self):
        return f"Export {self.id} for {self.tenant.name} ({self.status})"

    def get_download_url(self, expiration=3600):
        """
        Generate a presigned download URL for the export file.

        Uses the exports storage backend which properly handles signed URLs
        with SigV4 for Cloudflare R2 and other S3-compatible services.
        """
        if not self.file_path:
            return None

        from common.storages import get_exports_storage

        try:
            # Uses exports-specific storage backend with proper SigV4 signing for R2
            storage = get_exports_storage()
            return storage.url(self.file_path)
        except Exception:
            return None


# ============ RBAC (Role-Based Access Control) Models ============


class Permission(models.Model):
    """
    Catalog of available permissions in the system.

    Permissions are global (not tenant-specific) and define what actions
    users can perform. They are organized by category for better UX.

    Permission codes follow a hierarchical naming convention:
    - category.resource.action (e.g., 'dashboard.projects.edit')
    - Wildcard permissions like 'dashboard.*' can be used for convenience
    """

    id: str = hashid_field.HashidAutoField(primary_key=True)
    code = models.CharField(
        max_length=100,
        unique=True,
        help_text="Unique permission code (e.g., 'dashboard.projects.edit')",
    )
    name = models.CharField(
        max_length=100,
        help_text="Human-readable name for display",
    )
    description = models.TextField(
        blank=True,
        help_text="Detailed description of what this permission allows",
    )
    category = models.CharField(
        max_length=50,
        choices=constants.PermissionCategory.choices,
        help_text="Category for grouping in UI",
    )
    is_system = models.BooleanField(
        default=True,
        help_text="System permissions cannot be deleted",
    )
    sort_order = models.IntegerField(
        default=0,
        help_text="Order within category for UI display",
    )

    class Meta:
        ordering = ['category', 'sort_order', 'name']
        verbose_name = "Permission"
        verbose_name_plural = "Permissions"

    def __str__(self):
        return f"{self.name} ({self.code})"


class OrganizationRole(TimestampedMixin, models.Model):
    """
    Custom roles defined per tenant/organization.

    Each tenant can have:
    - System template roles (OWNER, ADMIN, MEMBER) that are auto-created
    - Custom roles created by organization owners

    The OWNER role is special and always has all permissions.
    """

    id: str = hashid_field.HashidAutoField(primary_key=True)
    tenant = models.ForeignKey(
        Tenant,
        on_delete=models.CASCADE,
        related_name='organization_roles',
    )
    name = models.CharField(
        max_length=100,
        help_text="Display name of the role",
    )
    description = models.TextField(
        blank=True,
        help_text="Description of the role's purpose",
    )
    system_role_type = models.CharField(
        max_length=20,
        choices=constants.SystemRoleType.choices,
        default='',
        blank=True,
        help_text="If set, this is a system template role",
    )
    color = models.CharField(
        max_length=20,
        choices=constants.RoleColor.choices,
        default=constants.RoleColor.BLUE,
        help_text="Color for UI display",
    )
    permissions = models.ManyToManyField(
        Permission,
        through='OrganizationRolePermission',
        related_name='roles',
        blank=True,
    )

    class Meta:
        ordering = ['tenant', 'name']
        verbose_name = "Organization Role"
        verbose_name_plural = "Organization Roles"
        constraints = [
            UniqueConstraint(
                fields=['tenant', 'name'],
                name='unique_org_role_name_per_tenant',
            ),
            UniqueConstraint(
                fields=['tenant', 'system_role_type'],
                name='unique_system_role_per_tenant',
                condition=Q(system_role_type__gt=''),
            ),
        ]

    def __str__(self):
        return f"{self.name} ({self.tenant.name})"

    @property
    def is_system_role(self):
        """Check if this is a system template role."""
        return bool(self.system_role_type)

    @property
    def is_owner_role(self):
        """Check if this is the owner role (has all permissions)."""
        return self.system_role_type == constants.SystemRoleType.OWNER

    def has_permission(self, permission_code):
        """
        Check if this role has a specific permission.

        Owner role always has all permissions.
        Supports wildcard matching (e.g., 'dashboard.*' matches 'dashboard.projects.view').
        """
        if self.is_owner_role:
            return True

        # Check for exact match or wildcard
        role_permissions = self.permissions.values_list('code', flat=True)
        for perm in role_permissions:
            if perm == permission_code:
                return True
            # Check wildcard (e.g., 'dashboard.*')
            if perm.endswith('.*'):
                prefix = perm[:-2]  # Remove '.*'
                if permission_code.startswith(prefix + '.'):
                    return True
        return False


class OrganizationRolePermission(models.Model):
    """
    Junction table linking OrganizationRole to Permission.
    """

    id: str = hashid_field.HashidAutoField(primary_key=True)
    role = models.ForeignKey(
        OrganizationRole,
        on_delete=models.CASCADE,
        related_name='role_permissions',
    )
    permission = models.ForeignKey(
        Permission,
        on_delete=models.CASCADE,
        related_name='permission_roles',
    )

    class Meta:
        verbose_name = "Role Permission"
        verbose_name_plural = "Role Permissions"
        constraints = [
            UniqueConstraint(
                fields=['role', 'permission'],
                name='unique_role_permission',
            ),
        ]

    def __str__(self):
        return f"{self.role.name} -> {self.permission.code}"


class TenantMembershipRole(models.Model):
    """
    Junction table linking TenantMembership to OrganizationRole.

    Supports multi-role assignment: a user can have multiple roles
    in the same organization, and their effective permissions are
    the union of all assigned role permissions.
    """

    id: str = hashid_field.HashidAutoField(primary_key=True)
    membership = models.ForeignKey(
        TenantMembership,
        on_delete=models.CASCADE,
        related_name='membership_roles',
    )
    role = models.ForeignKey(
        OrganizationRole,
        on_delete=models.CASCADE,
        related_name='member_assignments',
    )
    assigned_at = models.DateTimeField(auto_now_add=True)
    assigned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_membership_roles',
    )

    class Meta:
        verbose_name = "Membership Role"
        verbose_name_plural = "Membership Roles"
        constraints = [
            UniqueConstraint(
                fields=['membership', 'role'],
                name='unique_membership_role',
            ),
        ]

    def __str__(self):
        user_email = self.membership.user.email if self.membership.user else self.membership.invitee_email_address
        return f"{user_email} -> {self.role.name}"


# ============ Helper Functions for Permission Checking ============


def get_user_permissions_for_tenant(user, tenant):
    """
    Get all permission codes for a user in a specific tenant.

    Returns a set of permission codes from all assigned roles.
    Uses caching for performance.
    """
    if not user or not tenant:
        return set()

    cache_key = f"user_permissions:{user.id}:{tenant.id}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    membership = TenantMembership.objects.filter(
        user=user,
        tenant=tenant,
        is_accepted=True,
    ).first()

    if not membership:
        return set()

    # Check if user has owner role (has all permissions)
    membership_roles = TenantMembershipRole.objects.filter(membership=membership).select_related('role')

    permissions = set()
    for mr in membership_roles:
        if mr.role.is_owner_role:
            # Owner has all permissions - get all permission codes
            all_perms = Permission.objects.values_list('code', flat=True)
            permissions = set(all_perms)
            break
        else:
            # Get permissions from this role
            role_perms = mr.role.permissions.values_list('code', flat=True)
            permissions.update(role_perms)

    # Also check legacy role field for backward compatibility
    if membership.role == constants.TenantUserRole.OWNER:
        all_perms = Permission.objects.values_list('code', flat=True)
        permissions = set(all_perms)
    elif membership.role in (constants.TenantUserRole.ADMIN, constants.TenantUserRole.MEMBER):
        # For legacy ADMIN and MEMBER roles without RBAC, grant default read permissions
        # This ensures backward compatibility for tests and older setups
        if not permissions:  # Only add defaults if no RBAC permissions exist
            default_perms = [
                'features.crud.view',
                'features.crud.manage',
                'features.documents.view',
                'features.documents.manage',
                'members.view',
            ]
            permissions.update(default_perms)
            if membership.role == constants.TenantUserRole.ADMIN:
                # Admins get additional view permissions (not invite/manage)
                permissions.update(
                    [
                        'org.settings.view',
                    ]
                )

    # Cache for 5 minutes
    cache.set(cache_key, permissions, 300)
    return permissions


def user_has_permission(user, tenant, permission_code):
    """
    Check if a user has a specific permission in a tenant.

    Supports wildcard matching in role permissions.
    """
    permissions = get_user_permissions_for_tenant(user, tenant)

    if permission_code in permissions:
        return True

    # Check for wildcard permissions
    for perm in permissions:
        if perm.endswith('.*'):
            prefix = perm[:-2]
            if permission_code.startswith(prefix + '.'):
                return True

    return False


def invalidate_user_permissions_cache(user_id, tenant_id):
    """
    Invalidate the cached permissions for a user in a tenant.

    Call this when:
    - User's roles change
    - Role's permissions change
    - User is removed from tenant
    """
    cache_key = f"user_permissions:{user_id}:{tenant_id}"
    cache.delete(cache_key)
