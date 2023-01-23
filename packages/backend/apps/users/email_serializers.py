from rest_framework import serializers


class AccountActivationEmailSerializer(serializers.Serializer):
    user_id = serializers.CharField()
    token = serializers.CharField()


class PasswordResetEmailSerializer(serializers.Serializer):
    user_id = serializers.CharField()
    token = serializers.CharField()
