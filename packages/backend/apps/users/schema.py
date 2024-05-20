from rest_framework.exceptions import ValidationError

import graphene
from config import settings
from graphene import relay
from graphene_django import DjangoObjectType

from common.acl import policies
from common.graphql import mutations
from common.graphql import ratelimit
from common.graphql.acl.decorators import permission_classes
from apps.multitenancy.models import Tenant
from apps.multitenancy.schema import TenantType
from . import models
from . import serializers
from .services.users import get_user_from_resolver, get_role_names, get_user_avatar_url


class ObtainTokenMutation(mutations.SerializerMutation):
    class Meta:
        serializer_class = serializers.CookieTokenObtainPairSerializer

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        mutation = super().mutate_and_get_payload(root, info, **input)

        if mutation.otp_auth_token:
            info.context._request.set_cookies = {
                settings.OTP_AUTH_TOKEN_COOKIE: mutation.otp_auth_token,
            }
        else:
            info.context._request.set_auth_cookie = {
                settings.ACCESS_TOKEN_COOKIE: mutation.access,
                settings.REFRESH_TOKEN_COOKIE: mutation.refresh,
            }

        return mutation


class SingUpMutation(mutations.SerializerMutation):
    class Meta:
        serializer_class = serializers.UserSignupSerializer

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        mutation = super().mutate_and_get_payload(root, info, **input)
        info.context._request.set_auth_cookie = {
            settings.ACCESS_TOKEN_COOKIE: mutation.access,
            settings.REFRESH_TOKEN_COOKIE: mutation.refresh,
        }

        return mutation


class ConfirmEmailMutation(mutations.SerializerMutation):
    ok = graphene.Boolean()

    class Meta:
        serializer_class = serializers.UserAccountConfirmationSerializer


class PasswordResetMutation(mutations.SerializerMutation):
    class Meta:
        serializer_class = serializers.PasswordResetSerializer

    @classmethod
    @ratelimit.ratelimit(key="ip", rate=ratelimit.ip_throttle_rate)
    def mutate_and_get_payload(cls, root, info, **input):
        return super().mutate_and_get_payload(root, info, **input)


class PasswordResetConfirmationMutation(mutations.SerializerMutation):
    class Meta:
        serializer_class = serializers.PasswordResetConfirmationSerializer


class GenerateOTPMutation(mutations.SerializerMutation):
    class Meta:
        serializer_class = serializers.GenerateOTPSerializer


class VerifyOTPMutation(mutations.SerializerMutation):
    class Meta:
        serializer_class = serializers.VerifyOTPSerializer


class ValidateOTPMutation(mutations.SerializerMutation):
    class Meta:
        serializer_class = serializers.ValidateOTPSerializer

    @classmethod
    @ratelimit.ratelimit(key="ip", rate=ratelimit.ip_throttle_rate)
    def mutate_and_get_payload(cls, root, info, **input):
        try:
            mutation = super().mutate_and_get_payload(root, info, **input)
        except ValidationError as error:
            cls._delete_otp_auth_token_cookie(info)
            raise error

        info.context._request.set_auth_cookie = {
            settings.ACCESS_TOKEN_COOKIE: mutation.access,
            settings.REFRESH_TOKEN_COOKIE: mutation.refresh,
        }
        cls._delete_otp_auth_token_cookie(info)

        return mutation

    @classmethod
    def _delete_otp_auth_token_cookie(cls, info):
        info.context._request.delete_cookies = [settings.OTP_AUTH_TOKEN_COOKIE]


class DisableOTPMutation(mutations.SerializerMutation):
    class Meta:
        serializer_class = serializers.DisableOTPSerializer


@permission_classes(policies.AnyoneFullAccess)
class AnyoneMutation(graphene.ObjectType):
    token_auth = ObtainTokenMutation.Field()
    sign_up = SingUpMutation.Field()
    confirm = ConfirmEmailMutation.Field()
    password_reset = PasswordResetMutation.Field()
    password_reset_confirm = PasswordResetConfirmationMutation.Field()
    validate_otp = ValidateOTPMutation.Field()


@permission_classes(policies.IsAuthenticatedFullAccess)
class AuthenticatedMutation(graphene.ObjectType):
    generate_otp = GenerateOTPMutation.Field()
    verify_otp = VerifyOTPMutation.Field()
    disable_otp = DisableOTPMutation.Field()


class CurrentUserType(DjangoObjectType):
    first_name = graphene.String()
    last_name = graphene.String()
    roles = graphene.List(of_type=graphene.String)
    tenants = graphene.List(of_type=TenantType)
    avatar = graphene.String()

    class Meta:
        model = models.User
        fields = ("id", "email", "first_name", "last_name", "roles", "avatar", "otp_enabled", "otp_verified", "tenants")

    @staticmethod
    def resolve_first_name(parent, info):
        return get_user_from_resolver(info).profile.first_name

    @staticmethod
    def resolve_last_name(parent, info):
        return get_user_from_resolver(info).profile.last_name

    @staticmethod
    def resolve_roles(parent, info):
        return get_role_names(get_user_from_resolver(info))

    @staticmethod
    def resolve_avatar(parent, info):
        return get_user_avatar_url(get_user_from_resolver(info))

    @staticmethod
    def resolve_tenants(parent, info):
        user = get_user_from_resolver(info)
        tenants = user.tenants.all()
        if not len(tenants):
            Tenant.objects.get_or_create_user_default_tenant(user)
        return tenants


class UserProfileType(DjangoObjectType):
    class Meta:
        model = models.UserProfile
        interfaces = (relay.Node,)
        fields = "__all__"


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
        exclude = ("user",)

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        mutation = super().mutate_and_get_payload(root, info, **input)
        info.context._request.set_auth_cookie = {
            "access": mutation.access,
            "refresh": mutation.refresh,
        }

        return mutation


@permission_classes(policies.AnyoneFullAccess)
class Query(graphene.ObjectType):
    current_user = graphene.Field(CurrentUserType)

    @staticmethod
    def resolve_current_user(root, info, **kwargs):
        return info.context.user if info.context.user.is_authenticated else None


class Mutation(graphene.ObjectType):
    change_password = ChangePasswordMutation.Field()
    update_current_user = UpdateCurrentUserMutation.Field()
