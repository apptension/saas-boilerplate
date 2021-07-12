from django.conf import settings
from django.contrib import auth as dj_auth
from django.contrib.auth import password_validation, get_user_model
from django.contrib.auth.models import update_last_login
from django.utils.translation import gettext as _
from hashid_field import rest
from rest_framework import exceptions, serializers, validators
from rest_framework_simplejwt import serializers as jwt_serializers, tokens as jwt_tokens, exceptions as jwt_exceptions
from rest_framework_simplejwt.settings import api_settings as jwt_api_settings

from . import models, tokens, jwt, notifications

UPLOADED_AVATAR_SIZE_LIMIT = 1 * 1024 * 1024


class UserProfileSerializer(serializers.ModelSerializer):
    id = rest.HashidSerializerCharField(source_field="users.User.id", source="user.id", read_only=True)
    email = serializers.CharField(source="user.email", read_only=True)
    roles = serializers.SerializerMethodField()

    class Meta:
        model = models.UserProfile
        fields = ("id", "first_name", "last_name", "email", "roles", "avatar")

    def validate(self, attrs):
        avatar = attrs.get('avatar')

        if avatar and avatar.size > UPLOADED_AVATAR_SIZE_LIMIT:
            raise exceptions.ValidationError({"avatar": _("Too large file")}, 'too_large')

        return attrs

    def get_roles(self, obj):
        return [group.name for group in obj.user.groups.all()]


class UserSignupSerializer(serializers.ModelSerializer):
    id = rest.HashidSerializerCharField(source_field="users.User.id", read_only=True)
    email = serializers.EmailField(
        validators=[validators.UniqueValidator(queryset=dj_auth.get_user_model().objects.all())],
    )
    access = serializers.CharField(read_only=True)
    refresh = serializers.CharField(read_only=True)

    class Meta:
        model = dj_auth.get_user_model()
        fields = ("id", "email", "password", "access", "refresh")
        extra_kwargs = {"password": {"write_only": True}}

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
        return user


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

        return {}


class PasswordResetConfirmationSerializer(serializers.Serializer):
    # user field is a CharField by design to hide the information whether the user exists or not
    user = serializers.CharField(write_only=True)

    new_password = serializers.CharField(write_only=True, help_text=_("New password"))
    token = serializers.CharField(write_only=True, help_text=_("Token"))

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
        return user


class CookieTokenObtainPairSerializer(jwt_serializers.TokenObtainPairSerializer):
    def validate(self, attrs):
        try:
            data = super().validate(attrs)
        except exceptions.AuthenticationFailed as e:
            raise exceptions.ValidationError(e.detail)

        return data


class CookieTokenRefreshSerializer(jwt_serializers.TokenRefreshSerializer):
    refresh = None

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
