from django.contrib import auth as dj_auth
from django.contrib.auth import password_validation
from hashid_field import rest
from rest_framework import exceptions
from rest_framework import serializers
from rest_framework import validators
from django.utils.translation import gettext as _

from . import models, tokens, utils


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.UserProfile
        fields = ("first_name",)


class UserSignupSerializer(serializers.ModelSerializer):
    id = rest.HashidSerializerCharField(source_field="users.User.id", read_only=True)
    email = serializers.EmailField(
        validators=[validators.UniqueValidator(queryset=dj_auth.get_user_model().objects.all())],
    )
    profile = UserProfileSerializer(required=False)

    class Meta:
        model = dj_auth.get_user_model()
        fields = ("id", "email", "password", "jwt_token", "profile")
        read_only_fields = ("jwt_token",)
        extra_kwargs = {"password": {"write_only": True}}

    def validate_password(self, password):
        password_validation.validate_password(password)
        return password

    def create(self, validated_data):
        user = dj_auth.get_user_model().objects.create_user(validated_data["email"], validated_data["password"],)
        models.UserProfile.objects.create(user=user, **validated_data.pop("profile", {}))

        activation_token = tokens.account_activation_token.make_token(user)
        utils.user_notification_impl("account_activation", user=user, token=activation_token)

        return user


class UserAccountConfirmationSerializer(serializers.Serializer):
    user = serializers.PrimaryKeyRelatedField(
        queryset=models.User.objects.all(), pk_field=rest.HashidSerializerCharField(), write_only=True,
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

    jwt_token = serializers.CharField(read_only=True)

    def validate_new_password(self, new_password):
        password_validation.validate_password(new_password)
        return new_password

    def validate(self, attrs):
        old_password = attrs["old_password"]

        user = attrs["user"]
        if not user.check_password(old_password):
            raise exceptions.ValidationError({"old_password": _("Wrong old password")})

        return attrs

    def update(self, instance, validated_data):
        pass

    def create(self, validated_data):
        user = validated_data.pop("user")
        new_password = validated_data.pop("new_password")
        user.set_password(new_password)
        user.save()

        return user


class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField(write_only=True, help_text=_("User e-mail"))

    def create(self, validated_data):
        try:
            user = dj_auth.get_user_model().objects.get(email=validated_data["email"])
        except dj_auth.get_user_model().DoesNotExist:
            raise exceptions.NotFound(_("User not found"))

        utils.user_notification_impl(
            "password_reset", user=user, token=tokens.password_reset_token.make_token(user),
        )

        return user

    def update(self, instance, validated_data):
        pass


class PasswordResetConfirmationSerializer(serializers.Serializer):
    user = serializers.PrimaryKeyRelatedField(
        queryset=models.User.objects.all(), pk_field=rest.HashidSerializerCharField(), write_only=True,
    )

    new_password = serializers.CharField(write_only=True, help_text=_("New password"))
    token = serializers.CharField(write_only=True, help_text=_("Token"))
    jwt_token = serializers.CharField(read_only=True, help_text=_("JWT token"))

    def validate_new_password(self, new_password):
        password_validation.validate_password(new_password)
        return new_password

    def validate(self, attrs):
        token = attrs["token"]
        user = attrs["user"]

        if not tokens.password_reset_token.check_token(user, token):
            raise exceptions.ValidationError(_("Malformed password reset token"))

        return attrs

    def update(self, instance, validated_data):
        pass

    def create(self, validated_data):
        user = validated_data.pop("user")
        new_password = validated_data.pop("new_password")
        user.set_password(new_password)
        user.save()

        return user
