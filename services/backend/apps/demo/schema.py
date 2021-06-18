import graphene
from graphene import relay
from graphene_django import DjangoObjectType

from common.graphql import mutations
from . import models, serializers


class CrudDemoItemType(DjangoObjectType):
    class Meta:
        model = models.CrudDemoItem
        interfaces = (relay.Node,)


class CrudDemoItemConnection(graphene.Connection):
    class Meta:
        node = CrudDemoItemType


class CreateCrudDemoItemMutation(mutations.CreateModelMutation):
    class Meta:
        serializer_class = serializers.CrudDemoItemSerializer
        edge_class = CrudDemoItemConnection.Edge


class UpdateCrudDemoItemMutation(mutations.UpdateModelMutation):
    class Meta:
        serializer_class = serializers.CrudDemoItemSerializer
        edge_class = CrudDemoItemConnection.Edge


class DeleteCrudDemoItemMutation(mutations.DeleteModelMutation):
    class Meta:
        model = models.CrudDemoItem


class Query(graphene.ObjectType):
    crud_demo_item = graphene.relay.Node.Field(CrudDemoItemType)
    all_crud_demo_items = graphene.relay.ConnectionField(CrudDemoItemConnection)

    def resolve_crud_demo_item(self, info, id):
        return models.CrudDemoItem.objects.get(pk=id)

    def resolve_all_crud_demo_items(self, info, **kwargs):
        return models.CrudDemoItem.objects.all()


class Mutation(graphene.ObjectType):
    create_crud_demo_item = CreateCrudDemoItemMutation.Field()
    update_crud_demo_item = UpdateCrudDemoItemMutation.Field()
    delete_crud_demo_item = DeleteCrudDemoItemMutation.Field()
