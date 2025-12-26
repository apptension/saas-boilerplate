import hashid_field
import secrets
import json
from datetime import timedelta

from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.validators import MinLengthValidator

from common.models import TimestampedMixin
from apps.multitenancy.models import Tenant
from apps.multitenancy.constants import TenantUserRole
from . import constants
from . import managers


class TenantSSOConnection(TimestampedMixin, models.Model):
    """
    Represents an SSO connection configuration for a tenant.
    A tenant can have multiple SSO connections but typically only one is active.
    
    This model stores both SAML and OIDC configuration depending on the type.
    Sensitive data like certificates and secrets are stored encrypted in AWS Secrets Manager
    and only the secret ARN is stored here.
    """

    id = hashid_field.HashidAutoField(primary_key=True)
    tenant = models.ForeignKey(
        Tenant, on_delete=models.CASCADE, related_name="sso_connections"
    )
    
    # Basic configuration
    name = models.CharField(max_length=255, help_text="Display name for this SSO connection")
    connection_type = models.CharField(
        choices=constants.IdentityProviderType.choices,
        max_length=10,
        default=constants.IdentityProviderType.SAML
    )
    status = models.CharField(
        choices=constants.SSOConnectionStatus.choices,
        max_length=20,
        default=constants.SSOConnectionStatus.DRAFT
    )
    
    # Domain restriction - if set, only users from these domains can use this SSO
    allowed_domains = models.JSONField(
        default=list,
        blank=True,
        help_text="List of email domains allowed to use this SSO connection"
    )
    
    # JIT Provisioning settings
    jit_provisioning_enabled = models.BooleanField(
        default=True,
        help_text="Automatically create users on first SSO login"
    )
    
    # Group-to-role mapping configuration (stored as JSON)
    group_role_mapping = models.JSONField(
        default=dict,
        blank=True,
        help_text="Mapping of IdP groups to tenant roles"
    )
    
    # SAML-specific fields
    saml_entity_id = models.CharField(max_length=512, blank=True, default='')
    saml_sso_url = models.URLField(max_length=512, blank=True, default='')
    saml_slo_url = models.URLField(max_length=512, blank=True, default='', help_text="Single Logout URL")
    saml_name_id_format = models.CharField(
        choices=constants.SAMLNameIdFormat.choices,
        max_length=128,
        default=constants.SAMLNameIdFormat.EMAIL
    )
    saml_certificate_arn = models.CharField(
        max_length=512, blank=True, default='',
        help_text="ARN of the IdP certificate in AWS Secrets Manager"
    )
    saml_certificate = models.TextField(
        blank=True, default='',
        help_text="IdP X.509 certificate (PEM format) - for local development"
    )
    saml_signing_certificate_arn = models.CharField(
        max_length=512, blank=True, default='',
        help_text="ARN of our SP signing certificate in AWS Secrets Manager"
    )
    saml_want_assertions_signed = models.BooleanField(default=True)
    saml_want_response_signed = models.BooleanField(default=True)
    
    # Attribute mapping for SAML
    saml_attribute_mapping = models.JSONField(
        default=dict,
        blank=True,
        help_text="Mapping of SAML attributes to user fields"
    )
    
    # OIDC-specific fields
    oidc_issuer = models.URLField(max_length=512, blank=True, default='')
    oidc_client_id = models.CharField(max_length=255, blank=True, default='')
    oidc_client_secret_arn = models.CharField(
        max_length=512, blank=True, default='',
        help_text="ARN of the client secret in AWS Secrets Manager"
    )
    oidc_client_secret = models.CharField(
        max_length=512, blank=True, default='',
        help_text="Client secret - for local development"
    )
    oidc_authorization_endpoint = models.URLField(max_length=512, blank=True, default='')
    oidc_token_endpoint = models.URLField(max_length=512, blank=True, default='')
    oidc_userinfo_endpoint = models.URLField(max_length=512, blank=True, default='')
    oidc_jwks_uri = models.URLField(max_length=512, blank=True, default='')
    oidc_scopes = models.CharField(
        max_length=512, default="openid email profile",
        help_text="Space-separated list of OAuth scopes"
    )
    
    # OIDC claim mapping
    oidc_claim_mapping = models.JSONField(
        default=dict,
        blank=True,
        help_text="Mapping of OIDC claims to user fields"
    )
    
    # Metadata caching
    idp_metadata_xml = models.TextField(blank=True, default='')
    sp_metadata_xml = models.TextField(blank=True, default='')
    metadata_last_updated = models.DateTimeField(null=True, blank=True)
    
    # Statistics
    last_login_at = models.DateTimeField(null=True, blank=True)
    login_count = models.PositiveIntegerField(default=0)
    
    objects = managers.TenantSSOConnectionManager()
    
    class Meta:
        ordering = ['-created_at']
        unique_together = [['tenant', 'name']]
    
    def __str__(self):
        return f"{self.tenant.name} - {self.name} ({self.get_connection_type_display()})"
    
    @property
    def is_active(self):
        return self.status == constants.SSOConnectionStatus.ACTIVE
    
    @property
    def is_saml(self):
        return self.connection_type == constants.IdentityProviderType.SAML
    
    @property
    def is_oidc(self):
        return self.connection_type == constants.IdentityProviderType.OIDC
    
    @property
    def sp_metadata_url(self):
        """Get the SP metadata URL for SAML connections."""
        if not self.is_saml:
            return None
        from django.conf import settings
        api_url = getattr(settings, 'API_URL', 'http://localhost:5001')
        return f"{api_url}/api/sso/saml/{self.id}/metadata"
    
    @property
    def oidc_callback_url(self):
        """Get the OIDC callback URL for OIDC connections."""
        if not self.is_oidc:
            return None
        from django.conf import settings
        api_url = getattr(settings, 'API_URL', 'http://localhost:5001')
        return f"{api_url}/api/sso/oidc/{self.id}/callback"
    
    @property
    def login_url(self):
        """Get the login URL for this connection."""
        from django.conf import settings
        api_url = getattr(settings, 'API_URL', 'http://localhost:5001')
        if self.is_saml:
            return f"{api_url}/api/sso/saml/{self.id}/login"
        elif self.is_oidc:
            return f"{api_url}/api/sso/oidc/{self.id}/login"
        return None
    
    def activate(self):
        """Activate this SSO connection."""
        self.status = constants.SSOConnectionStatus.ACTIVE
        self.save(update_fields=['status', 'updated_at'])
    
    def deactivate(self):
        """Deactivate this SSO connection."""
        self.status = constants.SSOConnectionStatus.INACTIVE
        self.save(update_fields=['status', 'updated_at'])
    
    def get_default_role(self) -> str:
        """Get the default role for users provisioned via this SSO connection."""
        return self.group_role_mapping.get('_default', TenantUserRole.MEMBER)
    
    def get_role_for_groups(self, groups: list) -> str:
        """
        Determine the tenant role based on IdP groups.
        Returns the highest-privilege role matched.
        """
        role_priority = {
            TenantUserRole.OWNER: 3,
            TenantUserRole.ADMIN: 2,
            TenantUserRole.MEMBER: 1,
        }
        
        matched_role = self.get_default_role()
        max_priority = role_priority.get(matched_role, 0)
        
        for group in groups:
            mapped_role = self.group_role_mapping.get(group)
            if mapped_role and role_priority.get(mapped_role, 0) > max_priority:
                matched_role = mapped_role
                max_priority = role_priority[mapped_role]
        
        return matched_role


class SCIMToken(TimestampedMixin, models.Model):
    """
    SCIM API tokens for directory synchronization.
    Each token is scoped to a tenant and used for SCIM provisioning.
    """

    id = hashid_field.HashidAutoField(primary_key=True)
    tenant = models.ForeignKey(
        Tenant, on_delete=models.CASCADE, related_name="scim_tokens"
    )
    sso_connection = models.ForeignKey(
        TenantSSOConnection, on_delete=models.CASCADE, related_name="scim_tokens",
        null=True, blank=True
    )
    
    name = models.CharField(max_length=255, help_text="Display name for this token")
    token_hash = models.CharField(max_length=128, unique=True)
    token_prefix = models.CharField(max_length=8, help_text="First 8 chars of token for identification")
    
    # Token settings
    is_active = models.BooleanField(default=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    last_used_at = models.DateTimeField(null=True, blank=True)
    last_used_ip = models.GenericIPAddressField(null=True, blank=True)
    
    # Usage statistics
    request_count = models.PositiveIntegerField(default=0)
    
    objects = managers.SCIMTokenManager()
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.tenant.name} - {self.name} ({self.token_prefix}...)"
    
    @classmethod
    def generate_token(cls) -> str:
        """Generate a secure SCIM token."""
        return f"scim_{secrets.token_urlsafe(48)}"
    
    @classmethod
    def hash_token(cls, token: str) -> str:
        """Hash a token for secure storage."""
        import hashlib
        return hashlib.sha256(token.encode()).hexdigest()
    
    @classmethod
    def create_for_tenant(cls, tenant: Tenant, name: str, sso_connection=None, expires_in_days: int = None):
        """Create a new SCIM token for a tenant. Returns (token_instance, raw_token)."""
        raw_token = cls.generate_token()
        
        expires_at = None
        if expires_in_days:
            expires_at = timezone.now() + timedelta(days=expires_in_days)
        
        token_instance = cls.objects.create(
            tenant=tenant,
            sso_connection=sso_connection,
            name=name,
            token_hash=cls.hash_token(raw_token),
            token_prefix=raw_token[:8],
            expires_at=expires_at,
        )
        
        return token_instance, raw_token
    
    @property
    def is_expired(self):
        if self.expires_at is None:
            return False
        return timezone.now() > self.expires_at
    
    @property
    def is_valid(self):
        return self.is_active and not self.is_expired
    
    def record_usage(self, ip_address: str = None):
        """Record token usage."""
        self.last_used_at = timezone.now()
        if ip_address:
            self.last_used_ip = ip_address
        self.request_count += 1
        self.save(update_fields=['last_used_at', 'last_used_ip', 'request_count'])


class SSOUserLink(TimestampedMixin, models.Model):
    """
    Links a local user to their SSO identity.
    Stores the unique identifier from the IdP for the user.
    """

    id = hashid_field.HashidAutoField(primary_key=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sso_links"
    )
    sso_connection = models.ForeignKey(
        TenantSSOConnection, on_delete=models.CASCADE, related_name="user_links"
    )
    
    # IdP user identifier
    idp_user_id = models.CharField(max_length=512, help_text="User identifier from the IdP")
    
    # Cached IdP attributes (updated on each login)
    idp_email = models.EmailField(blank=True, default='')
    idp_first_name = models.CharField(max_length=255, blank=True, default='')
    idp_last_name = models.CharField(max_length=255, blank=True, default='')
    idp_groups = models.JSONField(default=list, blank=True)
    idp_raw_attributes = models.JSONField(default=dict, blank=True)
    
    # Provisioning info
    provisioned_via_jit = models.BooleanField(default=False)
    provisioned_via_scim = models.BooleanField(default=False)
    
    # Login tracking
    last_login_at = models.DateTimeField(null=True, blank=True)
    login_count = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = [['sso_connection', 'idp_user_id']]
    
    def __str__(self):
        return f"{self.user.email} - {self.sso_connection.name}"
    
    def record_login(self):
        """Record a successful SSO login."""
        self.last_login_at = timezone.now()
        self.login_count += 1
        self.save(update_fields=['last_login_at', 'login_count'])


class SSOSession(TimestampedMixin, models.Model):
    """
    Tracks SSO sessions for session management.
    Allows users and admins to view and revoke active sessions.
    """

    id = hashid_field.HashidAutoField(primary_key=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sso_sessions"
    )
    sso_link = models.ForeignKey(
        SSOUserLink, on_delete=models.CASCADE, related_name="sessions",
        null=True, blank=True
    )
    
    # Session identification
    session_id = models.CharField(max_length=128, unique=True)
    
    # Device/client information
    device_name = models.CharField(max_length=255, blank=True, default='')
    device_type = models.CharField(max_length=50, blank=True, default='')  # desktop, mobile, tablet
    browser = models.CharField(max_length=100, blank=True, default='')
    operating_system = models.CharField(max_length=100, blank=True, default='')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    location = models.CharField(max_length=255, blank=True, default='')  # City, Country
    
    # Session state
    is_active = models.BooleanField(default=True)
    is_current = models.BooleanField(default=False)  # The session making the request
    last_activity_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField()
    revoked_at = models.DateTimeField(null=True, blank=True)
    revoked_reason = models.CharField(max_length=255, blank=True, default='')
    
    objects = managers.SSOSessionManager()
    
    class Meta:
        ordering = ['-last_activity_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.device_name or 'Unknown device'}"
    
    @classmethod
    def generate_session_id(cls) -> str:
        """Generate a unique session identifier."""
        return secrets.token_urlsafe(64)
    
    @property
    def is_expired(self):
        return timezone.now() > self.expires_at
    
    @property
    def is_valid(self):
        return self.is_active and not self.is_expired
    
    def revoke(self, reason: str = ''):
        """Revoke this session."""
        self.is_active = False
        self.revoked_at = timezone.now()
        self.revoked_reason = reason
        self.save(update_fields=['is_active', 'revoked_at', 'revoked_reason'])


class UserDevice(TimestampedMixin, models.Model):
    """
    Tracks user devices for device management and trust.
    Can be used for device-based security policies.
    """

    id = hashid_field.HashidAutoField(primary_key=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="devices"
    )
    
    # Device identification
    device_id = models.CharField(max_length=128, unique=True)
    device_name = models.CharField(max_length=255)
    device_type = models.CharField(max_length=50, blank=True, default='')
    browser = models.CharField(max_length=100, blank=True, default='')
    operating_system = models.CharField(max_length=100, blank=True, default='')
    
    # Trust status
    is_trusted = models.BooleanField(default=False)
    trusted_at = models.DateTimeField(null=True, blank=True)
    
    # Activity tracking
    last_seen_at = models.DateTimeField(auto_now=True)
    last_ip_address = models.GenericIPAddressField(null=True, blank=True)
    last_location = models.CharField(max_length=255, blank=True, default='')
    
    # Security
    is_blocked = models.BooleanField(default=False)
    blocked_at = models.DateTimeField(null=True, blank=True)
    blocked_reason = models.CharField(max_length=255, blank=True, default='')
    
    class Meta:
        ordering = ['-last_seen_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.device_name}"
    
    @classmethod
    def generate_device_id(cls) -> str:
        """Generate a unique device identifier."""
        return secrets.token_urlsafe(32)
    
    def trust(self):
        """Mark this device as trusted."""
        self.is_trusted = True
        self.trusted_at = timezone.now()
        self.save(update_fields=['is_trusted', 'trusted_at'])
    
    def untrust(self):
        """Remove trust from this device."""
        self.is_trusted = False
        self.trusted_at = None
        self.save(update_fields=['is_trusted', 'trusted_at'])
    
    def block(self, reason: str = ''):
        """Block this device."""
        self.is_blocked = True
        self.blocked_at = timezone.now()
        self.blocked_reason = reason
        self.save(update_fields=['is_blocked', 'blocked_at', 'blocked_reason'])


class UserPasskey(TimestampedMixin, models.Model):
    """
    WebAuthn/Passkey credentials for passwordless authentication.
    Stores the public key and credential data from the authenticator.
    """

    id = hashid_field.HashidAutoField(primary_key=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="passkeys"
    )
    
    # Credential identification
    credential_id = models.CharField(max_length=512, unique=True)
    name = models.CharField(max_length=255, help_text="User-provided name for this passkey")
    
    # WebAuthn credential data
    public_key = models.TextField()  # COSE key format, base64 encoded
    sign_count = models.PositiveIntegerField(default=0)
    
    # Authenticator info
    aaguid = models.CharField(max_length=64, blank=True, default='')  # Authenticator AAGUID
    authenticator_type = models.CharField(max_length=50, blank=True, default='')  # platform, cross-platform
    
    # Transports (how the authenticator communicates)
    transports = models.JSONField(default=list, blank=True)  # ["usb", "nfc", "ble", "internal"]
    
    # Status
    is_active = models.BooleanField(default=True)
    last_used_at = models.DateTimeField(null=True, blank=True)
    use_count = models.PositiveIntegerField(default=0)
    
    # Device info (optional, from user agent)
    device_type = models.CharField(max_length=50, blank=True, default='')
    registered_from_ip = models.GenericIPAddressField(null=True, blank=True)
    
    objects = managers.UserPasskeyManager()
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.name}"
    
    def record_use(self, new_sign_count: int):
        """Record a successful authentication with this passkey."""
        self.last_used_at = timezone.now()
        self.use_count += 1
        self.sign_count = new_sign_count
        self.save(update_fields=['last_used_at', 'use_count', 'sign_count'])
    
    def deactivate(self):
        """Deactivate this passkey."""
        self.is_active = False
        self.save(update_fields=['is_active'])


class WebAuthnChallenge(TimestampedMixin, models.Model):
    """
    Temporary storage for WebAuthn challenges during registration/authentication.
    Challenges are short-lived and should be cleaned up periodically.
    """

    id = hashid_field.HashidAutoField(primary_key=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="webauthn_challenges",
        null=True, blank=True  # null for registration before user is known
    )
    
    challenge = models.CharField(max_length=128, unique=True)
    challenge_type = models.CharField(max_length=20)  # 'registration' or 'authentication'
    
    # Additional data needed for verification
    user_verification = models.CharField(max_length=20, default='preferred')
    
    # Expiration
    expires_at = models.DateTimeField()
    used_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    @classmethod
    def generate_challenge(cls) -> str:
        """Generate a random challenge."""
        return secrets.token_urlsafe(32)
    
    @classmethod
    def create_challenge(cls, user=None, challenge_type='registration', ttl_seconds=300):
        """Create a new challenge."""
        return cls.objects.create(
            user=user,
            challenge=cls.generate_challenge(),
            challenge_type=challenge_type,
            expires_at=timezone.now() + timedelta(seconds=ttl_seconds),
        )
    
    @property
    def is_expired(self):
        return timezone.now() > self.expires_at
    
    @property
    def is_valid(self):
        return not self.is_expired and self.used_at is None
    
    def mark_used(self):
        """Mark this challenge as used."""
        self.used_at = timezone.now()
        self.save(update_fields=['used_at'])


class SSOAuditLog(TimestampedMixin, models.Model):
    """
    Comprehensive audit log for all SSO-related events.
    Essential for security and compliance.
    """

    id = hashid_field.HashidAutoField(primary_key=True)
    
    # Context
    tenant = models.ForeignKey(
        Tenant, on_delete=models.SET_NULL, null=True, blank=True, related_name="sso_audit_logs"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="sso_audit_logs"
    )
    sso_connection = models.ForeignKey(
        TenantSSOConnection, on_delete=models.SET_NULL, null=True, blank=True, related_name="audit_logs"
    )
    
    # Event details
    event_type = models.CharField(choices=constants.SSOAuditEventType.choices, max_length=50)
    event_description = models.TextField(blank=True, default='')
    
    # Request context
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, default='')
    
    # Additional data (event-specific)
    metadata = models.JSONField(default=dict, blank=True)
    
    # Result
    success = models.BooleanField(default=True)
    error_message = models.TextField(blank=True, default='')
    
    objects = managers.SSOAuditLogManager()
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['tenant', '-created_at']),
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['event_type', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.event_type} - {self.user.email if self.user else 'System'} - {self.created_at}"
    
    @classmethod
    def log_event(
        cls,
        event_type: str,
        tenant=None,
        user=None,
        sso_connection=None,
        description: str = '',
        ip_address: str = None,
        user_agent: str = '',
        metadata: dict = None,
        success: bool = True,
        error_message: str = '',
    ):
        """Create an audit log entry."""
        return cls.objects.create(
            tenant=tenant,
            user=user,
            sso_connection=sso_connection,
            event_type=event_type,
            event_description=description,
            ip_address=ip_address,
            user_agent=user_agent,
            metadata=metadata or {},
            success=success,
            error_message=error_message,
        )

