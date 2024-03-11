from rest_framework import serializers


class TenantInvitationEmailSerializer(serializers.Serializer):
    token = serializers.CharField()
    tenant_membership_id = serializers.CharField()
