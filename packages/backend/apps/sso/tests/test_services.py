"""
Tests for SSO services.
"""

import pytest
from unittest.mock import Mock, patch
from datetime import timedelta
from django.utils import timezone

from apps.sso import constants
from apps.sso.services.provisioning import JITProvisioningService
from apps.sso import models
from apps.multitenancy.constants import TenantUserRole
from apps.multitenancy.models import TenantMembership

from . import factories


pytestmark = pytest.mark.django_db


class TestJITProvisioningService:
    """Tests for JIT provisioning service."""

    def test_provision_new_user(self, tenant_sso_connection):
        """Test provisioning a new user."""
        connection = tenant_sso_connection
        connection.jit_provisioning_enabled = True
        connection.status = constants.SSOConnectionStatus.ACTIVE
        connection.save()
        
        provisioning_service = JITProvisioningService(connection)

        user, link, created = provisioning_service.provision_or_update_user(
            idp_user_id="new_user_123",
            email="newuser@example.com",
            first_name="New",
            last_name="User",
        )
        
        assert created is True
        assert user.email == "newuser@example.com"
        assert link.idp_user_id == "new_user_123"

    def test_link_existing_user(self, tenant_sso_connection, user):
        """Test linking an existing user."""
        connection = tenant_sso_connection
        connection.status = constants.SSOConnectionStatus.ACTIVE
        connection.save()
        
        # Create existing SSO link
        link = factories.SSOUserLinkFactory(
            user=user,
            sso_connection=connection,
            idp_user_id='existing_user_123',
        )
        
        provisioning_service = JITProvisioningService(connection)

        linked_user, returned_link, created = provisioning_service.provision_or_update_user(
            idp_user_id='existing_user_123',
            email=user.email,
            first_name='Test',
            last_name='User',
        )
        
        assert created is False
        assert linked_user == user
        assert returned_link.idp_user_id == 'existing_user_123'

    def test_provision_with_group_role_mapping(self, tenant_sso_connection):
        """Test provisioning with group-to-role mapping."""
        connection = tenant_sso_connection
        connection.jit_provisioning_enabled = True
        connection.status = constants.SSOConnectionStatus.ACTIVE
        connection.group_role_mapping = {
            "Admins": TenantUserRole.OWNER,
            "Engineering": TenantUserRole.ADMIN,
            "_default": TenantUserRole.MEMBER,
        }
        connection.save()
        
        provisioning_service = JITProvisioningService(connection)

        user, link, created = provisioning_service.provision_or_update_user(
            idp_user_id="admin_user_123",
            email="admin@example.com",
            groups=["Engineering", "Admins"],
        )
        
        membership = TenantMembership.objects.get(
            user=user,
            tenant=connection.tenant,
        )
        
        # Should have highest role (OWNER from Admins group)
        assert membership.role == TenantUserRole.OWNER


class TestSCIMTokenManager:
    """Tests for SCIM token manager."""

    def test_verify_valid_token(self, tenant):
        """Test verifying a valid SCIM token."""
        token_instance, raw_token = models.SCIMToken.create_for_tenant(
            tenant=tenant,
            name="Test Token",
        )
        
        verified = models.SCIMToken.objects.verify_token(raw_token)
        
        assert verified == token_instance

    def test_verify_invalid_token(self, tenant):
        """Test verifying an invalid SCIM token."""
        verified = models.SCIMToken.objects.verify_token("invalid_token")
        
        assert verified is None

    def test_verify_expired_token(self, tenant):
        """Test verifying an expired token."""
        token_instance, raw_token = models.SCIMToken.create_for_tenant(
            tenant=tenant,
            name="Test Token",
            expires_in_days=1,
        )
        token_instance.expires_at = timezone.now() - timedelta(days=1)
        token_instance.save()
        
        verified = models.SCIMToken.objects.verify_token(raw_token)
        
        assert verified is None


class TestSSOSessionManager:
    """Tests for SSO session manager."""

    def test_get_active_for_user(self, user):
        """Test getting active sessions for a user."""
        active_session = factories.SSOSessionFactory(
            user=user,
            is_active=True,
            expires_at=timezone.now() + timedelta(days=7),
        )
        inactive_session = factories.SSOSessionFactory(
            user=user,
            is_active=False,
        )
        
        active_sessions = models.SSOSession.objects.get_active_for_user(user)
        
        assert active_session in active_sessions
        assert inactive_session not in active_sessions

    def test_revoke_all_for_user(self, user):
        """Test revoking all sessions for a user."""
        session1 = factories.SSOSessionFactory(user=user)
        session2 = factories.SSOSessionFactory(user=user)
        
        revoked_count = models.SSOSession.objects.revoke_all_for_user(user)
        
        assert revoked_count == 2
        
        session1.refresh_from_db()
        session2.refresh_from_db()
        
        assert session1.is_active is False
        assert session2.is_active is False


class TestUserPasskeyManager:
    """Tests for user passkey manager."""

    def test_get_active_for_user(self, user):
        """Test getting active passkeys for a user."""
        active_passkey = factories.UserPasskeyFactory(user=user, is_active=True)
        inactive_passkey = factories.UserPasskeyFactory(user=user, is_active=False)
        
        active_passkeys = models.UserPasskey.objects.get_active_for_user(user)
        
        assert active_passkey in active_passkeys
        assert inactive_passkey not in active_passkeys

    def test_get_by_credential_id(self, user):
        """Test finding passkey by credential ID."""
        passkey = factories.UserPasskeyFactory(user=user)
        
        found = models.UserPasskey.objects.get_by_credential_id(passkey.credential_id)
        
        assert found == passkey
