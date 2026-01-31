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

    CREATE = 'CREATE', 'Create'
    UPDATE = 'UPDATE', 'Update'
    DELETE = 'DELETE', 'Delete'
    SETTINGS_CHANGE = 'SETTINGS_CHANGE', 'Settings Change'
    IMPORT = 'IMPORT', 'Import'
    SYNC = 'SYNC', 'Sync'
    BULK_DELETE = 'BULK_DELETE', 'Bulk Delete'
    BULK_UPDATE = 'BULK_UPDATE', 'Bulk Update'
    ACTIVATE = 'ACTIVATE', 'Activate'
    DEACTIVATE = 'DEACTIVATE', 'Deactivate'
    REVOKE = 'REVOKE', 'Revoke'


class ActionEntityType(models.TextChoices):
    """Types of entities that can have actions logged."""

    # Multitenancy
    TENANT = 'tenant', 'Tenant'
    TENANT_MEMBERSHIP = 'tenant_membership', 'Tenant Membership'

    # Management Dashboard
    CLIENT = 'client', 'Client'
    CLIENT_BILLING_ADDRESS = 'client_billing_address', 'Client Billing Address'
    ROLE = 'role', 'Role'
    PROJECT = 'project', 'Project'
    PROJECT_SHARE = 'project_share', 'Project Share'
    PERSON = 'person', 'Person'
    PERSON_RATE = 'person_rate', 'Person Rate'
    PERSON_TYPE = 'person_type', 'Person Type'
    ITERATION = 'iteration', 'Iteration'
    ITERATION_ASSIGNMENT = 'iteration_assignment', 'Iteration Assignment'
    TIME_ENTRY = 'time_entry', 'Time Entry'
    REVENUE_LINE = 'revenue_line', 'Revenue Line'
    COST_LINE = 'cost_line', 'Cost Line'
    DEAL = 'deal', 'Deal'
    INVOICE = 'invoice', 'Invoice'
    INVOICE_REQUEST = 'invoice_request', 'Invoice Request'
    INVOICE_REQUEST_COMMENT = 'invoice_request_comment', 'Invoice Request Comment'
    INVOICE_FILE = 'invoice_file', 'Invoice File'
    FX_RATE = 'fx_rate', 'FX Rate'
    ORGANIZATION_SETTINGS = 'organization_settings', 'Organization Settings'
    FINANCIAL_TYPE = 'financial_type', 'Financial Type'
    FINANCIAL_TYPE_BUCKET = 'financial_type_bucket', 'Financial Type Bucket'
    MONTHLY_SUMMARY = 'monthly_summary', 'Monthly Summary'
    IMPORT = 'import', 'Import'

    # SSO
    SSO_CONNECTION = 'sso_connection', 'SSO Connection'
    SCIM_TOKEN = 'scim_token', 'SCIM Token'
    SSO_SESSION = 'sso_session', 'SSO Session'
    USER_DEVICE = 'user_device', 'User Device'
    PASSKEY = 'passkey', 'Passkey'

    # Finances
    SUBSCRIPTION = 'subscription', 'Subscription'
    PAYMENT_METHOD = 'payment_method', 'Payment Method'


class ActionActorType(models.TextChoices):
    """Types of actors that can perform actions."""

    USER = 'USER', 'User'
    AI_AGENT = 'AI_AGENT', 'AI Agent'
    SYSTEM_SYNC = 'SYSTEM:sync', 'System (Sync)'
    SYSTEM_IMPORT = 'SYSTEM:import', 'System (Import)'
    SYSTEM_SCHEDULED = 'SYSTEM:scheduled_task', 'System (Scheduled Task)'
    SYSTEM_MIGRATION = 'SYSTEM:migration', 'System (Migration)'


# ============ RBAC (Role-Based Access Control) ============


class PermissionCategory(models.TextChoices):
    """Categories for grouping permissions in the UI."""

    ORGANIZATION = 'organization', 'Organization'
    MEMBERS = 'members', 'Members'
    SECURITY = 'security', 'Security'
    BILLING = 'billing', 'Billing'
    FEATURES = 'features', 'Features'
    DASHBOARD = 'dashboard', 'Dashboard'  # Main app Dashboard/Home


class RoleColor(models.TextChoices):
    """Predefined colors for organization roles."""

    BLUE = 'blue', 'Blue'
    GREEN = 'green', 'Green'
    RED = 'red', 'Red'
    YELLOW = 'yellow', 'Yellow'
    PURPLE = 'purple', 'Purple'
    ORANGE = 'orange', 'Orange'
    PINK = 'pink', 'Pink'
    TEAL = 'teal', 'Teal'
    GRAY = 'gray', 'Gray'


class SystemRoleType(models.TextChoices):
    """System role types that serve as templates."""

    OWNER = 'OWNER', 'Owner'
    ADMIN = 'ADMIN', 'Administrator'
    MEMBER = 'MEMBER', 'Member'
