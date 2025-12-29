from django.db import models
from django.utils import timezone


class TenantSSOConnectionManager(models.Manager):
    """Manager for TenantSSOConnection model."""

    def get_active_for_tenant(self, tenant):
        """Get the active SSO connection for a tenant."""
        return self.filter(tenant=tenant, status='active').first()

    def get_for_domain(self, email_domain: str):
        """Find SSO connections that allow the given email domain."""
        return self.filter(status='active', allowed_domains__contains=[email_domain]).select_related('tenant')


class SCIMTokenManager(models.Manager):
    """Manager for SCIMToken model."""

    def get_valid_for_tenant(self, tenant):
        """Get all valid (active and non-expired) tokens for a tenant."""
        now = timezone.now()
        return self.filter(tenant=tenant, is_active=True).filter(
            models.Q(expires_at__isnull=True) | models.Q(expires_at__gt=now)
        )

    def verify_token(self, token: str):
        """Verify a SCIM token and return the token instance if valid."""
        from .models import SCIMToken

        token_hash = SCIMToken.hash_token(token)
        now = timezone.now()

        try:
            token_instance = self.get(token_hash=token_hash, is_active=True)

            if token_instance.expires_at and token_instance.expires_at < now:
                return None

            return token_instance
        except self.model.DoesNotExist:
            return None


class SSOSessionManager(models.Manager):
    """Manager for SSOSession model."""

    def get_active_for_user(self, user):
        """Get all active sessions for a user."""
        now = timezone.now()
        return self.filter(user=user, is_active=True, expires_at__gt=now).order_by('-last_activity_at')

    def revoke_all_for_user(self, user, reason: str = 'User requested'):
        """Revoke all sessions for a user."""
        now = timezone.now()
        return self.filter(user=user, is_active=True).update(is_active=False, revoked_at=now, revoked_reason=reason)

    def cleanup_expired(self):
        """Clean up expired sessions."""
        now = timezone.now()
        return self.filter(expires_at__lt=now).delete()


class UserPasskeyManager(models.Manager):
    """Manager for UserPasskey model."""

    def get_active_for_user(self, user):
        """Get all active passkeys for a user."""
        return self.filter(user=user, is_active=True)

    def get_by_credential_id(self, credential_id: str):
        """Find a passkey by credential ID."""
        return self.filter(credential_id=credential_id, is_active=True).first()


class SSOAuditLogManager(models.Manager):
    """Manager for SSOAuditLog model."""

    def for_tenant(self, tenant, days: int = 30):
        """Get recent audit logs for a tenant."""
        cutoff = timezone.now() - timezone.timedelta(days=days)
        return self.filter(tenant=tenant, created_at__gte=cutoff).order_by('-created_at')

    def for_user(self, user, days: int = 30):
        """Get recent audit logs for a user."""
        cutoff = timezone.now() - timezone.timedelta(days=days)
        return self.filter(user=user, created_at__gte=cutoff).order_by('-created_at')

    def failed_logins(self, tenant=None, hours: int = 24):
        """Get failed login attempts."""
        cutoff = timezone.now() - timezone.timedelta(hours=hours)
        qs = self.filter(event_type='sso_login_failed', created_at__gte=cutoff, success=False)
        if tenant:
            qs = qs.filter(tenant=tenant)
        return qs.order_by('-created_at')
