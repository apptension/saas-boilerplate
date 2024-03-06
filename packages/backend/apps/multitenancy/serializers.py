from hashid_field import rest as hidrest
from rest_framework import serializers, exceptions
from django.contrib.auth import get_user_model
from django.contrib.auth.models import BaseUserManager
from django.utils.translation import gettext_lazy as _
from django.db.models import Q

from common.graphql.field_conversions import TextChoicesFieldType
from . import models
from .constants import TenantType, TenantUserRole
from .services.membership import create_tenant_membership
from .tokens import tenant_invitation_token


class TenantSerializer(serializers.ModelSerializer):
    id = hidrest.HashidSerializerCharField(source_field="multitenancy.Tenant.id", read_only=True)

    def create(self, validated_data):
        validated_data["creator"] = self.context["request"].user
        validated_data["type"] = TenantType.ORGANIZATION
        tenant = super().create(validated_data)
        create_tenant_membership(
            user=validated_data["creator"], tenant=tenant, role=TenantUserRole.OWNER, is_accepted=True
        )
        return tenant

    class Meta:
        model = models.Tenant
        fields = (
            "id",
            "name",
        )


class TenantInvitationActionSerializer(serializers.Serializer):
    id = hidrest.HashidSerializerCharField(source_field="multitenancy.TenantMembership.id", write_only=True)
    token = serializers.CharField(write_only=True, help_text=_("Token"))
    ok = serializers.BooleanField(read_only=True)

    def validate(self, attrs):
        membership_id = attrs["id"]
        user = self.context["request"].user
        membership = models.TenantMembership.objects.get_not_accepted().filter(pk=membership_id, user=user).first()

        if not membership:
            raise exceptions.NotFound("Invitation not found.")

        if not tenant_invitation_token.check_token(user.email, attrs["token"], membership):
            raise exceptions.ValidationError(_("Malformed tenant invitation token"))

        return attrs


class AcceptTenantInvitationSerializer(TenantInvitationActionSerializer):
    def create(self, validated_data):
        membership_id = validated_data["id"]
        user = self.context["request"].user
        models.TenantMembership.objects.get_not_accepted().filter(pk=membership_id, user=user).update(is_accepted=True)
        return {"ok": True}


class DeclineTenantInvitationSerializer(TenantInvitationActionSerializer):
    def create(self, validated_data):
        membership_id = validated_data["id"]
        user = self.context["request"].user
        models.TenantMembership.objects.get_not_accepted().filter(pk=membership_id, user=user).delete()
        return {"ok": True}


class CreateTenantInvitationSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    role = TextChoicesFieldType(choices=TenantUserRole.choices, choices_class=TenantUserRole)
    tenant_id = serializers.CharField()
    ok = serializers.BooleanField(read_only=True)

    def validate(self, attrs):
        email = BaseUserManager.normalize_email(attrs["email"])
        tenant = self.context["request"].tenant
        if (
            models.TenantMembership.objects.get_all()
            .filter(Q(user__email=email, tenant=tenant) | Q(invitee_email_address=email, tenant=tenant))
            .exists()
        ):
            raise serializers.ValidationError(_("Invitation already exists"))
        return super().validate(attrs)

    def create(self, validated_data):
        email = BaseUserManager.normalize_email(validated_data["email"])
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

        create_tenant_membership(**tenant_membership_data)

        return {"ok": True, **validated_data}
