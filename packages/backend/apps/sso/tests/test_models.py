"""
Tests for SSO models.
"""

import pytest
from datetime import timedelta
from django.utils import timezone

from apps.multitenancy.constants import TenantUserRole
from apps.sso import models, constants
from . import factories


pytestmark = pytest.mark.django_db


class TestTenantSSOConnection:
    """Tests for TenantSSOConnection model."""

    def test_create_saml_connection(self, tenant):
        """Test creating a SAML SSO connection."""
        connection = models.TenantSSOConnection.objects.create(
            tenant=tenant,
            name="Okta SAML",
            connection_type=constants.IdentityProviderType.SAML,
            saml_entity_id="https://okta.example.com",
            saml_sso_url="https://okta.example.com/sso",
        )

        assert connection.id is not None
        assert connection.is_saml is True
        assert connection.is_oidc is False
        assert connection.is_active is False
        assert connection.status == constants.SSOConnectionStatus.DRAFT

    def test_create_oidc_connection(self, tenant):
        """Test creating an OIDC SSO connection."""
        connection = models.TenantSSOConnection.objects.create(
            tenant=tenant,
            name="Azure AD OIDC",
            connection_type=constants.IdentityProviderType.OIDC,
            oidc_issuer="https://login.microsoftonline.com/tenant",
            oidc_client_id="client_123",
        )

        assert connection.is_oidc is True
        assert connection.is_saml is False

    def test_get_default_role(self, sso_connection):
        """Test getting default role when no mapping configured."""
        assert sso_connection.get_default_role() == TenantUserRole.MEMBER

    def test_get_default_role_with_config(self, sso_connection):
        """Test getting default role from configuration."""
        sso_connection.group_role_mapping = {"_default": TenantUserRole.ADMIN}
        sso_connection.save()

        assert sso_connection.get_default_role() == TenantUserRole.ADMIN

    def test_get_role_for_groups(self, sso_connection):
        """Test group-to-role mapping."""
        sso_connection.group_role_mapping = {
            "Admins": TenantUserRole.OWNER,
            "Engineering": TenantUserRole.ADMIN,
            "_default": TenantUserRole.MEMBER,
        }
        sso_connection.save()

        # Should return highest priority role
        assert sso_connection.get_role_for_groups(["Engineering", "Admins"]) == TenantUserRole.OWNER
        assert sso_connection.get_role_for_groups(["Engineering"]) == TenantUserRole.ADMIN
        assert sso_connection.get_role_for_groups(["Unknown"]) == TenantUserRole.MEMBER
        assert sso_connection.get_role_for_groups([]) == TenantUserRole.MEMBER

    def test_unique_name_per_tenant(self, tenant):
        """Test that connection names are unique per tenant."""
        factories.TenantSSOConnectionFactory(tenant=tenant, name="SSO")

        with pytest.raises(Exception):  # IntegrityError
            factories.TenantSSOConnectionFactory(tenant=tenant, name="SSO")


class TestSCIMToken:
    """Tests for SCIMToken model."""

    def test_generate_token(self):
        """Test token generation format."""
        token = models.SCIMToken.generate_token()

        assert token.startswith("scim_")
        assert len(token) > 50

    def test_hash_token(self):
        """Test token hashing."""
        token = "scim_test_token"
        hash1 = models.SCIMToken.hash_token(token)
        hash2 = models.SCIMToken.hash_token(token)

        assert hash1 == hash2
        assert hash1 != token
        assert len(hash1) == 64  # SHA256 hex

    def test_create_for_tenant(self, tenant):
        """Test creating token for tenant."""
        token_instance, raw_token = models.SCIMToken.create_for_tenant(
            tenant=tenant,
            name="Test Token",
        )

        assert token_instance.tenant == tenant
        assert token_instance.name == "Test Token"
        assert raw_token.startswith("scim_")
        assert token_instance.token_prefix == raw_token[:8]
        assert token_instance.is_valid is True

    def test_token_expiration(self, tenant):
        """Test token expiration."""
        token_instance, _ = models.SCIMToken.create_for_tenant(
            tenant=tenant,
            name="Expiring Token",
            expires_in_days=1,
        )

        assert token_instance.is_expired is False

        # Manually expire
        token_instance.expires_at = timezone.now() - timedelta(days=1)
        token_instance.save()

        assert token_instance.is_expired is True
        assert token_instance.is_valid is False

    def test_record_usage(self, scim_token):
        """Test recording token usage."""
        # scim_token is now a SCIMToken instance from factory
        token_instance = scim_token

        assert token_instance.request_count == 0
        assert token_instance.last_used_at is None

        token_instance.record_usage("192.168.1.1")

        assert token_instance.request_count == 1
        assert token_instance.last_used_at is not None
        assert token_instance.last_used_ip == "192.168.1.1"


class TestSSOUserLink:
    """Tests for SSOUserLink model."""

    def test_create_link(self, user, sso_connection):
        """Test creating SSO user link."""
        link = models.SSOUserLink.objects.create(
            user=user,
            sso_connection=sso_connection,
            idp_user_id="idp_123",
            idp_email=user.email,
        )

        assert link.user == user
        assert link.idp_user_id == "idp_123"
        assert link.login_count == 0

    def test_record_login(self, sso_user_link):
        """Test recording login."""
        assert sso_user_link.login_count == 0

        sso_user_link.record_login()

        assert sso_user_link.login_count == 1
        assert sso_user_link.last_login_at is not None

    def test_unique_link_per_connection(self, user, sso_connection):
        """Test unique constraint on user link."""
        factories.SSOUserLinkFactory(
            user=user,
            sso_connection=sso_connection,
            idp_user_id="idp_123",
        )

        with pytest.raises(Exception):  # IntegrityError
            factories.SSOUserLinkFactory(
                sso_connection=sso_connection,
                idp_user_id="idp_123",  # Same idp_user_id
            )


class TestSSOSession:
    """Tests for SSOSession model."""

    def test_create_session(self, user):
        """Test creating SSO session."""
        session = models.SSOSession.objects.create(
            user=user,
            session_id=models.SSOSession.generate_session_id(),
            device_name="MacBook Pro",
            browser="Chrome",
            expires_at=timezone.now() + timedelta(days=7),
        )

        assert session.is_active is True
        assert session.is_valid is True

    def test_session_expiration(self, sso_session):
        """Test session expiration."""
        assert sso_session.is_expired is False

        sso_session.expires_at = timezone.now() - timedelta(hours=1)
        sso_session.save()

        assert sso_session.is_expired is True
        assert sso_session.is_valid is False

    def test_revoke_session(self, sso_session):
        """Test revoking session."""
        assert sso_session.is_active is True

        sso_session.revoke(reason="User requested")

        assert sso_session.is_active is False
        assert sso_session.revoked_at is not None
        assert sso_session.revoked_reason == "User requested"


class TestUserDevice:
    """Tests for UserDevice model."""

    def test_trust_device(self, user_device):
        """Test trusting a device."""
        assert user_device.is_trusted is False

        user_device.trust()

        assert user_device.is_trusted is True
        assert user_device.trusted_at is not None

    def test_untrust_device(self, user_device):
        """Test removing trust from device."""
        user_device.trust()
        user_device.untrust()

        assert user_device.is_trusted is False
        assert user_device.trusted_at is None

    def test_block_device(self, user_device):
        """Test blocking a device."""
        user_device.block(reason="Suspicious activity")

        assert user_device.is_blocked is True
        assert user_device.blocked_reason == "Suspicious activity"


class TestUserPasskey:
    """Tests for UserPasskey model."""

    def test_record_use(self, passkey):
        """Test recording passkey use."""
        assert passkey.use_count == 0

        passkey.record_use(new_sign_count=1)

        assert passkey.use_count == 1
        assert passkey.sign_count == 1
        assert passkey.last_used_at is not None

    def test_deactivate(self, passkey):
        """Test deactivating passkey."""
        assert passkey.is_active is True

        passkey.deactivate()

        assert passkey.is_active is False


class TestWebAuthnChallenge:
    """Tests for WebAuthnChallenge model."""

    def test_create_challenge(self, user):
        """Test creating challenge."""
        challenge = models.WebAuthnChallenge.create_challenge(
            user=user,
            challenge_type='registration',
        )

        assert challenge.challenge is not None
        assert challenge.is_valid is True
        assert len(challenge.challenge) > 30

    def test_challenge_expiration(self, webauthn_challenge):
        """Test challenge expiration."""
        assert webauthn_challenge.is_valid is True

        webauthn_challenge.expires_at = timezone.now() - timedelta(minutes=1)
        webauthn_challenge.save()

        assert webauthn_challenge.is_expired is True
        assert webauthn_challenge.is_valid is False

    def test_mark_used(self, webauthn_challenge):
        """Test marking challenge as used."""
        assert webauthn_challenge.used_at is None

        webauthn_challenge.mark_used()

        assert webauthn_challenge.used_at is not None
        assert webauthn_challenge.is_valid is False


class TestSSOAuditLog:
    """Tests for SSOAuditLog model."""

    def test_log_event(self, tenant, user, sso_connection):
        """Test logging an event."""
        log = models.SSOAuditLog.log_event(
            event_type=constants.SSOAuditEventType.SSO_LOGIN_SUCCESS,
            tenant=tenant,
            user=user,
            sso_connection=sso_connection,
            description="User logged in",
            ip_address="192.168.1.1",
        )

        assert log.id is not None
        assert log.event_type == constants.SSOAuditEventType.SSO_LOGIN_SUCCESS
        assert log.success is True

    def test_log_failed_event(self, tenant, sso_connection):
        """Test logging a failed event."""
        log = models.SSOAuditLog.log_event(
            event_type=constants.SSOAuditEventType.SSO_LOGIN_FAILED,
            tenant=tenant,
            sso_connection=sso_connection,
            description="Login failed",
            success=False,
            error_message="Invalid assertion",
        )

        assert log.success is False
        assert log.error_message == "Invalid assertion"
