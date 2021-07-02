import graphene
from common.graphql import mutations
from graphene import relay
from graphene_django import DjangoObjectType

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


class DocumentDemoItemType(DjangoObjectType):
    class Meta:
        model = models.DocumentDemoItem
        interfaces = (relay.Node,)


class DocumentDemoItemConnection(graphene.Connection):
    class Meta:
        node = DocumentDemoItemType


class CreateDocumentDemoItemMutation(mutations.CreateModelMutation):
    class Meta:
        serializer_class = serializers.DocumentDemoItemSerializer
        edge_class = DocumentDemoItemConnection.Edge


class DeleteDocumentDemoItemMutation(mutations.DeleteModelMutation):
    class Meta:
        model = models.DocumentDemoItem

    @classmethod
    def mutate_and_get_payload(cls, root, info, id):
        obj = cls.get_object(id, created_by=info.context.user)
        obj.delete()
        return cls(deleted_ids=[id])


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
    all_document_demo_items = graphene.relay.ConnectionField(DocumentDemoItemConnection)

    def resolve_crud_demo_item(root, info, id):
        return models.CrudDemoItem.objects.get(pk=id)

    def resolve_all_crud_demo_items(root, info, **kwargs):
        return models.CrudDemoItem.objects.all()

    def resolve_all_document_demo_items(root, info, **kwargs):
        return info.context.user.documents.all()


class Mutation(graphene.ObjectType):
    create_crud_demo_item = CreateCrudDemoItemMutation.Field()
    update_crud_demo_item = UpdateCrudDemoItemMutation.Field()
    delete_crud_demo_item = DeleteCrudDemoItemMutation.Field()
    create_document_demo_item = CreateDocumentDemoItemMutation.Field()
    delete_document_demo_item = DeleteDocumentDemoItemMutation.Field()
