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

from . import models, tokens, jwt, notifications
from .services.users import get_role_names

UPLOADED_AVATAR_SIZE_LIMIT = 1 * 1024 * 1024


class UserProfileSerializer(serializers.ModelSerializer):
    id = rest.HashidSerializerCharField(source_field="users.User.id", source="user.id", read_only=True)
    email = serializers.CharField(source="user.email", read_only=True)
    roles = serializers.SerializerMethodField()
    avatar = serializers.FileField(required=False)

    class Meta:
        model = models.UserProfile
        fields = ("id", "first_name", "last_name", "email", "roles", "avatar")

    def validate(self, attrs):
        avatar = attrs.get('avatar')

        if avatar and avatar.size > UPLOADED_AVATAR_SIZE_LIMIT:
            raise exceptions.ValidationError({"avatar": _("Too large file")}, 'too_large')

        return attrs

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

    def update(self, instance, validated_data):
        pass

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

    def update(self, instance, validated_data):
        pass

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

    def update(self, instance, validated_data):
        pass

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

    access = serializers.CharField(read_only=True)
    refresh = serializers.CharField(read_only=True)

    def validate(self, attrs):
        try:
            data = super().validate(attrs)
        except exceptions.AuthenticationFailed as e:
            raise exceptions.ValidationError(e.detail)

        return data

    def create(self, validated_data):
        return validated_data


class CookieTokenRefreshSerializer(jwt_serializers.TokenRefreshSerializer):
    refresh = serializers.CharField(read_only=True)
    access = serializers.CharField(read_only=True)

    def validate(self, attrs):
        request = self.context['request']
        raw_token = request.COOKIES.get(settings.REFRESH_TOKEN_COOKIE)

        if not raw_token:
            raise serializers.ValidationError(_('No valid token found in cookie \'refresh_token\''))

        try:
            refresh = jwt_tokens.RefreshToken(raw_token)
        except (jwt_exceptions.InvalidToken, jwt_exceptions.TokenError):
            raise serializers.ValidationError(_('No valid token found in cookie \'refresh_token\''))

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
    ok = serializers.BooleanField(read_only=True)

    def validate(self, attrs):
        request = self.context['request']
        raw_token = request.COOKIES.get(settings.REFRESH_TOKEN_LOGOUT_COOKIE)

        if not raw_token:
            raise serializers.ValidationError(_('No valid token found in cookie \'refresh_token\''))

        try:
            refresh = jwt_tokens.RefreshToken(raw_token)
        except (jwt_exceptions.InvalidToken, jwt_exceptions.TokenError):
            raise serializers.ValidationError(_('No valid token found in cookie \'refresh_token\''))

        return {'refresh': refresh}

    def create(self, validated_data):
        refresh = validated_data.pop('refresh')
        refresh.blacklist()
        return {'ok': True}
