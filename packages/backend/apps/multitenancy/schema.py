import graphene
from graphene import relay
from graphql_relay import to_global_id
from graphene_django import DjangoObjectType

from apps.users.services.users import get_user_from_resolver
from common.acl import policies
from common.graphql import mutations
from common.graphql.acl.decorators import permission_classes
from . import models
from . import serializers


class TenantType(DjangoObjectType):
    id = graphene.ID(required=True)
    name = graphene.String()
    slug = graphene.String()
    type = graphene.String()
    role = graphene.String()

    class Meta:
        model = models.Tenant
        fields = ("id", "name", "slug", "type", "role")
        interfaces = (relay.Node,)

    @staticmethod
    def resolve_role(parent, info):
        user = get_user_from_resolver(info)
        return parent.user_memberships.filter(user=user).first().role

    def resolve_id(self, info):
        return to_global_id("TenantType", self.id)


class TenantConnection(graphene.Connection):
    class Meta:
        node = TenantType


class CreateTenantMutation(mutations.CreateModelMutation):
    class Meta:
        serializer_class = serializers.TenantSerializer
        edge_class = TenantConnection.Edge


class UpdateTenantMutation(mutations.UpdateModelMutation):
    class Meta:
        serializer_class = serializers.TenantSerializer
        edge_class = TenantConnection.Edge

    @classmethod
    def get_object(cls, model_class, root, info, **input):
        return info.context.tenant


class DeleteTenantMutation(mutations.DeleteModelMutation):
    class Meta:
        model = models.Tenant


class Query(graphene.ObjectType):
    pass


@permission_classes(policies.IsTenantOwnerAccess)
class TenantOwnerMutation(graphene.ObjectType):
    update_tenant = UpdateTenantMutation.Field()
    delete_tenant = DeleteTenantMutation.Field()


class Mutation(graphene.ObjectType):
    create_tenant = CreateTenantMutation.Field()
