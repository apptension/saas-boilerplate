import pytest
from graphql_relay import to_global_id
from unittest.mock import Mock

from ..middleware import get_current_tenant, get_current_user_role


pytestmark = pytest.mark.django_db


class TestTenantUserRoleMiddlewareGetCurrentTenant:
    def test_get_current_tenant_with_tenant_id(self, tenant_factory):
        tenant_factory.create_batch(10)
        tenant = tenant_factory(name="Test Tenant")
        tenant_id = to_global_id("TenantType", str(tenant.pk))
        args = {"input": {"tenantId": tenant_id}}
        result = get_current_tenant(args)
        assert result == tenant

    def test_get_current_tenant_with_id_for_tenant_crud_actions(self, tenant_factory):
        tenant_factory.create_batch(10)
        tenant = tenant_factory(name="Test Tenant")
        tenant_id = to_global_id("TenantType", str(tenant.pk))
        args = {"input": {"id": tenant_id}}
        result = get_current_tenant(args)
        assert result == tenant

    def test_get_current_tenant_invalid_id_type(self, tenant_factory):
        tenant_factory.create_batch(10)
        tenant = tenant_factory(name="Test Tenant")
        invalid_id = to_global_id("InvalidType", str(tenant.pk))
        args = {"input": {"tenantId": invalid_id}}
        result = get_current_tenant(args)
        assert result is None

    def test_get_current_tenant_nonexistent_tenant(self, tenant_factory):
        tenant_factory.create_batch(10)
        tenant_factory(name="Test Tenant")
        nonexistent_id = to_global_id("TenantType", "9999")
        args = {"input": {"tenantId": nonexistent_id}}
        result = get_current_tenant(args)
        assert result is None

    def test_get_current_tenant_missing_tenant_id(self, tenant_factory):
        tenant_factory.create_batch(10)
        args = {"input": {}}
        result = get_current_tenant(args)
        assert result is None


class TestTenantUserRoleMiddlewareGetCurrentUserRole:
    def test_get_current_user_role_authenticated_user(self, graphene_client, tenant, user, tenant_membership_factory):
        tenant_membership = tenant_membership_factory(user=user, tenant=tenant, role="admin")
        info = Mock()
        info.context.user = user
        info.context.tenant = tenant
        graphene_client.force_authenticate(user)
        result = get_current_user_role(info)
        assert result == tenant_membership.role

    def test_get_current_user_role_unauthenticated_user(self, tenant, user, tenant_membership_factory):
        tenant_membership_factory(user=user, tenant=tenant, role="admin")
        info = Mock()
        info.context.user = None
        info.context.tenant = tenant
        result = get_current_user_role(info)
        assert result is None

    def test_get_current_user_role_membership_does_not_exist(
        self, graphene_client, tenant, user, tenant_membership_factory
    ):
        tenant_membership_factory(user=user, tenant=tenant, role="admin")
        info = Mock()
        info.context.user = user
        info.context.tenant = None
        graphene_client.force_authenticate(user)
        result = get_current_user_role(info)
        assert result is None
