import pytest
from graphql_relay import to_global_id
from unittest.mock import Mock

from ..middleware import get_current_tenant, get_current_user_role, TenantUserRoleMiddleware


pytestmark = pytest.mark.django_db


class TestGetTenantIdFromArguments:
    def test_get_tenant_id_from_arguments_with_input(self, tenant):
        args = {"input": {"tenant_id": to_global_id("TenantType", tenant.id)}}
        result = TenantUserRoleMiddleware._get_tenant_id_from_arguments(args)
        assert result == tenant.id

    def test_get_tenant_id_from_arguments_without_input(self, tenant):
        args = {"id": to_global_id("TenantType", tenant.id)}
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
