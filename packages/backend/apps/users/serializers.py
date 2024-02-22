from rest_framework_simplejwt.tokens import RefreshToken

from django.conf import settings
from django.contrib import auth as dj_auth
from django.contrib.auth import password_validation, get_user_model
from django.contrib.auth.models import update_last_login
from django.utils.translation import gettext as _
from hashid_field import rest
from rest_framework import exceptions, serializers, validators
from rest_framework_simplejwt import serializers as jwt_serializers, tokens as jwt_tokens, exceptions as jwt_exceptions
from rest_framework_simplejwt.serializers import PasswordField
from rest_framework_simplejwt.settings import api_settings as jwt_api_settings
from common.decorators import context_user_required

from . import models, tokens, jwt, notifications
from .services.users import get_role_names
from .services import otp as otp_services
from .utils import generate_otp_auth_token

from apps.multitenancy.models import Tenant

UPLOADED_AVATAR_SIZE_LIMIT = 1 * 1024 * 1024


class UserProfileSerializer(serializers.ModelSerializer):
    id = rest.HashidSerializerCharField(source_field="users.User.id", source="user.id", read_only=True)
    email = serializers.CharField(source="user.email", read_only=True)
    roles = serializers.SerializerMethodField()
    avatar = serializers.FileField(required=False)

    class Meta:
        model = models.UserProfile
        fields = ("id", "first_name", "last_name", "email", "roles", "avatar")

    @staticmethod
    def validate_avatar(avatar):
        if avatar and avatar.size > UPLOADED_AVATAR_SIZE_LIMIT:
            raise exceptions.ValidationError({"avatar": _("Too large file")}, 'too_large')

        return avatar

    def get_roles(self, obj):
        return get_role_names(obj.user)

    def to_representation(self, instance):
        self.fields["avatar"] = serializers.FileField(source="avatar.thumbnail", default="")
        return super().to_representation(instance)

    def update(self, instance, validated_data):
        avatar = validated_data.pop("avatar", None)
        if avatar:
            if not instance.avatar:
                instance.avatar = models.UserAvatar()
            instance.avatar.original = avatar
            instance.avatar.save()
        return super().update(instance, validated_data)


class UserSignupSerializer(serializers.ModelSerializer):
    id = rest.HashidSerializerCharField(source_field="users.User.id", read_only=True)
    email = serializers.EmailField(
        validators=[validators.UniqueValidator(queryset=dj_auth.get_user_model().objects.all())],
    )
    password = serializers.CharField(write_only=True)
    access = serializers.CharField(read_only=True)
    refresh = serializers.CharField(read_only=True)

    class Meta:
        model = dj_auth.get_user_model()
        fields = ("id", "email", "password", "access", "refresh")

    def validate_password(self, password):
        password_validation.validate_password(password)
        return password

    def create(self, validated_data):
        user = dj_auth.get_user_model().objects.create_user(
            validated_data["email"],
            validated_data["password"],
        )

        refresh = jwt_tokens.RefreshToken.for_user(user)

        if jwt_api_settings.UPDATE_LAST_LOGIN:
            update_last_login(None, user)

        notifications.AccountActivationEmail(
            user=user, data={'user_id': user.id.hashid, 'token': tokens.account_activation_token.make_token(user)}
        ).send()

        # Create user signup tenant
        Tenant.objects.get_or_create_user_default_tenant(user)

        return {'id': user.id, 'email': user.email, 'access': str(refresh.access_token), 'refresh': str(refresh)}


class UserAccountConfirmationSerializer(serializers.Serializer):
    user = serializers.PrimaryKeyRelatedField(
        queryset=models.User.objects.all(),
        pk_field=rest.HashidSerializerCharField(),
        write_only=True,
    )
    token = serializers.CharField(write_only=True)
    ok = serializers.BooleanField(read_only=True)

    def validate(self, attrs):
        token = attrs["token"]
        user = attrs["user"]

        if not tokens.account_activation_token.check_token(user, token):
            raise exceptions.ValidationError(_("Malformed user account confirmation token"))

        return attrs

    def create(self, validated_data):
        user = validated_data.pop("user")
        user.is_confirmed = True
        user.save()
        return {"ok": True}


class UserAccountChangePasswordSerializer(serializers.Serializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    old_password = serializers.CharField(write_only=True, help_text=_("Old password"))
    new_password = serializers.CharField(write_only=True, help_text=_("New password"))

    refresh = serializers.CharField(read_only=True)
    access = serializers.CharField(read_only=True)

    def validate_new_password(self, new_password):
        password_validation.validate_password(new_password)
        return new_password

    def validate(self, attrs):
        old_password = attrs["old_password"]

        user = attrs["user"]
        if not user.check_password(old_password):
            raise exceptions.ValidationError({"old_password": _("Wrong old password")}, 'wrong_password')

        return attrs

    def create(self, validated_data):
        user = validated_data.pop("user")
        new_password = validated_data.pop("new_password")
        user.set_password(new_password)
        user.save()

        refresh = jwt_tokens.RefreshToken.for_user(user)

        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }


class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField(write_only=True, help_text=_("User e-mail"))
    ok = serializers.BooleanField(read_only=True)

    def validate(self, attrs):
        user = None
        try:
            user = dj_auth.get_user_model().objects.get(email=attrs["email"])
        except dj_auth.get_user_model().DoesNotExist:
            pass

        return {**attrs, 'user': user}

    def create(self, validated_data):
        user = validated_data.pop('user')

        if user:
            notifications.PasswordResetEmail(
                user=user, data={'user_id': user.id.hashid, 'token': tokens.password_reset_token.make_token(user)}
            ).send()

        return {"ok": True}


class PasswordResetConfirmationSerializer(serializers.Serializer):
    # user field is a CharField by design to hide the information whether the user exists or not
    user = serializers.CharField(write_only=True)

    new_password = serializers.CharField(write_only=True, help_text=_("New password"))
    token = serializers.CharField(write_only=True, help_text=_("Token"))

    ok = serializers.BooleanField(read_only=True)

    def validate_new_password(self, new_password):
        password_validation.validate_password(new_password)
        return new_password

    def validate(self, attrs):
        token = attrs["token"]
        user_id = attrs["user"]

        try:
            user = models.User.objects.get(pk=user_id)
        except models.User.DoesNotExist:
            raise exceptions.ValidationError(_("Malformed password reset token"), 'invalid_token')

        if not tokens.password_reset_token.check_token(user, token):
            raise exceptions.ValidationError(_("Malformed password reset token"), 'invalid_token')

        return {**attrs, 'user': user}

    def create(self, validated_data):
        user = validated_data.pop("user")
        new_password = validated_data.pop("new_password")
        user.set_password(new_password)
        jwt.blacklist_user_tokens(user)
        user.save()
        return {'ok': True}


class CookieTokenObtainPairSerializer(jwt_serializers.TokenObtainPairSerializer):
    username_field = get_user_model().USERNAME_FIELD

    default_error_messages = {'no_active_account': _('No active account found with the given credentials')}

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.fields[self.username_field] = serializers.CharField(write_only=True)
        self.fields['password'] = PasswordField(write_only=True)
        self.fields['otp_auth_token'] = serializers.CharField(read_only=True, default=None)

    access = serializers.CharField(read_only=True, default=None)
    refresh = serializers.CharField(read_only=True, default=None)

    def validate(self, attrs):
        try:
            data = super().validate(attrs)
        except exceptions.AuthenticationFailed as e:
            raise exceptions.ValidationError(e.detail)

        return data

    def create(self, validated_data):
        if self.user.otp_enabled and self.user.otp_verified:
            return {"otp_auth_token": str(generate_otp_auth_token(self.user))}

        return validated_data


class CookieTokenRefreshSerializer(jwt_serializers.TokenRefreshSerializer):
    refresh = serializers.CharField(required=False)
    access = serializers.CharField(read_only=True)

    default_error_messages = {
        'invalid_token': _('No valid token found in cookie \'refresh_token\' or field \'refresh\''),
    }

    def validate(self, attrs):
        request = self.context['request']
        raw_token = request.COOKIES.get(settings.REFRESH_TOKEN_COOKIE) or attrs.get('refresh')

        if not raw_token:
            self.fail('invalid_token')

        try:
            refresh = jwt_tokens.RefreshToken(raw_token)
        except (jwt_exceptions.InvalidToken, jwt_exceptions.TokenError):
            self.fail('invalid_token')

        if jwt_api_settings.ROTATE_REFRESH_TOKENS:
            if jwt_api_settings.BLACKLIST_AFTER_ROTATION:
                try:
                    refresh.blacklist()
                except AttributeError:
                    pass

            user = get_user_model().objects.get(id=refresh[jwt_api_settings.USER_ID_CLAIM])
            new_refresh = jwt_tokens.RefreshToken.for_user(user)

            return {'access': str(new_refresh.access_token), 'refresh': str(new_refresh)}

        return {'access': str(refresh.access_token)}


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField(required=False)
    ok = serializers.BooleanField(read_only=True)

    default_error_messages = {
        'invalid_token': _('No valid token found in cookie \'refresh_token\' or field \'refresh\''),
    }

    def validate(self, attrs):
        request = self.context['request']
        raw_token = request.COOKIES.get(settings.REFRESH_TOKEN_LOGOUT_COOKIE) or attrs.get('refresh')

        if not raw_token:
            self.fail('invalid_token')

        try:
            refresh = jwt_tokens.RefreshToken(raw_token)
        except (jwt_exceptions.InvalidToken, jwt_exceptions.TokenError):
            self.fail('invalid_token')

        return {'refresh': refresh}

    def create(self, validated_data):
        refresh = validated_data.pop('refresh')
        refresh.blacklist()
        return {'ok': True}


@context_user_required
class GenerateOTPSerializer(serializers.Serializer):
    base32 = serializers.CharField(read_only=True)
    otpauth_url = serializers.CharField(read_only=True)

    def create(self, validated_data):
        otp_base32, otp_auth_url = otp_services.generate_otp(self.context_user)
        return {'base32': otp_base32, 'otpauth_url': otp_auth_url}


@context_user_required
class VerifyOTPSerializer(serializers.Serializer):
    otp_verified = serializers.BooleanField(read_only=True)
    otp_token = serializers.CharField(write_only=True)

    def create(self, validated_data):
        otp_services.verify_otp(self.context_user, validated_data.get("otp_token", ""))
        return {'otp_verified': True}


class ValidateOTPSerializer(serializers.Serializer):
    user: models.User

    otp_token = serializers.CharField(write_only=True)
    otp_auth_token = serializers.CharField(required=False, write_only=True)
    access = serializers.CharField(read_only=True)
    refresh = serializers.CharField(read_only=True)

    default_error_messages = {
        'invalid_token': _(f'No valid token found in cookie \'{settings.OTP_AUTH_TOKEN_COOKIE}\''),
    }

    def validate(self, attrs):
        request = self.context['request']

        if not (
            raw_otp_auth_token := request.COOKIES.get(settings.OTP_AUTH_TOKEN_COOKIE) or attrs.get('otp_auth_token')
        ):
            self.fail('invalid_token')

        try:
            otp_auth_token = jwt_tokens.AccessToken(raw_otp_auth_token)
        except (jwt_exceptions.InvalidToken, jwt_exceptions.TokenError):
            self.fail('invalid_token')

        if not (user_id := otp_auth_token.get("user_id")):
            self.fail('invalid_token')

        try:
            self.user = models.User.objects.get(id=user_id)
        except models.User.DoesNotExist:
            self.fail('invalid_token')

        otp_services.validate_otp(self.user, attrs.get("otp_token", ""))

        return attrs

    def create(self, validated_data):
        refresh = RefreshToken.for_user(self.user)
        return {"refresh": str(refresh), "access": str(refresh.access_token)}


@context_user_required
class DisableOTPSerializer(serializers.Serializer):
    ok = serializers.BooleanField(read_only=True)

    def create(self, validated_data):
        otp_services.disable_otp(self.context_user)
        return {'ok': True}
