from hashid_field import rest as hidrest
from rest_framework import serializers, exceptions
from django.contrib.auth import get_user_model
from django.db.utils import IntegrityError
from django.utils.translation import gettext_lazy as _

from common.graphql.field_conversions import TextChoicesFieldType
from . import models
from .constants import TenantType, TenantUserRole
from .services.membership import create_tenant_membership


class TenantSerializer(serializers.ModelSerializer):
    id = hidrest.HashidSerializerCharField(source_field="multitenancy.Tenant.id", read_only=True)

    def create(self, validated_data):
        validated_data["creator"] = self.context["request"].user
        validated_data["type"] = TenantType.ORGANIZATION
        tenant = super().create(validated_data)
        create_tenant_membership(
            user=validated_data["creator"],
            tenant=tenant,
            role=TenantUserRole.OWNER,
            is_accepted=True
        )
        return tenant

    class Meta:
        model = models.Tenant
        fields = (
            "id",
            "name",
        )


class AcceptTenantInvitationSerializer(serializers.Serializer):
    id = hidrest.HashidSerializerCharField(source_field="multitenancy.Tenant.id", write_only=True)
    ok = serializers.BooleanField(read_only=True)

    def validate(self, attrs):
        tenant_id = attrs["id"]
        user = self.context["request"].user
        if not models.TenantMembership.objects.get_not_accepted().filter(tenant__pk=tenant_id, user=user).exists():
            raise exceptions.NotFound("Invitation not found.")
        return attrs

    def create(self, validated_data):
        tenant_id = validated_data["id"]
        user = self.context["request"].user
        models.TenantMembership.objects.get_not_accepted().filter(tenant__pk=tenant_id, user=user).update(
            is_accepted=True
        )
        return {"ok": True}


class DeclineTenantInvitationSerializer(serializers.Serializer):
    id = hidrest.HashidSerializerCharField(source_field="multitenancy.Tenant.id", write_only=True)
    ok = serializers.BooleanField(read_only=True)

    def validate(self, attrs):
        tenant_id = attrs["id"]
        user = self.context["request"].user
        if not models.TenantMembership.objects.get_not_accepted().filter(tenant__pk=tenant_id, user=user).exists():
            raise exceptions.NotFound("Invitation not found.")
        return attrs

    def create(self, validated_data):
        tenant_id = validated_data["id"]
        user = self.context["request"].user
        models.TenantMembership.objects.get_not_accepted().filter(tenant__pk=tenant_id, user=user).delete()
        return {"ok": True}


class CreateTenantInvitationSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    role = TextChoicesFieldType(choices=TenantUserRole.choices, choices_class=TenantUserRole)
    tenant_id = serializers.CharField()
    ok = serializers.BooleanField(read_only=True)

    def create(self, validated_data):
        email = validated_data["email"]
        role = validated_data["role"]
        tenant = self.context["request"].tenant
        User = get_user_model()
        tenant_membership_data = {
            "role": role,
            "tenant": tenant,
        }
        try:
            tenant_membership_data["user"] = User.objects.get(email=email)
        except User.DoesNotExist:
            tenant_membership_data["invitee_email_address"] = email

        try:
            models.TenantMembership.objects.create(**tenant_membership_data)
        except IntegrityError:
            raise serializers.ValidationError(_("Invitation already exists"))

        return {"ok": True, **validated_data}
