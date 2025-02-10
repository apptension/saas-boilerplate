import graphene
from django.shortcuts import get_object_or_404
from graphene import relay
from graphene_django import DjangoObjectType
from graphql_relay import to_global_id, from_global_id

from apps.content import models as content_models
from common.graphql import mutations
from common.acl.policies import IsTenantMemberAccess
from common.graphql.acl import permission_classes
from . import models, serializers


class CrudDemoItemType(DjangoObjectType):
    class Meta:
        model = models.CrudDemoItem
        interfaces = (relay.Node,)
        fields = "__all__"


class ContentfulDemoItemFavoriteType(DjangoObjectType):
    class Meta:
        model = models.ContentfulDemoItemFavorite
        interfaces = (relay.Node,)
        fields = "__all__"


class ContentfulDemoItemType(DjangoObjectType):
    pk = graphene.String()

    class Meta:
        model = content_models.DemoItem
        interfaces = (relay.Node,)
        fields = "__all__"


class CrudDemoItemConnection(graphene.Connection):
    class Meta:
        node = CrudDemoItemType


class ContentfulDemoItemFavoriteConnection(graphene.Connection):
    class Meta:
        node = ContentfulDemoItemFavoriteType


class CreateCrudDemoItemMutation(mutations.CreateTenantDependentModelMutation):
    class Meta:
        serializer_class = serializers.CrudDemoItemSerializer
        edge_class = CrudDemoItemConnection.Edge


class DocumentDemoItemType(DjangoObjectType):
    class Meta:
        model = models.DocumentDemoItem
        interfaces = (relay.Node,)
        fields = "__all__"


class DocumentDemoItemConnection(graphene.Connection):
    class Meta:
        node = DocumentDemoItemType


class CreateDocumentDemoItemMutation(mutations.CreateModelMutation):
    class Meta:
        serializer_class = serializers.DocumentDemoItemSerializer
        edge_class = DocumentDemoItemConnection.Edge


class CreateFavoriteContentfulDemoItemMutation(mutations.CreateModelMutation):
    class Meta:
        serializer_class = serializers.ContentfulDemoItemFavoriteSerializer
        edge_class = ContentfulDemoItemFavoriteConnection.Edge


class DeleteFavoriteContentfulDemoItemMutation(mutations.DeleteModelMutation):
    class Input:
        item = graphene.String()

    class Meta:
        model = models.ContentfulDemoItemFavorite

    @classmethod
    def get_object(cls, **kwargs):
        model = cls._meta.model
        return get_object_or_404(model, **kwargs)

    @classmethod
    def mutate_and_get_payload(cls, root, info, item, *args, **kwargs):
        obj = cls.get_object(item=item, user=info.context.user)
        deleted_id = obj.id
        obj.delete()
        return cls(deleted_ids=[to_global_id('ContentfulDemoItemFavoriteType', deleted_id)])


class DeleteDocumentDemoItemMutation(mutations.DeleteModelMutation):
    class Meta:
        model = models.DocumentDemoItem

    @classmethod
    def mutate_and_get_payload(cls, root, info, id):
        obj = cls.get_object(id, created_by=info.context.user)
        obj.delete()
        return cls(deleted_ids=[id])


class UpdateCrudDemoItemMutation(mutations.UpdateTenantDependentModelMutation):
    class Meta:
        serializer_class = serializers.CrudDemoItemSerializer
        edge_class = CrudDemoItemConnection.Edge


class DeleteCrudDemoItemMutation(mutations.DeleteTenantDependentModelMutation):
    class Meta:
        model = models.CrudDemoItem


class Query(graphene.ObjectType):
    crud_demo_item = graphene.Field(CrudDemoItemType, id=graphene.ID(), tenant_id=graphene.ID())
    all_crud_demo_items = graphene.relay.ConnectionField(CrudDemoItemConnection, tenant_id=graphene.ID())
    all_contentful_demo_item_favorites = graphene.relay.ConnectionField(ContentfulDemoItemFavoriteConnection)
    all_document_demo_items = graphene.relay.ConnectionField(DocumentDemoItemConnection)

    @staticmethod
    @permission_classes(IsTenantMemberAccess)
    def resolve_all_crud_demo_items(root, info, tenant_id, **kwargs):
        _, pk = from_global_id(tenant_id)
        return models.CrudDemoItem.objects.filter(tenant_id=pk).all()

    @staticmethod
    def resolve_all_contentful_demo_item_favorites(root, info, **kwargs):
        return models.ContentfulDemoItemFavorite.objects.filter(user=info.context.user)

    @staticmethod
    def resolve_all_document_demo_items(root, info, **kwargs):
        return info.context.user.documents.all()

    @staticmethod
    @permission_classes(IsTenantMemberAccess)
    def resolve_crud_demo_item(root, info, id, tenant_id, **kwargs):
        _, pk = from_global_id(id)
        _, tenant_pk = from_global_id(tenant_id)
        return get_object_or_404(models.CrudDemoItem, pk=pk, tenant=tenant_pk)


@permission_classes(IsTenantMemberAccess)
class TenantMemberMutation(graphene.ObjectType):
    create_crud_demo_item = CreateCrudDemoItemMutation.Field()
    update_crud_demo_item = UpdateCrudDemoItemMutation.Field()
    delete_crud_demo_item = DeleteCrudDemoItemMutation.Field()


class Mutation(graphene.ObjectType):
    create_document_demo_item = CreateDocumentDemoItemMutation.Field()
    delete_document_demo_item = DeleteDocumentDemoItemMutation.Field()
    create_favorite_contentful_demo_item = CreateFavoriteContentfulDemoItemMutation.Field()
    delete_favorite_contentful_demo_item = DeleteFavoriteContentfulDemoItemMutation.Field()
