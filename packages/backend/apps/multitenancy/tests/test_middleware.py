import pytest
from graphql_relay import to_global_id
from unittest.mock import Mock

from ..middleware import (
    get_current_tenant,
    get_current_user_role,
    get_current_tenant_with_membership_check,
    TenantUserRoleMiddleware,
)


pytestmark = pytest.mark.django_db


class TestGetTenantIdFromArguments:
    def test_get_tenant_id_from_arguments_with_input(self, tenant):
        args = {"input": {"tenant_id": to_global_id("TenantType", tenant.id)}}
        result = TenantUserRoleMiddleware._get_tenant_id_from_arguments(args)
        assert result == tenant.id

    def test_get_tenant_id_from_arguments_with_input_camelcase(self, tenant):
        """Test that camelCase tenantId is also recognized (for GraphQL compatibility)"""
        args = {"input": {"tenantId": to_global_id("TenantType", tenant.id)}}
        result = TenantUserRoleMiddleware._get_tenant_id_from_arguments(args)
        assert result == tenant.id

    def test_get_tenant_id_from_arguments_with_tenant_id_at_top_level(self, tenant):
        """Test tenant_id at top level of args"""
        args = {"tenant_id": to_global_id("TenantType", tenant.id)}
        result = TenantUserRoleMiddleware._get_tenant_id_from_arguments(args)
        assert result == tenant.id

    def test_get_tenant_id_from_arguments_without_input_camelcase(self, tenant):
        """Test that camelCase tenantId is also recognized at top level"""
        args = {"tenantId": to_global_id("TenantType", tenant.id)}
        result = TenantUserRoleMiddleware._get_tenant_id_from_arguments(args)
        assert result == tenant.id

    def test_get_tenant_id_from_arguments_invalid_id_type(self):
        args = {"input": {"tenant_id": "InvalidType:123"}}
        result = TenantUserRoleMiddleware._get_tenant_id_from_arguments(args)
        assert result is None

    def test_get_tenant_id_from_arguments_no_tenant_id(self):
        args = {"input": {"other_field": "value"}}
        result = TenantUserRoleMiddleware._get_tenant_id_from_arguments(args)
        assert result is None

    def test_get_tenant_id_from_arguments_no_args(self):
        args = {}
        result = TenantUserRoleMiddleware._get_tenant_id_from_arguments(args)
        assert result is None

    def test_get_tenant_id_does_not_use_generic_id_fallback(self, tenant):
        """
        SECURITY: Generic 'id' field should NOT be used as tenant_id.
        This prevents tenant confusion attacks in mutations like updateProject.
        """
        # Only generic 'id' in input - should NOT be treated as tenant_id
        args = {"input": {"id": to_global_id("TenantType", tenant.id)}}
        result = TenantUserRoleMiddleware._get_tenant_id_from_arguments(args)
        assert result is None, "Generic 'id' should not be used as tenant_id fallback"

        # Only generic 'id' at top level - should NOT be treated as tenant_id
        args = {"id": to_global_id("TenantType", tenant.id)}
        result = TenantUserRoleMiddleware._get_tenant_id_from_arguments(args)
        assert result is None, "Generic 'id' should not be used as tenant_id fallback"


class TestTenantUserRoleMiddlewareGetCurrentTenant:
    def test_get_current_tenant_with_tenant_id(self, tenant_factory):
        tenant_factory.create_batch(10)
        tenant = tenant_factory(name="Test Tenant")
        result = get_current_tenant(tenant.id)
        assert result == tenant

    def test_get_current_tenant_nonexistent_tenant(self, tenant_factory):
        tenant_factory.create_batch(10)
        tenant_factory(name="Test Tenant")
        result = get_current_tenant("9999")
        assert result is None

    def test_get_current_tenant_missing_tenant_id(self, tenant_factory):
        tenant_factory.create_batch(10)
        tenant_factory(name="Test Tenant")
        result = get_current_tenant(None)
        assert result is None


class TestGetCurrentTenantWithMembershipCheck:
    """
    SECURITY: Tests for the membership-verified tenant retrieval.
    This ensures users can only access tenants they're members of.
    """

    def test_returns_tenant_for_accepted_member(self, tenant, user, tenant_membership_factory):
        """Test that tenant is returned for users with accepted membership."""
        tenant_membership_factory(user=user, tenant=tenant, is_accepted=True)
        result = get_current_tenant_with_membership_check(str(tenant.pk), user)
        assert result == tenant

    def test_returns_none_for_unaccepted_membership(self, tenant, user, tenant_membership_factory):
        """
        SECURITY: Unaccepted memberships should not grant tenant access.
        This prevents invited users from accessing tenant data before accepting.
        """
        tenant_membership_factory(user=user, tenant=tenant, is_accepted=False)
        result = get_current_tenant_with_membership_check(str(tenant.pk), user)
        assert result is None

    def test_returns_none_for_non_member(self, tenant, user):
        """
        SECURITY: Non-members should not be able to access tenant.
        This is the core multi-tenant isolation check.
        """
        result = get_current_tenant_with_membership_check(str(tenant.pk), user)
        assert result is None

    def test_returns_none_for_unauthenticated_user(self, tenant):
        """SECURITY: Unauthenticated users cannot access any tenant."""
        result = get_current_tenant_with_membership_check(str(tenant.pk), None)
        assert result is None

    def test_returns_none_for_nonexistent_tenant(self, user):
        """Test that nonexistent tenant returns None."""
        result = get_current_tenant_with_membership_check("nonexistent", user)
        assert result is None

    def test_returns_none_for_none_tenant_id(self, user):
        """Test that None tenant_id returns None."""
        result = get_current_tenant_with_membership_check(None, user)
        assert result is None

    def test_cross_tenant_isolation(self, tenant_factory, user, tenant_membership_factory):
        """
        SECURITY: Verify user cannot access tenant they're not a member of,
        even when they're a member of other tenants.
        """
        tenant_a = tenant_factory(name="Tenant A")
        tenant_b = tenant_factory(name="Tenant B")

        # User is member of tenant_a only
        tenant_membership_factory(user=user, tenant=tenant_a, is_accepted=True)

        # Should access tenant_a
        result_a = get_current_tenant_with_membership_check(str(tenant_a.pk), user)
        assert result_a == tenant_a

        # Should NOT access tenant_b
        result_b = get_current_tenant_with_membership_check(str(tenant_b.pk), user)
        assert result_b is None


class TestTenantUserRoleMiddlewareGetCurrentUserRole:
    def test_get_current_user_role_authenticated_user(self, graphene_client, tenant, user, tenant_membership_factory):
        tenant_membership = tenant_membership_factory(user=user, tenant=tenant, role="admin")
        info = Mock()
        info.context.user = user
        info.context.tenant = tenant
        info.context.tenant_id = tenant.id
        graphene_client.force_authenticate(user)
        result = get_current_user_role(info.context.tenant, info.context.user)
        assert result == tenant_membership.role

    def test_get_current_user_role_unauthenticated_user(self, tenant, user, tenant_membership_factory):
        tenant_membership_factory(user=user, tenant=tenant, role="admin")
        info = Mock()
        info.context.user = None
        info.context.tenant = tenant
        info.context.tenant_id = tenant.id
        result = get_current_user_role(info.context.tenant, info.context.user)
        assert result is None

    def test_get_current_user_role_membership_does_not_exist(
        self, graphene_client, tenant, user, tenant_membership_factory
    ):
        tenant_membership_factory(user=user, tenant=tenant, role="admin")
        info = Mock()
        info.context.user = user
        info.context.tenant = None
        info.context.tenant_id = None
        graphene_client.force_authenticate(user)
        result = get_current_user_role(info.context.tenant, info.context.user)
        assert result is None
