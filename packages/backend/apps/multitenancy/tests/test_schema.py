import pytest
from graphql_relay import to_global_id

from ..constants import TenantType, TenantUserRole


pytestmark = pytest.mark.django_db


class TestCreateTenantMutation:
    MUTATION = '''
        mutation CreateTenant($input: CreateTenantMutationInput!) {
          createTenant(input: $input) {
            tenant {
              id
              name
              slug
              type
              role
            }
          }
        }
    '''

    def test_create_new_tenant(self, graphene_client, user):
        graphene_client.force_authenticate(user)
        executed = self.mutate(graphene_client, {"name": "Test"})
        response_data = executed["data"]["createTenant"]["tenant"]
        assert response_data["name"] == "Test"
        assert response_data["slug"] == "test"
        assert response_data["type"] == TenantType.ORGANIZATION
        assert response_data["role"] == TenantUserRole.OWNER

    def test_create_new_tenant_with_same_name(self, graphene_client, user, tenant_factory):
        tenant_factory(name="Test", slug="test")
        graphene_client.force_authenticate(user)
        executed = self.mutate(graphene_client, {"name": "Test"})
        response_data = executed["data"]["createTenant"]["tenant"]
        assert response_data["name"] == "Test"
        assert response_data["slug"] == "test-1"
        assert response_data["type"] == TenantType.ORGANIZATION
        assert response_data["role"] == TenantUserRole.OWNER

    def test_unauthenticated_user(self, graphene_client):
        executed = self.mutate(graphene_client, {"name": "Test"})
        assert executed["errors"][0]["message"] == "permission_denied"

    @classmethod
    def mutate(cls, graphene_client, data):
        return graphene_client.mutate(cls.MUTATION, variable_values={'input': data})


class TestUpdateTenantMutation:
    MUTATION = '''
        mutation UpdateTenant($input: UpdateTenantMutationInput!) {
          updateTenant(input: $input) {
            tenant {
              id
              name
              slug
              type
              role
            }
          }
        }
    '''

    def test_update_tenant(self, graphene_client, user, tenant_factory, tenant_membership_factory):
        tenant = tenant_factory(name="Tenant 1", type=TenantType.ORGANIZATION)
        tenant_membership_factory(tenant=tenant, user=user, role=TenantUserRole.OWNER)
        graphene_client.force_authenticate(user)
        graphene_client.set_tenant_dependent_context(tenant, TenantUserRole.OWNER)
        executed = self.mutate(graphene_client, {"id": to_global_id("TenantType", tenant.id), "name": "Tenant 2"})
        response_data = executed["data"]["updateTenant"]["tenant"]
        assert response_data["name"] == "Tenant 2"
        assert response_data["slug"] == "tenant-2"
        assert response_data["type"] == TenantType.ORGANIZATION
        assert response_data["role"] == TenantUserRole.OWNER

    def test_user_without_membership(self, graphene_client, user, tenant_factory):
        tenant = tenant_factory(name="Tenant 1", type=TenantType.ORGANIZATION)
        graphene_client.force_authenticate(user)
        graphene_client.set_tenant_dependent_context(tenant, None)
        executed = self.mutate(graphene_client, {"id": to_global_id("TenantType", tenant.id), "name": "Tenant 2"})
        assert executed["errors"][0]["message"] == "permission_denied"

    def test_user_with_admin_membership(self, graphene_client, user, tenant_factory, tenant_membership_factory):
        tenant = tenant_factory(name="Tenant 1", type=TenantType.ORGANIZATION)
        tenant_membership_factory(tenant=tenant, user=user, role=TenantUserRole.ADMIN)
        graphene_client.force_authenticate(user)
        graphene_client.set_tenant_dependent_context(tenant, TenantUserRole.ADMIN)
        executed = self.mutate(graphene_client, {"id": to_global_id("TenantType", tenant.id), "name": "Tenant 2"})
        assert executed["errors"][0]["message"] == "permission_denied"

    def test_user_with_member_membership(self, graphene_client, user, tenant_factory, tenant_membership_factory):
        tenant = tenant_factory(name="Tenant 1", type=TenantType.ORGANIZATION)
        tenant_membership_factory(tenant=tenant, user=user, role=TenantUserRole.MEMBER)
        graphene_client.force_authenticate(user)
        graphene_client.set_tenant_dependent_context(tenant, TenantUserRole.MEMBER)
        executed = self.mutate(graphene_client, {"id": to_global_id("TenantType", tenant.id), "name": "Tenant 2"})
        assert executed["errors"][0]["message"] == "permission_denied"

    def test_unauthenticated_user(self, graphene_client, tenant_factory):
        tenant = tenant_factory(name="Tenant 1")
        executed = self.mutate(graphene_client, {"id": to_global_id("TenantType", tenant.id), "name": "Tenant 2"})
        assert executed["errors"][0]["message"] == "permission_denied"

    @classmethod
    def mutate(cls, graphene_client, data):
        return graphene_client.mutate(cls.MUTATION, variable_values={'input': data})


class TestDeleteTenantMutation:
    MUTATION = '''
        mutation DeleteTenant($input: DeleteTenantMutationInput!) {
          deleteTenant(input: $input) {
            deletedIds
          }
        }
    '''

    def test_delete_tenant(self, graphene_client, user, tenant_factory, tenant_membership_factory):
        tenant = tenant_factory(name="Tenant 1", type=TenantType.ORGANIZATION)
        tenant_membership_factory(tenant=tenant, user=user, role=TenantUserRole.OWNER)
        graphene_client.force_authenticate(user)
        graphene_client.set_tenant_dependent_context(tenant, TenantUserRole.OWNER)
        executed = self.mutate(graphene_client, {"id": to_global_id("TenantType", tenant.id)})
        response_data = executed["data"]["deleteTenant"]["deletedIds"]
        assert response_data[0] == to_global_id("TenantType", tenant.id)

    def test_user_without_membership(self, graphene_client, user, tenant_factory):
        tenant = tenant_factory(name="Tenant 1", type=TenantType.ORGANIZATION)
        graphene_client.force_authenticate(user)
        graphene_client.set_tenant_dependent_context(tenant, None)
        executed = self.mutate(graphene_client, {"id": to_global_id("TenantType", tenant.id)})
        assert executed["errors"][0]["message"] == "permission_denied"

    def test_user_with_admin_membership(self, graphene_client, user, tenant_factory, tenant_membership_factory):
        tenant = tenant_factory(name="Tenant 1", type=TenantType.ORGANIZATION)
        tenant_membership_factory(tenant=tenant, user=user, role=TenantUserRole.ADMIN)
        graphene_client.force_authenticate(user)
        graphene_client.set_tenant_dependent_context(tenant, TenantUserRole.ADMIN)
        executed = self.mutate(graphene_client, {"id": to_global_id("TenantType", tenant.id)})
        assert executed["errors"][0]["message"] == "permission_denied"

    def test_user_with_member_membership(self, graphene_client, user, tenant_factory, tenant_membership_factory):
        tenant = tenant_factory(name="Tenant 1", type=TenantType.ORGANIZATION)
        tenant_membership_factory(tenant=tenant, user=user, role=TenantUserRole.MEMBER)
        graphene_client.force_authenticate(user)
        graphene_client.set_tenant_dependent_context(tenant, TenantUserRole.MEMBER)
        executed = self.mutate(graphene_client, {"id": to_global_id("TenantType", tenant.id)})
        assert executed["errors"][0]["message"] == "permission_denied"

    def test_unauthenticated_user(self, graphene_client, tenant_factory):
        tenant = tenant_factory(name="Tenant 1")
        executed = self.mutate(graphene_client, {"id": to_global_id("TenantType", tenant.id)})
        assert executed["errors"][0]["message"] == "permission_denied"

    @classmethod
    def mutate(cls, graphene_client, data):
        return graphene_client.mutate(cls.MUTATION, variable_values={'input': data})
