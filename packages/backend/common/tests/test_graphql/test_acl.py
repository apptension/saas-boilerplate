import graphene
import pytest
from graphene import relay
from graphene_django import DjangoObjectType
from graphql_relay import from_global_id, to_global_id

from apps.demo import models, serializers
from common.acl import policies
from common.graphql import acl as graphql_acl
from common.graphql import mutations

pytestmark = pytest.mark.django_db


def create_query_schema(query_class):
    @graphql_acl.permission_classes(policies.IsAuthenticatedFullAccess)
    class Query(query_class, graphene.ObjectType):
        node = graphene.relay.Node.Field()

    return graphene.Schema(query=Query)


def create_mutation_schema(mutation_class):
    class Query(graphene.ObjectType):
        node = graphene.relay.Node.Field()

    @graphql_acl.permission_classes(policies.IsAuthenticatedFullAccess)
    class ApiMutation(mutation_class, graphene.ObjectType):
        pass

    return graphene.Schema(query=Query, mutation=ApiMutation)


class TestPermissionClassesForQueryConnectionField:
    QUERY = """
        query TestQuery {
          allCrudDemoItems {
            edges {
              node {
                id
                name
              }
            }
          }
        }
    """

    def test_global_policy_for_connection_field(self, graphene_client):
        Query = self.create_query()
        schema = create_query_schema(Query)
        graphene_client.schema = schema

        executed = graphene_client.query(self.QUERY)

        assert executed["errors"][0]["message"] == "permission_denied"

    def test_override_global_policy_for_connection_field(self, graphene_client):
        Query = self.create_query(query_policies=(policies.AnyoneFullAccess,))
        schema = create_query_schema(Query)
        graphene_client.schema = schema

        executed = graphene_client.query(self.QUERY)

        assert executed == {'data': {'allCrudDemoItems': {'edges': []}}}

    def test_global_policy_for_connection_field_by_authenticated_user(self, graphene_client, user):
        Query = self.create_query()
        schema = create_query_schema(Query)
        graphene_client.schema = schema
        graphene_client.force_authenticate(user)

        executed = graphene_client.query(self.QUERY)

        assert executed == {'data': {'allCrudDemoItems': {'edges': []}}}

    @staticmethod
    def create_query(query_policies=None):
        class TestCrudDemoItemType(DjangoObjectType):
            class Meta:
                model = models.CrudDemoItem
                interfaces = (relay.Node,)
                fields = "__all__"

        class TestCrudDemoItemConnection(graphene.Connection):
            class Meta:
                node = TestCrudDemoItemType

        class Query(graphene.ObjectType):
            all_crud_demo_items = graphene.relay.ConnectionField(TestCrudDemoItemConnection)

            def resolve_all_crud_demo_items(self, info, **kwargs):
                return models.CrudDemoItem.objects.all()

        if query_policies:
            return graphql_acl.permission_classes(*query_policies)(Query)
        return Query


class TestPermissionClassesForQueryField:
    QUERY = """
        query TestQuery($id: String!) {
          crudDemoItemById(id: $id) {
            id
            name
          }
        }
    """

    def test_global_policy_for_field(self, graphene_client, crud_demo_item):
        Query = self.create_query()
        schema = create_query_schema(Query)
        item_global_id = to_global_id('TestCrudDemoItemType', str(crud_demo_item.id))
        graphene_client.schema = schema

        executed = graphene_client.query(self.QUERY, variable_values={'id': item_global_id})

        assert executed["errors"][0]["message"] == "permission_denied"

    def test_override_global_policy_for_field(self, graphene_client, crud_demo_item):
        Query = self.create_query(query_policies=(policies.AnyoneFullAccess,))
        schema = create_query_schema(Query)
        item_global_id = to_global_id('TestCrudDemoItemType', str(crud_demo_item.id))
        graphene_client.schema = schema

        executed = graphene_client.query(self.QUERY, variable_values={'id': item_global_id})

        assert executed == {'data': {'crudDemoItemById': {'id': item_global_id, 'name': crud_demo_item.name}}}

    def test_global_policy_for_field_by_authenticated_user(self, graphene_client, crud_demo_item, user):
        Query = self.create_query()
        schema = create_query_schema(Query)
        item_global_id = to_global_id('TestCrudDemoItemType', str(crud_demo_item.id))
        graphene_client.schema = schema
        graphene_client.force_authenticate(user)

        executed = graphene_client.query(self.QUERY, variable_values={'id': item_global_id})

        assert executed == {'data': {'crudDemoItemById': {'id': item_global_id, 'name': crud_demo_item.name}}}

    @staticmethod
    def create_query(query_policies=None):
        class TestCrudDemoItemType(DjangoObjectType):
            class Meta:
                model = models.CrudDemoItem
                interfaces = (relay.Node,)
                fields = "__all__"

        class Query(graphene.ObjectType):
            crud_demo_item_by_id = graphene.Field(TestCrudDemoItemType, id=graphene.String())

            def resolve_crud_demo_item_by_id(self, info, id):
                _, pk = from_global_id(id)
                return models.CrudDemoItem.objects.get(pk=pk)

        if query_policies:
            return graphql_acl.permission_classes(*query_policies)(Query)
        return Query


class TestPermissionClassesForMutationField:
    def test_global_policy(self, graphene_client, tenant):
        Mutation = self.create_mutation()
        schema = create_mutation_schema(Mutation)
        graphene_client.schema = schema

        executed = self.call_mutation(graphene_client, tenant)

        assert executed["errors"][0]["message"] == "permission_denied", executed

    def test_override_global_policy(self, graphene_client, user, tenant):
        Mutation = self.create_mutation(mutation_policies=(policies.AdminFullAccess,))
        schema = create_mutation_schema(Mutation)
        graphene_client.schema = schema
        graphene_client.force_authenticate(user)

        executed = self.call_mutation(graphene_client, tenant)

        assert executed["errors"][0]["message"] == "permission_denied"

    def test_global_policy_by_authenticated_user(self, graphene_client, user, tenant):
        Mutation = self.create_mutation()
        schema = create_mutation_schema(Mutation)
        graphene_client.schema = schema
        graphene_client.force_authenticate(user)

        executed = self.call_mutation(graphene_client, tenant)

        assert executed['data']['createCrudDemoItem']
        assert executed['data']['createCrudDemoItem']['crudDemoItem']
        assert executed['data']['createCrudDemoItem']['crudDemoItem']['name'] == 'Item name'

    @staticmethod
    def call_mutation(client, tenant):
        return client.mutate(
            """
            mutation ($input: TestCreateCrudDemoItemMutationInput!){
              createCrudDemoItem(input: $input) {
                 crudDemoItem {
                  id
                  name
                }
              }
            }
        """,
            variable_values={"input": {'name': 'Item name', "tenantId": to_global_id("TenantType", tenant.id)}},
        )

    @staticmethod
    def create_mutation(mutation_policies=None):
        class TestCrudDemoItemType(DjangoObjectType):
            class Meta:
                model = models.CrudDemoItem
                interfaces = (relay.Node,)
                fields = "__all__"

        class TestCrudDemoItemConnection(graphene.Connection):
            class Meta:
                node = TestCrudDemoItemType

        class TestCreateCrudDemoItemMutation(mutations.CreateTenantDependentModelMutation):
            class Meta:
                serializer_class = serializers.CrudDemoItemSerializer
                edge_class = TestCrudDemoItemConnection.Edge

        class Mutation(graphene.ObjectType):
            create_crud_demo_item = TestCreateCrudDemoItemMutation.Field()

        if mutation_policies:
            return graphql_acl.permission_classes(*mutation_policies)(Mutation)
        return Mutation
