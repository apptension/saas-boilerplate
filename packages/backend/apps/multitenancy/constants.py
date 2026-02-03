from enum import Enum
from django.db import models


class TenantType(models.TextChoices):
    """
    DEFAULT is a tenant type created during user sign-up.
    It serves as the default tenant for them, ensuring that they always have at least one.
    ORGANIZATION is a tenant type for tenants created manually by the user for the purpose of inviting other members.
    """

    DEFAULT = "default", "Default"
    ORGANIZATION = "organization", "Organization"


class TenantUserRole(models.TextChoices):
    """
    Predefined tenant user roles:
    - OWNER
    - ADMIN
    - MEMBER
    """

    OWNER = "OWNER", "Owner"
    ADMIN = "ADMIN", "Administrator"
    MEMBER = "MEMBER", "Member"


class Notification(Enum):
    TENANT_INVITATION_CREATED = "TENANT_INVITATION_CREATED"
    TENANT_INVITATION_ACCEPTED = "TENANT_INVITATION_ACCEPTED"
    TENANT_INVITATION_DECLINED = "TENANT_INVITATION_DECLINED"


# ============ Action Logging ============


class ActionType(models.TextChoices):
    """Types of actions that can be logged."""

    CREATE = "CREATE", "Create"
    UPDATE = "UPDATE", "Update"
    DELETE = "DELETE", "Delete"
    SETTINGS_CHANGE = "SETTINGS_CHANGE", "Settings Change"
    IMPORT = "IMPORT", "Import"
    SYNC = "SYNC", "Sync"
    BULK_DELETE = "BULK_DELETE", "Bulk Delete"
    BULK_UPDATE = "BULK_UPDATE", "Bulk Update"
    ACTIVATE = "ACTIVATE", "Activate"
    DEACTIVATE = "DEACTIVATE", "Deactivate"
    REVOKE = "REVOKE", "Revoke"


class ActionEntityType(models.TextChoices):
    """Types of entities that can have actions logged."""

    # Multitenancy
    TENANT = "tenant", "Tenant"
    TENANT_MEMBERSHIP = "tenant_membership", "Tenant Membership"

    # SSO
    SSO_CONNECTION = "sso_connection", "SSO Connection"
    SCIM_TOKEN = "scim_token", "SCIM Token"
    SSO_SESSION = "sso_session", "SSO Session"
    USER_DEVICE = "user_device", "User Device"
    PASSKEY = "passkey", "Passkey"

    # Finances
    SUBSCRIPTION = "subscription", "Subscription"
    PAYMENT_METHOD = "payment_method", "Payment Method"


class ActionActorType(models.TextChoices):
    """Types of actors that can perform actions."""

    USER = "USER", "User"
    AI_AGENT = "AI_AGENT", "AI Agent"
    SYSTEM_SYNC = "SYSTEM:sync", "System (Sync)"
    SYSTEM_IMPORT = "SYSTEM:import", "System (Import)"
    SYSTEM_SCHEDULED = "SYSTEM:scheduled_task", "System (Scheduled Task)"
    SYSTEM_MIGRATION = "SYSTEM:migration", "System (Migration)"


# ============ RBAC (Role-Based Access Control) ============


class PermissionCategory(models.TextChoices):
    """Categories for grouping permissions in the UI."""

    ORGANIZATION = "organization", "Organization"
    MEMBERS = "members", "Members"
    SECURITY = "security", "Security"
    BILLING = "billing", "Billing"
    FEATURES = "features", "Features"
    DASHBOARD = "dashboard", "Dashboard"  # Main app Dashboard/Home


class RoleColor(models.TextChoices):
    """Predefined colors for organization roles."""

    BLUE = "blue", "Blue"
    GREEN = "green", "Green"
    RED = "red", "Red"
    YELLOW = "yellow", "Yellow"
    PURPLE = "purple", "Purple"
    ORANGE = "orange", "Orange"
    PINK = "pink", "Pink"
    TEAL = "teal", "Teal"
    GRAY = "gray", "Gray"


class SystemRoleType(models.TextChoices):
    """System role types that serve as templates."""

    OWNER = "OWNER", "Owner"
    ADMIN = "ADMIN", "Administrator"
    MEMBER = "MEMBER", "Member"
