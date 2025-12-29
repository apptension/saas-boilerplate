from enum import Enum
from django.db import models


class IdentityProviderType(models.TextChoices):
    """
    Supported Identity Provider protocols.
    """

    SAML = "saml", "SAML 2.0"
    OIDC = "oidc", "OpenID Connect"


class SSOConnectionStatus(models.TextChoices):
    """
    SSO connection configuration status.
    """

    DRAFT = "draft", "Draft"
    ACTIVE = "active", "Active"
    INACTIVE = "inactive", "Inactive"
    ERROR = "error", "Configuration Error"


class SAMLNameIdFormat(models.TextChoices):
    """
    SAML NameID formats.
    """

    EMAIL = "urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress", "Email Address"
    PERSISTENT = "urn:oasis:names:tc:SAML:2.0:nameid-format:persistent", "Persistent"
    TRANSIENT = "urn:oasis:names:tc:SAML:2.0:nameid-format:transient", "Transient"
    UNSPECIFIED = "urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified", "Unspecified"


class SSOAuditEventType(models.TextChoices):
    """
    Types of SSO audit events.
    """

    # Configuration events
    IDP_CONFIG_CREATED = "idp_config_created", "IdP Configuration Created"
    IDP_CONFIG_UPDATED = "idp_config_updated", "IdP Configuration Updated"
    IDP_CONFIG_DELETED = "idp_config_deleted", "IdP Configuration Deleted"
    IDP_CONFIG_ACTIVATED = "idp_config_activated", "IdP Configuration Activated"
    IDP_CONFIG_DEACTIVATED = "idp_config_deactivated", "IdP Configuration Deactivated"

    # Authentication events
    SSO_LOGIN_INITIATED = "sso_login_initiated", "SSO Login Initiated"
    SSO_LOGIN_SUCCESS = "sso_login_success", "SSO Login Success"
    SSO_LOGIN_FAILED = "sso_login_failed", "SSO Login Failed"
    SSO_LOGOUT = "sso_logout", "SSO Logout"

    # JIT Provisioning events
    USER_PROVISIONED = "user_provisioned", "User Provisioned via JIT"
    USER_UPDATED = "user_updated", "User Updated via SSO"
    GROUP_MAPPING_APPLIED = "group_mapping_applied", "Group Mapping Applied"

    # SCIM events
    SCIM_USER_CREATED = "scim_user_created", "SCIM User Created"
    SCIM_USER_UPDATED = "scim_user_updated", "SCIM User Updated"
    SCIM_USER_DELETED = "scim_user_deleted", "SCIM User Deleted"
    SCIM_GROUP_CREATED = "scim_group_created", "SCIM Group Created"
    SCIM_GROUP_UPDATED = "scim_group_updated", "SCIM Group Updated"
    SCIM_GROUP_DELETED = "scim_group_deleted", "SCIM Group Deleted"

    # Session events
    SESSION_CREATED = "session_created", "Session Created"
    SESSION_REVOKED = "session_revoked", "Session Revoked"
    DEVICE_REGISTERED = "device_registered", "Device Registered"
    DEVICE_REMOVED = "device_removed", "Device Removed"

    # WebAuthn events
    PASSKEY_REGISTERED = "passkey_registered", "Passkey Registered"
    PASSKEY_REMOVED = "passkey_removed", "Passkey Removed"
    PASSKEY_AUTH_SUCCESS = "passkey_auth_success", "Passkey Auth Success"
    PASSKEY_AUTH_FAILED = "passkey_auth_failed", "Passkey Auth Failed"


class Notification(Enum):
    """
    SSO-related notifications.
    """

    SSO_CONNECTION_ACTIVATED = "SSO_CONNECTION_ACTIVATED"
    SSO_CONNECTION_DEACTIVATED = "SSO_CONNECTION_DEACTIVATED"
    SSO_LOGIN_FROM_NEW_DEVICE = "SSO_LOGIN_FROM_NEW_DEVICE"
    PASSKEY_REGISTERED = "PASSKEY_REGISTERED"
    SESSION_REVOKED_REMOTELY = "SESSION_REVOKED_REMOTELY"
