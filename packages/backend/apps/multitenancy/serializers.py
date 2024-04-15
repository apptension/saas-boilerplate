from hashid_field import rest as hidrest
from rest_framework import serializers, exceptions
from django.contrib.auth import get_user_model
from django.contrib.auth.models import BaseUserManager
from django.utils.translation import gettext_lazy as _
from django.db.models import Q
from django.utils import timezone
from graphql_relay import to_global_id

from common.graphql.field_conversions import TextChoicesFieldType
from . import models, notifications
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
        fields = ("id", "name", "billing_email")


class TenantInvitationActionSerializer(serializers.Serializer):
    """
    Parent serializer for Accept and Decline serializers.

    It validates if invitation exists and if token is correct before proceeding with invitation action.
    """

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
    """
    Updates not accepted invitation membership object to be accepted one.
    """

    def create(self, validated_data):
        membership_id = validated_data["id"]
        user = self.context["request"].user
        membership = models.TenantMembership.objects.get_not_accepted().filter(pk=membership_id, user=user).first()
        if membership:
            models.TenantMembership.objects.get_not_accepted().filter(pk=membership_id, user=user).update(
                is_accepted=True, invitation_accepted_at=timezone.now()
            )
            notifications.send_accepted_tenant_invitation_notification(
                membership, to_global_id("TenantMembershipType", membership_id)
            )
        return {"ok": True}


class DeclineTenantInvitationSerializer(TenantInvitationActionSerializer):
    """
    Removes membership object if user decides to decline invitation.
    """

    def create(self, validated_data):
        membership_id = validated_data["id"]
        user = self.context["request"].user
        membership = models.TenantMembership.objects.get_not_accepted().filter(pk=membership_id, user=user).first()
        if membership:
            membership.delete()
            notifications.send_declined_tenant_invitation_notification(
                membership, to_global_id("TenantMembershipType", membership_id)
            )
        return {"ok": True}


class CreateTenantInvitationSerializer(serializers.Serializer):
    """
    Serializer for creating a not-yet-accepted membership invitation.

    This serializer is designed to handle the creation of a membership invitation within a tenant.
    It validates the input data, ensuring that the connection between the specified user or invitee email
    and the tenant does not already exist. If the connection is valid, it creates a new not accepted membership object.
    """

    email = serializers.EmailField(required=True)
    role = TextChoicesFieldType(choices=TenantUserRole.choices, choices_class=TenantUserRole)
    tenant_id = serializers.CharField()
    ok = serializers.BooleanField(read_only=True)

    def validate(self, attrs):
        email = BaseUserManager.normalize_email(attrs["email"])
        tenant = self.context["request"].tenant
        if tenant.type == TenantType.DEFAULT:
            raise serializers.ValidationError(_("Invitation for personal tenant cannot be created."))
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
            "creator": self.context["request"].user,
        }
        try:
            tenant_membership_data["user"] = User.objects.get(email=email)
        except User.DoesNotExist:
            tenant_membership_data["invitee_email_address"] = email

        create_tenant_membership(**tenant_membership_data)

        return {"ok": True, **validated_data}


class UpdateTenantMembershipSerializer(serializers.ModelSerializer):
    """
    Serializer for update a tenant membership.

    This serializer is designed to handle the update of a membership within a tenant.
    """

    id = hidrest.HashidSerializerCharField(source_field="multitenancy.TenantMembership.id", write_only=True)
    role = TextChoicesFieldType(choices=TenantUserRole.choices, choices_class=TenantUserRole)

    def validate(self, attrs):
        tenant = self.context["request"].tenant
        actual_value = models.TenantMembership.objects.get_all().filter(pk=attrs["id"]).first()
        if (
            actual_value
            and actual_value.role == TenantUserRole.OWNER
            and attrs["role"] != TenantUserRole.OWNER
            and tenant.owners_count == 1
        ):
            raise exceptions.ValidationError("There must be at least one owner in the Tenant.")
        return super().validate(attrs)

    class Meta:
        model = models.TenantMembership
        fields = (
            "id",
            "role",
        )
