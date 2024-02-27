import graphene
from graphene import relay
from graphql_relay import to_global_id, from_global_id
from graphene_django import DjangoObjectType

from apps.users.services.users import get_user_from_resolver
from common.acl import policies
from common.graphql import mutations
from common.graphql.acl.decorators import permission_classes
from . import models
from . import serializers
from . import constants


class TenantMembershipType(DjangoObjectType):
    role = graphene.String()
    invitation_accepted = graphene.Boolean()

    class Meta:
        model = models.TenantMembership
        fields = ("role", "invited")
        interfaces = (relay.Node,)

    @staticmethod
    def resolve_invitation_accepted(parent, info):
        return parent.is_accepted


class TenantType(DjangoObjectType):
    id = graphene.ID(required=True)
    name = graphene.String()
    slug = graphene.String()
    type = graphene.String()
    membership = graphene.NonNull(of_type=TenantMembershipType)

    class Meta:
        model = models.Tenant
        fields = ("id", "name", "slug", "type", "membership")
        interfaces = (relay.Node,)

    @staticmethod
    def resolve_membership(parent, info):
        user = get_user_from_resolver(info)
        return models.TenantMembership.objects.get_all().filter(user=user, tenant=parent).first()

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


class CreateTenantInvitationMutation(mutations.SerializerMutation):
    ok = graphene.Boolean()

    class Meta:
        serializer_class = serializers.CreateTenantInvitationSerializer


class AcceptTenantInvitationMutation(mutations.SerializerMutation):
    ok = graphene.Boolean()

    class Meta:
        serializer_class = serializers.AcceptTenantInvitationSerializer

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        if "id" in input:
            _, input["id"] = from_global_id(input["id"])
        return super().mutate_and_get_payload(root, info, **input)


class DeclineTenantInvitationMutation(mutations.SerializerMutation):
    ok = graphene.Boolean()

    class Meta:
        serializer_class = serializers.DeclineTenantInvitationSerializer

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        if "id" in input:
            _, input["id"] = from_global_id(input["id"])
        return super().mutate_and_get_payload(root, info, **input)


class Query(graphene.ObjectType):
    pass


@permission_classes(policies.IsTenantOwnerAccess)
class TenantOwnerMutation(graphene.ObjectType):
    update_tenant = UpdateTenantMutation.Field()
    delete_tenant = DeleteTenantMutation.Field()
    create_tenant_invitation = CreateTenantInvitationMutation.Field()


class Mutation(graphene.ObjectType):
    create_tenant = CreateTenantMutation.Field()
    accept_tenant_invitation = AcceptTenantInvitationMutation.Field()
    decline_tenant_invitation = DeclineTenantInvitationMutation.Field()
