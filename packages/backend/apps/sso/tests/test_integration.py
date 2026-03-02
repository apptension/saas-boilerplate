"""
Integration tests for SSO flows.
"""

import pytest
from datetime import timedelta
from django.utils import timezone

from apps.sso import models, constants
from apps.sso.services.provisioning import JITProvisioningService
from apps.multitenancy.models import TenantMembership
from apps.multitenancy.constants import TenantUserRole

from . import factories


pytestmark = pytest.mark.django_db


class TestSAMLSSOFlow:
    """Integration tests for SAML SSO flow."""

    def test_complete_saml_login_flow_new_user(self, tenant_sso_connection):
        """Test complete SAML login flow for a new user."""
        connection = tenant_sso_connection
        connection.status = constants.SSOConnectionStatus.ACTIVE
        connection.jit_provisioning_enabled = True
        connection.group_role_mapping = {
            "Engineering": TenantUserRole.ADMIN,
            "_default": TenantUserRole.MEMBER,
        }
        connection.save()

        # Create provisioning service
        provisioning_service = JITProvisioningService(connection)

        # Provision user
        user, link, created = provisioning_service.provision_or_update_user(
            idp_user_id='saml_user_123',
            email='newuser@example.com',
            first_name='New',
            last_name='User',
            groups=['Engineering'],
        )

        # Assertions
        assert created is True
        assert user.email == 'newuser@example.com'

        # Check SSO link was created
        assert link.idp_user_id == 'saml_user_123'
        assert link.sso_connection == connection

    def test_complete_saml_login_flow_existing_user(self, tenant_sso_connection, user):
        """Test SAML login flow for existing linked user."""
        connection = tenant_sso_connection
        connection.status = constants.SSOConnectionStatus.ACTIVE
        connection.save()

        # Create existing link
        link = factories.SSOUserLinkFactory(
            user=user,
            sso_connection=connection,
            idp_user_id='existing_idp_user',
        )

        TenantMembership.objects.get_or_create(
            user=user,
            tenant=connection.tenant,
            defaults={"role": TenantUserRole.MEMBER, "is_accepted": True},
        )

        provisioning_service = JITProvisioningService(connection)

        # Provision should update existing user
        returned_user, returned_link, created = provisioning_service.provision_or_update_user(
            idp_user_id='existing_idp_user',
            email=user.email,
            groups=[],
        )

        assert created is False
        assert returned_user == user


class TestOIDCSSOFlow:
    """Integration tests for OIDC SSO flow."""

    def test_complete_oidc_login_flow(self, oidc_sso_connection):
        """Test complete OIDC login flow."""
        connection = oidc_sso_connection
        connection.status = constants.SSOConnectionStatus.ACTIVE
        connection.jit_provisioning_enabled = True
        connection.save()

        provisioning_service = JITProvisioningService(connection)

        user, link, created = provisioning_service.provision_or_update_user(
            idp_user_id='oidc_user_456',
            email='oidcuser@example.com',
            first_name='OIDC',
            last_name='User',
            groups=[],
        )

        assert created is True
        assert user.email == 'oidcuser@example.com'
        assert link.idp_user_id == 'oidc_user_456'


class TestSessionManagementFlow:
    """Integration tests for session management."""

    def test_session_creation_on_login(self, user):
        """Test session is created on SSO login."""
        # Simulate session creation after successful SSO
        session = models.SSOSession.objects.create(
            user=user,
            session_id=models.SSOSession.generate_session_id(),
            device_name="Chrome on macOS",
            browser="Chrome",
            operating_system="macOS",
            ip_address="192.168.1.100",
            expires_at=timezone.now() + timedelta(days=7),
        )

        assert session.is_active is True

        # Verify user can see the session
        user_sessions = models.SSOSession.objects.get_active_for_user(user)
        assert session in user_sessions

    def test_session_revocation(self, user, sso_session):
        """Test session revocation."""
        assert sso_session.is_active is True

        sso_session.revoke(reason="User requested")

        assert sso_session.is_active is False
        assert sso_session.revoked_at is not None
        assert sso_session.revoked_reason == "User requested"

        # Verify session no longer appears in active sessions
        active_sessions = models.SSOSession.objects.get_active_for_user(user)
        assert sso_session not in active_sessions

    def test_revoke_all_other_sessions(self, user):
        """Test revoking all sessions except current."""
        # Create multiple sessions
        session1 = factories.SSOSessionFactory(user=user)
        session2 = factories.SSOSessionFactory(user=user)
        current_session = factories.SSOSessionFactory(user=user)

        # Revoke all except current
        revoked_count = (
            models.SSOSession.objects.filter(
                user=user,
                is_active=True,
            )
            .exclude(id=current_session.id)
            .update(
                is_active=False,
                revoked_at=timezone.now(),
                revoked_reason="User logged out all other sessions",
            )
        )

        assert revoked_count == 2

        # Verify current session still active
        current_session.refresh_from_db()
        assert current_session.is_active is True


class TestPasskeyFlow:
    """Integration tests for passkey/WebAuthn flow."""

    def test_passkey_registration_flow(self, user):
        """Test passkey registration flow."""
        # 1. Generate registration challenge
        challenge = models.WebAuthnChallenge.create_challenge(
            user=user,
            challenge_type='registration',
        )

        assert challenge.is_valid is True

        # 2. Simulate successful registration verification
        passkey = models.UserPasskey.objects.create(
            user=user,
            credential_id='test_credential_id',
            name='My MacBook Touch ID',
            public_key='mock_public_key_data',
            sign_count=0,
            authenticator_type='platform',
            is_active=True,
        )

        # 3. Mark challenge as used
        challenge.mark_used()

        assert challenge.is_valid is False
        assert passkey.is_active is True

    def test_passkey_authentication_flow(self, user, user_passkey):
        """Test passkey authentication flow."""
        passkey = user_passkey
        initial_use_count = passkey.use_count

        # 1. Generate authentication challenge
        challenge = models.WebAuthnChallenge.create_challenge(
            user=user,
            challenge_type='authentication',
        )

        # 2. Simulate successful authentication
        passkey.record_use(new_sign_count=passkey.sign_count + 1)

        # 3. Mark challenge as used
        challenge.mark_used()

        assert passkey.use_count == initial_use_count + 1
        assert passkey.last_used_at is not None


class TestAuditLogging:
    """Integration tests for audit logging."""

    def test_audit_log_on_sso_login_success(self, tenant, user, tenant_sso_connection):
        """Test audit log is created on successful SSO login."""
        log = models.SSOAuditLog.log_event(
            event_type=constants.SSOAuditEventType.SSO_LOGIN_SUCCESS,
            tenant=tenant,
            user=user,
            sso_connection=tenant_sso_connection,
            description=f"User {user.email} logged in via SSO",
            ip_address="192.168.1.1",
            user_agent="Mozilla/5.0...",
        )

        assert log.success is True
        assert log.event_type == constants.SSOAuditEventType.SSO_LOGIN_SUCCESS
        assert log.user == user

    def test_audit_log_on_sso_login_failure(self, tenant, tenant_sso_connection):
        """Test audit log is created on failed SSO login."""
        log = models.SSOAuditLog.log_event(
            event_type=constants.SSOAuditEventType.SSO_LOGIN_FAILED,
            tenant=tenant,
            sso_connection=tenant_sso_connection,
            description="Login failed: Invalid SAML assertion",
            success=False,
            error_message="Signature validation failed",
            ip_address="10.0.0.1",
        )

        assert log.success is False
        assert log.error_message == "Signature validation failed"

    def test_audit_log_on_scim_provisioning(self, tenant, user):
        """Test audit log on SCIM user provisioning."""
        log = models.SSOAuditLog.log_event(
            event_type=constants.SSOAuditEventType.SCIM_USER_CREATED,
            tenant=tenant,
            user=user,
            description=f"User {user.email} provisioned via SCIM",
            metadata={
                'scim_id': str(user.id),
                'groups': ['Engineering'],
            },
        )

        assert log.event_type == constants.SSOAuditEventType.SCIM_USER_CREATED
        assert 'Engineering' in str(log.metadata)

    def test_query_audit_logs_by_date_range(self, tenant, user, tenant_sso_connection):
        """Test querying audit logs by date range."""
        # Create logs at different times
        old_log = factories.SSOAuditLogFactory(
            tenant=tenant,
            user=user,
        )
        old_log.created_at = timezone.now() - timedelta(days=30)
        old_log.save()

        recent_log = factories.SSOAuditLogFactory(
            tenant=tenant,
            user=user,
        )

        # Query recent logs
        week_ago = timezone.now() - timedelta(days=7)
        recent_logs = models.SSOAuditLog.objects.filter(
            tenant=tenant,
            created_at__gte=week_ago,
        )

        assert recent_log in recent_logs
        assert old_log not in recent_logs
