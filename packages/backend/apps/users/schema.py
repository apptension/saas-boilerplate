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
from apps.sso.enforcement import filter_tenants_for_password_session
from . import models
from . import serializers
from .services.users import get_user_from_resolver, get_role_names, get_user_avatar_url


def _create_session_for_user(user, request):
    """
    Create an SSOSession for the user and return the session_id.
    Returns None if session creation fails.
    """
    try:
        from apps.sso.services import SessionService

        session_service = SessionService(user)
        session, session_id = session_service.create_session(request)
        return session_id
    except Exception:
        # Don't fail login if session creation fails
        return None


class ObtainTokenMutation(mutations.SerializerMutation):
    class Meta:
        serializer_class = serializers.CookieTokenObtainPairSerializer

    @classmethod
    @ratelimit.ratelimit(key="ip", rate="30/min")
    def mutate_and_get_payload(cls, root, info, **input):
        mutation = super().mutate_and_get_payload(root, info, **input)

        if mutation.otp_auth_token:
            info.context._request.set_cookies = {
                settings.OTP_AUTH_TOKEN_COOKIE: mutation.otp_auth_token,
            }
        else:
            # Create session for tracking
            user = getattr(mutation, "_user", None)
            if not user:
                # Try to get user from serializer
                serializer = cls._meta.serializer_class
                if hasattr(serializer, "user"):
                    user = serializer.user

            # Get user from validated data - need to look it up by email
            email = input.get("email")
            if email and not user:
                try:
                    user = models.User.objects.get(email__iexact=email)
                except models.User.DoesNotExist:
                    user = None

            session_id = None
            if user:
                session_id = _create_session_for_user(user, info.context._request)

            auth_cookies = {
                settings.ACCESS_TOKEN_COOKIE: mutation.access,
                settings.REFRESH_TOKEN_COOKIE: mutation.refresh,
            }

            # Add session_id cookie if session was created
            if session_id:
                auth_cookies[settings.SESSION_ID_COOKIE] = session_id

            info.context._request.set_auth_cookie = auth_cookies

        return mutation


class SingUpMutation(mutations.SerializerMutation):
    class Meta:
        serializer_class = serializers.UserSignupSerializer

    @classmethod
    @ratelimit.ratelimit(key="ip", rate="10/min")
    def mutate_and_get_payload(cls, root, info, **input):
        mutation = super().mutate_and_get_payload(root, info, **input)

        # Create session for the new user
        email = input.get("email")
        user = None
        if email:
            try:
                user = models.User.objects.get(email__iexact=email)
            except models.User.DoesNotExist:
                pass

        session_id = None
        if user:
            session_id = _create_session_for_user(user, info.context._request)

        auth_cookies = {
            settings.ACCESS_TOKEN_COOKIE: mutation.access,
            settings.REFRESH_TOKEN_COOKIE: mutation.refresh,
        }

        if session_id:
            auth_cookies[settings.SESSION_ID_COOKIE] = session_id

        info.context._request.set_auth_cookie = auth_cookies

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

        # Try to get user from OTP auth token to create session
        user = cls._get_user_from_otp_token(info, input)
        session_id = None
        if user:
            session_id = _create_session_for_user(user, info.context._request)

        auth_cookies = {
            settings.ACCESS_TOKEN_COOKIE: mutation.access,
            settings.REFRESH_TOKEN_COOKIE: mutation.refresh,
        }

        if session_id:
            auth_cookies[settings.SESSION_ID_COOKIE] = session_id

        info.context._request.set_auth_cookie = auth_cookies
        cls._delete_otp_auth_token_cookie(info)

        return mutation

    @classmethod
    def _delete_otp_auth_token_cookie(cls, info):
        info.context._request.delete_cookies = [settings.OTP_AUTH_TOKEN_COOKIE]

    @classmethod
    def _get_user_from_otp_token(cls, info, input):
        """Extract user from OTP auth token."""
        from rest_framework_simplejwt import tokens as jwt_tokens, exceptions as jwt_exceptions

        request = info.context._request
        raw_otp_auth_token = request.COOKIES.get(settings.OTP_AUTH_TOKEN_COOKIE) or input.get("otp_auth_token")

        if not raw_otp_auth_token:
            return None

        try:
            otp_auth_token = jwt_tokens.AccessToken(raw_otp_auth_token)
            user_id = otp_auth_token.get("user_id")
            if user_id:
                return models.User.objects.get(id=user_id)
        except (jwt_exceptions.InvalidToken, jwt_exceptions.TokenError, models.User.DoesNotExist):
            pass

        return None


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
    language = graphene.String()
    roles = graphene.List(of_type=graphene.String)
    tenants = graphene.List(of_type=TenantType)
    avatar = graphene.String()

    class Meta:
        model = models.User
        fields = (
            "id",
            "email",
            "first_name",
            "last_name",
            "language",
            "roles",
            "avatar",
            "otp_enabled",
            "otp_verified",
            "tenants",
        )

    @staticmethod
    def resolve_first_name(parent, info):
        return get_user_from_resolver(info).profile.first_name

    @staticmethod
    def resolve_last_name(parent, info):
        return get_user_from_resolver(info).profile.last_name

    @staticmethod
    def resolve_language(parent, info):
        return get_user_from_resolver(info).profile.language

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
        return filter_tenants_for_password_session(info.context, tenants)


class UserProfileType(DjangoObjectType):
    # Convenience fields that proxy to the user model
    email = graphene.String()
    avatar = graphene.String()
    user_id = graphene.String(description="The hashid of the associated user")

    class Meta:
        model = models.UserProfile
        interfaces = (relay.Node,)
        fields = "__all__"

    def resolve_email(self, info):
        """Return the user's email."""
        return self.user.email if self.user else None

    def resolve_avatar(self, info):
        """Return the user's avatar URL."""
        if self.avatar and hasattr(self.avatar, "thumbnail"):
            try:
                return self.avatar.thumbnail.url
            except ValueError:
                return None
        return None

    def resolve_user_id(self, info):
        """Return the user's hashid."""
        return str(self.user.id) if self.user else None


class CurrentUserConnection(graphene.Connection):
    class Meta:
        node = UserProfileType


class UpdateCurrentUserMutation(mutations.UpdateModelMutation):
    class Meta:
        serializer_class = serializers.UserProfileSerializer
        edge_class = CurrentUserConnection.Edge
        only_fields = ("first_name", "last_name", "avatar", "language")
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
