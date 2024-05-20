import graphene
from graphene import relay
from graphql_relay import to_global_id, from_global_id
from graphene_django import DjangoObjectType
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import PermissionDenied

from apps.users.services.users import get_user_from_resolver, get_user_avatar_url
from common.acl import policies
from common.graphql import mutations, exceptions
from common.graphql.acl.decorators import permission_classes
from common.graphql.acl.wrappers import PERMISSION_DENIED_MESSAGE
from apps.finances.services import subscriptions
from apps.finances.serializers import CancelTenantActiveSubscriptionSerializer
from . import models
from . import serializers
from .tokens import tenant_invitation_token
from .constants import TenantUserRole, TenantType as ConstantsTenantType


TenantUserRoleType = graphene.Enum.from_enum(TenantUserRole)


class TenantMembershipType(DjangoObjectType):
    id = graphene.ID(required=True)
    invitation_accepted = graphene.Boolean()
    user_id = graphene.ID()
    invitee_email_address = graphene.String()
    invitation_token = graphene.String()
    first_name = graphene.String()
    last_name = graphene.String()
    user_email = graphene.String()
    avatar = graphene.String()
    role = TenantUserRoleType()

    class Meta:
        model = models.TenantMembership
        fields = (
            "id",
            "role",
            "invitation_accepted",
            "user_id",
            "invitee_email_address",
            "invitation_token",
            "first_name",
            "last_name",
            "user_email",
            "avatar",
        )
        interfaces = (relay.Node,)

    def resolve_id(self, info):
        return to_global_id("TenantMembershipType", self.id)

    @staticmethod
    def resolve_invitation_token(parent, info):
        user = get_user_from_resolver(info)
        if parent.user and user == parent.user and not parent.is_accepted:
            return tenant_invitation_token.make_token(user.email, parent)
        return None

    @staticmethod
    def resolve_invitation_accepted(parent, info):
        return parent.is_accepted

    @staticmethod
    def resolve_first_name(parent, info):
        return parent.user.profile.first_name if parent.user else None

    @staticmethod
    def resolve_last_name(parent, info):
        return parent.user.profile.last_name if parent.user else None

    @staticmethod
    def resolve_user_email(parent, info):
        return parent.user.email if parent.user else None

    @staticmethod
    def resolve_avatar(parent, info):
        return get_user_avatar_url(parent.user) if parent.user else None


class TenantType(DjangoObjectType):
    id = graphene.ID(required=True)
    name = graphene.String()
    slug = graphene.String()
    type = graphene.String()
    billing_email = graphene.String()
    membership = graphene.NonNull(of_type=TenantMembershipType)
    user_memberships = graphene.List(of_type=TenantMembershipType)

    class Meta:
        model = models.Tenant
        fields = ("id", "name", "slug", "billing_email", "type", "membership", "user_memberships")
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
    """
    Mutation to delete a tenant from the system.
    """

    class Meta:
        model = models.Tenant

    @classmethod
    def mutate_and_get_payload(cls, root, info, id, **kwargs):
        """
        Perform deletion of a tenant and subscription cancellation.

        Returns:
            DeleteTenantMutation: The mutation object with list of deleted_ids.

        Raises:
            GraphQlValidationError: If deletion encounters validation errors.
        """
        tenant = info.context.tenant

        if tenant.type == ConstantsTenantType.DEFAULT:
            raise exceptions.GraphQlValidationError("Cannot delete default type tenant.")

        schedule = subscriptions.get_schedule(tenant)
        cancel_subscription_serializer = CancelTenantActiveSubscriptionSerializer(instance=schedule, data={})
        if cancel_subscription_serializer.is_valid():
            cancel_subscription_serializer.save()

        tenant.delete()
        return cls(deleted_ids=[id])


class CreateTenantInvitationMutation(mutations.SerializerMutation):
    ok = graphene.Boolean()

    class Meta:
        serializer_class = serializers.CreateTenantInvitationSerializer


class DeleteTenantMembershipMutation(mutations.DeleteModelMutation):
    class Input:
        id = graphene.String()
        tenant_id = graphene.String(required=True)

    class Meta:
        model = models.TenantMembership

    @classmethod
    def get_object(cls, id, tenant, **kwargs):
        model = cls._meta.model
        _, pk = from_global_id(id)
        return get_object_or_404(model.objects.get_all(), pk=pk, tenant=tenant)

    @classmethod
    def mutate_and_get_payload(cls, root, info, id, **kwargs):
        obj = cls.get_object(id, info.context.tenant)
        user = info.context.user
        user_role = info.context.user_role

        if user_role != TenantUserRole.OWNER and obj.user != user:
            raise PermissionDenied(PERMISSION_DENIED_MESSAGE)

        if obj.role == TenantUserRole.OWNER and info.context.tenant.owners_count == 1:
            raise exceptions.GraphQlValidationError("There must be at least one owner in the Tenant.")

        obj.delete()
        return cls(deleted_ids=[id])


class UpdateTenantMembershipMutation(mutations.UpdateModelMutation):
    class Input:
        id = graphene.String()
        tenant_id = graphene.String(required=True)

    class Meta:
        serializer_class = serializers.UpdateTenantMembershipSerializer
        edge_class = TenantConnection.Edge
        convert_choices_to_enum = True

    @classmethod
    def get_object(cls, model_class, root, info, **input):
        return get_object_or_404(model_class.objects.get_all(), pk=input["id"], tenant=info.context.tenant)

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        if "id" in input:
            _, input["id"] = from_global_id(input["id"])
        return super().mutate_and_get_payload(root, info, **input)


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
    @permission_classes(policies.AnyoneFullAccess)
    def resolve_all_tenants(root, info, **kwargs):
        if info.context.user.is_authenticated:
            return models.Tenant.objects.filter(user_memberships__user=info.context.user).all()
        return []

    @staticmethod
    def resolve_tenant(root, info, id):
        _, pk = from_global_id(id)
        return models.Tenant.objects.filter(pk=pk, user_memberships__user=info.context.user).first()


@permission_classes(policies.IsTenantOwnerAccess)
class TenantOwnerMutation(graphene.ObjectType):
    update_tenant = UpdateTenantMutation.Field()
    delete_tenant = DeleteTenantMutation.Field()
    create_tenant_invitation = CreateTenantInvitationMutation.Field()
    update_tenant_membership = UpdateTenantMembershipMutation.Field()


class Mutation(graphene.ObjectType):
    create_tenant = CreateTenantMutation.Field()
    accept_tenant_invitation = AcceptTenantInvitationMutation.Field()
    decline_tenant_invitation = DeclineTenantInvitationMutation.Field()
    delete_tenant_membership = DeleteTenantMembershipMutation.Field()
