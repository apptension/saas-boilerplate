from hashid_field import rest as hidrest
from rest_framework import serializers

from . import models
from .constants import TenantType
from .services.membership import create_tenant_membership


class TenantSerializer(serializers.ModelSerializer):
    id = hidrest.HashidSerializerCharField(source_field="multitenancy.Tenant.id", read_only=True)

    def create(self, validated_data):
        validated_data["creator"] = self.context['request'].user
        validated_data["type"] = TenantType.ORGANIZATION
        tenant = super().create(validated_data)
        create_tenant_membership(user=validated_data["creator"], tenant=tenant)
        return tenant

    class Meta:
        model = models.Tenant
        fields = (
            'id',
            'name',
        )
