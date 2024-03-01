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


class TenantMembershipType(DjangoObjectType):
    role = graphene.String()
    invitation_accepted = graphene.Boolean()
    user_id = graphene.ID()
    invitee_email_address = graphene.String()
    username = graphene.String()

    class Meta:
        model = models.TenantMembership
        fields = ("role", "invited", "user_id", "invitee_email_address", "username")
        interfaces = (relay.Node,)

    @staticmethod
    def resolve_invitation_accepted(parent, info):
        return parent.is_accepted

    @staticmethod
    def resolve_username(parent, info):
        if parent.user:
            return str(parent.user.profile)
        return None


class TenantType(DjangoObjectType):
    id = graphene.ID(required=True)
    name = graphene.String()
    slug = graphene.String()
    type = graphene.String()
    membership = graphene.NonNull(of_type=TenantMembershipType)
    user_memberships = graphene.List(of_type=TenantMembershipType)

    class Meta:
        model = models.Tenant
        fields = ("id", "name", "slug", "type", "membership", "user_memberships")
        interfaces = (relay.Node,)

    @staticmethod
    def resolve_membership(parent, info):
        user = get_user_from_resolver(info)
        return models.TenantMembership.objects.get_all().filter(user=user, tenant=parent).first()

    def resolve_id(self, info):
        return to_global_id("TenantType", self.id)

    @staticmethod
    @permission_classes(policies.IsTenantAdminAccess)
    def resolve_user_memberships(parent, info):
        return parent.user_memberships.get_all().filter(tenant=parent)


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


class DeleteTenantMembershipMutation(mutations.DeleteModelMutation):
    class Meta:
        model = models.TenantMembership


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
    all_tenants = graphene.relay.ConnectionField(TenantConnection)
    tenant = graphene.Field(TenantType, id=graphene.ID())

    @staticmethod
    def resolve_all_tenants(root, info, **kwargs):
        return models.Tenant.objects.filter(user_memberships__user=info.context.user).all()

    @staticmethod
    def resolve_tenant(root, info, id):
        _, pk = from_global_id(id)
        return models.Tenant.objects.filter(pk=pk, user_memberships__user=info.context.user).first()


@permission_classes(policies.IsTenantOwnerAccess)
class TenantOwnerMutation(graphene.ObjectType):
    update_tenant = UpdateTenantMutation.Field()
    delete_tenant = DeleteTenantMutation.Field()
    create_tenant_invitation = CreateTenantInvitationMutation.Field()
    delete_tenant_membership = DeleteTenantMembershipMutation.Field()


class Mutation(graphene.ObjectType):
    create_tenant = CreateTenantMutation.Field()
    accept_tenant_invitation = AcceptTenantInvitationMutation.Field()
    decline_tenant_invitation = DeclineTenantInvitationMutation.Field()
