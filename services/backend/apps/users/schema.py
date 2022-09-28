import graphene
from graphene import relay
from graphene_django import DjangoObjectType

from common.acl import policies
from common.graphql import mutations
from common.graphql.acl.decorators import permission_classes
from . import models
from . import serializers
from .services.users import get_user_from_resolver, get_role_names, get_user_avatar_url


class ObtainTokenMutation(mutations.SerializerMutation):
    class Meta:
        serializer_class = serializers.CookieTokenObtainPairSerializer

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        mutation = super().mutate_and_get_payload(root, info, **input)
        info.context._request.set_auth_cookie = {
            "access": mutation.access,
            "refresh": mutation.refresh,
        }

        return mutation


class SingUpMutation(mutations.SerializerMutation):
    class Meta:
        serializer_class = serializers.UserSignupSerializer

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        mutation = super().mutate_and_get_payload(root, info, **input)
        info.context._request.set_auth_cookie = {
            "access": mutation.access,
            "refresh": mutation.refresh,
        }

        return mutation


class ConfirmEmailMutation(mutations.SerializerMutation):
    ok = graphene.Boolean()

    class Meta:
        serializer_class = serializers.UserAccountConfirmationSerializer


class PasswordResetMutation(mutations.SerializerMutation):
    class Meta:
        serializer_class = serializers.PasswordResetSerializer


class PasswordResetConfirmationMutation(mutations.SerializerMutation):
    class Meta:
        serializer_class = serializers.PasswordResetConfirmationSerializer


@permission_classes(policies.AnyoneFullAccess)
class AnyoneMutation(graphene.ObjectType):
    token_auth = ObtainTokenMutation.Field()
    sign_up = SingUpMutation.Field()
    confirm = ConfirmEmailMutation.Field()
    password_reset = PasswordResetMutation.Field()
    password_reset_confirm = PasswordResetConfirmationMutation.Field()


@permission_classes(policies.AnyoneFullAccess)
class AuthenticatedMutation(graphene.ObjectType):
    pass


class CurrentUserType(DjangoObjectType):
    first_name = graphene.String()
    last_name = graphene.String()
    roles = graphene.List(of_type=graphene.String)
    avatar = graphene.String()

    class Meta:
        model = models.User
        fields = ("id", "email", "first_name", "last_name", "roles", "avatar")

    def resolve_first_name(self, info):
        return get_user_from_resolver(info).profile.first_name

    def resolve_last_name(self, info):
        return get_user_from_resolver(info).profile.last_name

    def resolve_roles(self, info):
        return get_role_names(get_user_from_resolver(info))

    def resolve_avatar(self, info):
        return get_user_avatar_url(get_user_from_resolver(info))


class UserProfileType(DjangoObjectType):
    class Meta:
        model = models.UserProfile
        interfaces = (relay.Node,)


class CurrentUserConnection(graphene.Connection):
    class Meta:
        node = UserProfileType


class UpdateCurrentUserMutation(mutations.UpdateModelMutation):
    class Meta:
        serializer_class = serializers.UserProfileSerializer
        edge_class = CurrentUserConnection.Edge
        only_fields = ("first_name", "last_name", "avatar")
        model_operations = ("update",)

    @classmethod
    def get_queryset(cls, model_class: models.User, root, info, **input):
        return get_user_from_resolver(info).profile

    @classmethod
    def get_object(cls, model_class, root, info, **input):
        return get_user_from_resolver(info).profile


class ChangePasswordMutation(mutations.SerializerMutation):
    class Meta:
        serializer_class = serializers.UserAccountChangePasswordSerializer
        exclude_fields = ("user",)

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        mutation = super().mutate_and_get_payload(root, info, **input)
        info.context._request.set_auth_cookie = {
            "access": mutation.access,
            "refresh": mutation.refresh,
        }

        return mutation


class Query(graphene.ObjectType):
    current_user = graphene.Field(CurrentUserType)

    def resolve_current_user(self, info, **kwargs):
        return info.context.user


class Mutation(graphene.ObjectType):
    change_password = ChangePasswordMutation.Field()
    update_current_user = UpdateCurrentUserMutation.Field()
