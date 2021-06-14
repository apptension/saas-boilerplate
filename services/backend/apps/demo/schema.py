import graphene
from graphene import relay
from graphene_django import DjangoObjectType
from graphql_relay import from_global_id

from common.graphql import mutations
from . import models, serializers


class CrudDemoItemType(DjangoObjectType):
    class Meta:
        model = models.CrudDemoItem
        interfaces = (relay.Node,)


class CrudDemoItemConnection(graphene.Connection):
    class Meta:
        node = CrudDemoItemType


class CreateOrUpdateCrudDemoItemMutation(mutations.RelaySerializerMutation):
    class Meta:
        serializer_class = serializers.CrudDemoItemSerializer
        edge_class = CrudDemoItemConnection.Edge


class DeleteCrudDemoItemMutation(mutations.DjangoModelDeleteMutation):
    class Meta:
        model = models.CrudDemoItem


class Query(graphene.ObjectType):
    all_crud_demo_items = graphene.relay.ConnectionField(CrudDemoItemConnection)
    crud_demo_item_by_id = graphene.Field(CrudDemoItemType, id=graphene.String())

    def resolve_crud_demo_item_by_id(self, info, id):
        _, pk = from_global_id(id)
        return models.CrudDemoItem.objects.get(pk=pk)

    def resolve_all_crud_demo_items(self, info, **kwargs):
        return models.CrudDemoItem.objects.all()


class Mutation(graphene.ObjectType):
    create_or_update_crud_demo_item = CreateOrUpdateCrudDemoItemMutation.Field()
    delete_crud_demo_item = DeleteCrudDemoItemMutation.Field()
