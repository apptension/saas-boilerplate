from hashid_field import rest as hidrest
from rest_framework import serializers, exceptions
from django.contrib.auth import get_user_model
from django.contrib.auth.models import BaseUserManager
from django.utils.translation import gettext_lazy as _
from django.db.models import Q
from django.utils import timezone
from graphql_relay import to_global_id, from_global_id

from common.graphql.field_conversions import TextChoicesFieldType
from . import models, notifications
from .constants import TenantType, TenantUserRole, SystemRoleType
from .services.membership import create_tenant_membership
from .tokens import tenant_invitation_token


def decode_role_id(role_id: str) -> str:
    """
    Decode a role ID that could be either a GraphQL relay ID or a hashid.
    Returns the hashid format.
    """
    # Check if it's a GraphQL relay ID (base64 encoded)
    try:
        type_name, decoded_id = from_global_id(role_id)
        if type_name == "OrganizationRoleType":
            return decoded_id
    except Exception:
        pass
    # Return as-is if not a relay ID (assume it's already a hashid)
    return role_id


class TenantSerializer(serializers.ModelSerializer):
    id = hidrest.HashidSerializerCharField(source_field="multitenancy.Tenant.id", read_only=True)

    def create(self, validated_data):
        from .permissions import create_system_roles_for_tenant

        validated_data["creator"] = self.context["request"].user
        validated_data["type"] = TenantType.ORGANIZATION
        tenant = super().create(validated_data)

        # Create membership for the creator
        membership = create_tenant_membership(
            user=validated_data["creator"], tenant=tenant, role=TenantUserRole.OWNER, is_accepted=True
        )

        # Create system roles (OWNER, ADMIN, MEMBER) for the new tenant
        system_roles = create_system_roles_for_tenant(tenant)

        # Assign the OWNER role to the creator's membership
        owner_role = next((r for r in system_roles if r.system_role_type == SystemRoleType.OWNER), None)
        if owner_role:
            models.TenantMembershipRole.objects.create(
                membership=membership,
                role=owner_role,
                assigned_by=validated_data["creator"],
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

    Supports both legacy role field and new organization_role_ids for RBAC.

    SECURITY:
    - Validates that the requesting user has 'members.invite' permission
    - Prevents assigning owner roles unless the inviter is an owner
    - Validates all role IDs belong to the tenant
    - Ensures users can only assign roles with permissions they also have
    """

    # Input fields (write_only)
    email = serializers.EmailField(required=True, write_only=True)
    role = TextChoicesFieldType(
        choices=TenantUserRole.choices, choices_class=TenantUserRole, required=False, write_only=True
    )
    organization_role_ids = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        write_only=True,
        help_text=_("List of organization role IDs to assign to the invited member"),
    )
    tenant_id = serializers.CharField(write_only=True)

    # Output fields (read_only)
    ok = serializers.BooleanField(read_only=True)

    def validate(self, attrs):
        """
        Validate the invitation data.

        Note: Permission checks (members.invite) are handled at the mutation level
        via @permission_classes(policies.IsTenantOwnerAccess) on TenantOwnerMutation.
        """
        email = BaseUserManager.normalize_email(attrs["email"])
        request = self.context.get("request")
        tenant = getattr(request, "tenant", None)

        if not tenant:
            raise serializers.ValidationError(_("Tenant is required."))

        if tenant.type == TenantType.DEFAULT:
            raise serializers.ValidationError(_("Invitation for personal tenant cannot be created."))

        if (
            models.TenantMembership.objects.get_all()
            .filter(Q(user__email=email, tenant=tenant) | Q(invitee_email_address=email, tenant=tenant))
            .exists()
        ):
            raise serializers.ValidationError(_("Invitation already exists"))

        # Validate and decode organization role IDs if provided
        org_role_ids = attrs.get("organization_role_ids", [])
        if org_role_ids:
            valid_roles = {str(r.id): r for r in models.OrganizationRole.objects.filter(tenant=tenant)}
            decoded_role_ids = []

            # Check if inviter is an owner (needed for owner role assignment validation)
            inviter = request.user if request else None
            is_inviter_owner = False
            if inviter:
                inviter_membership = models.TenantMembership.objects.filter(
                    user=inviter, tenant=tenant, is_accepted=True
                ).first()
                is_inviter_owner = inviter_membership and (
                    inviter_membership.role == TenantUserRole.OWNER
                    or models.TenantMembershipRole.objects.filter(
                        membership=inviter_membership, role__system_role_type=SystemRoleType.OWNER
                    ).exists()
                )

            for role_id in org_role_ids:
                decoded_id = decode_role_id(role_id)

                # Ensure role belongs to this tenant
                if decoded_id not in valid_roles:
                    raise serializers.ValidationError(_(f"Invalid organization role ID: {role_id}"))

                # SECURITY: Only owners can invite with the Owner role
                role = valid_roles[decoded_id]
                if role.is_owner_role and not is_inviter_owner:
                    raise serializers.ValidationError(
                        _("Only organization owners can invite members with the Owner role.")
                    )

                decoded_role_ids.append(decoded_id)

            # Store decoded IDs and role objects for use in create()
            attrs["_decoded_role_ids"] = decoded_role_ids
            attrs["_valid_roles"] = valid_roles

        # Require either legacy role or organization_role_ids
        if not attrs.get("role") and not org_role_ids:
            raise serializers.ValidationError(_("Either 'role' or 'organization_role_ids' must be provided"))

        return super().validate(attrs)

    def create(self, validated_data):
        email = BaseUserManager.normalize_email(validated_data["email"])
        role = validated_data.get("role", TenantUserRole.MEMBER)  # Default to MEMBER for backward compatibility
        decoded_role_ids = validated_data.get("_decoded_role_ids", [])
        valid_roles = validated_data.get("_valid_roles", {})

        request = self.context.get("request")
        tenant = getattr(request, "tenant", None)
        creator = getattr(request, "user", None)

        User = get_user_model()

        tenant_membership_data = {
            "role": role,
            "tenant": tenant,
            "creator": creator,
        }
        try:
            tenant_membership_data["user"] = User.objects.get(email=email)
        except User.DoesNotExist:
            tenant_membership_data["invitee_email_address"] = email

        membership = create_tenant_membership(**tenant_membership_data)

        # Assign organization roles if provided (using decoded hashid IDs)
        if decoded_role_ids:
            for role_id in decoded_role_ids:
                org_role = valid_roles.get(role_id)
                if not org_role:
                    org_role = models.OrganizationRole.objects.filter(id=role_id, tenant=tenant).first()
                    if not org_role:
                        continue  # Skip invalid roles

                models.TenantMembershipRole.objects.get_or_create(
                    membership=membership, role=org_role, defaults={"assigned_by": creator}
                )

        # Return only the response fields (ok is read_only)
        return {"ok": True}


class ResendTenantInvitationSerializer(serializers.Serializer):
    """
    Serializer for resending an invitation email to a pending membership.

    This serializer finds an existing not-accepted membership and resends the invitation email
    with a fresh token.
    """

    id = hidrest.HashidSerializerCharField(source_field="multitenancy.TenantMembership.id", write_only=True)
    tenant_id = serializers.CharField(write_only=True)
    ok = serializers.BooleanField(read_only=True)

    def validate(self, attrs):
        membership_id = attrs["id"]
        tenant = self.context["request"].tenant

        membership = models.TenantMembership.objects.get_not_accepted().filter(pk=membership_id, tenant=tenant).first()

        if not membership:
            raise exceptions.NotFound(_("Pending invitation not found."))

        attrs["membership"] = membership
        return super().validate(attrs)

    def create(self, validated_data):
        from .notifications import TenantInvitationEmail, send_tenant_invitation_notification

        membership = validated_data["membership"]
        email = membership.user.email if membership.user else membership.invitee_email_address

        token = tenant_invitation_token.make_token(user_email=email, tenant_membership=membership)
        global_tenant_membership_id = to_global_id("TenantMembershipType", membership.id)

        TenantInvitationEmail(
            to=email,
            data={"tenant_membership_id": global_tenant_membership_id, "token": token},
            user=membership.user,
        ).send()

        if membership.user:
            send_tenant_invitation_notification(membership, global_tenant_membership_id, token)

        return {"ok": True}


class UpdateTenantMembershipSerializer(serializers.ModelSerializer):
    """
    Serializer for updating a tenant membership.

    This serializer is designed to handle the update of a membership within a tenant.

    SECURITY:
    - Prevents demoting the last owner to a non-owner role
    - Checks both legacy roles AND RBAC owner roles for complete protection
    - Only owners can modify owner memberships
    """

    id = hidrest.HashidSerializerCharField(source_field="multitenancy.TenantMembership.id", write_only=True)
    role = TextChoicesFieldType(choices=TenantUserRole.choices, choices_class=TenantUserRole)

    def validate(self, attrs):
        request = self.context.get("request")
        tenant = getattr(request, "tenant", None)
        acting_user = getattr(request, "user", None)

        membership = models.TenantMembership.objects.get_all().filter(pk=attrs["id"]).first()
        if not membership:
            raise exceptions.NotFound("Membership not found.")

        if tenant and tenant.type == TenantType.DEFAULT:
            raise exceptions.ValidationError("Cannot change roles in a personal tenant.")

        new_role = attrs.get("role")

        if acting_user and membership.user_id == acting_user.id:
            acting_membership = models.TenantMembership.objects.filter(
                user=acting_user, tenant=tenant, is_accepted=True
            ).first()
            is_acting_user_owner = acting_membership and (
                acting_membership.role == TenantUserRole.OWNER
                or models.TenantMembershipRole.objects.filter(
                    membership=acting_membership, role__system_role_type=SystemRoleType.OWNER
                ).exists()
            )
            if not is_acting_user_owner:
                raise exceptions.PermissionDenied("permission_denied")

        # Check if target is currently an owner (legacy OR RBAC)
        is_currently_legacy_owner = membership.role == TenantUserRole.OWNER
        is_currently_rbac_owner = models.TenantMembershipRole.objects.filter(
            membership=membership, role__system_role_type=SystemRoleType.OWNER
        ).exists()
        is_currently_owner = is_currently_legacy_owner or is_currently_rbac_owner

        # Check if acting user is an owner
        if acting_user and tenant:
            acting_membership = models.TenantMembership.objects.filter(
                user=acting_user, tenant=tenant, is_accepted=True
            ).first()
            is_acting_user_legacy_owner = acting_membership and acting_membership.role == TenantUserRole.OWNER
            is_acting_user_rbac_owner = (
                acting_membership
                and models.TenantMembershipRole.objects.filter(
                    membership=acting_membership, role__system_role_type=SystemRoleType.OWNER
                ).exists()
            )
            is_acting_user_owner = is_acting_user_legacy_owner or is_acting_user_rbac_owner

            # SECURITY: Only owners can modify owner memberships
            if is_currently_owner and not is_acting_user_owner:
                raise exceptions.PermissionDenied("Only owners can modify the role of other owners.")

        # SECURITY: Prevent demoting the last owner
        if is_currently_owner and new_role != TenantUserRole.OWNER:
            # Count legacy owners
            legacy_owner_count = models.TenantMembership.objects.filter(
                tenant=tenant, role=TenantUserRole.OWNER, is_accepted=True
            ).count()

            # Count RBAC owners
            rbac_owner_count = models.TenantMembershipRole.objects.filter(
                membership__tenant=tenant, role__system_role_type=SystemRoleType.OWNER, membership__is_accepted=True
            ).count()

            # Determine if this membership will remain as an RBAC owner
            will_remain_rbac_owner = is_currently_rbac_owner

            # Calculate remaining owners after this change
            remaining_owners = legacy_owner_count - 1 if is_currently_legacy_owner else legacy_owner_count

            # Add RBAC owners (minus this one if applicable)
            if will_remain_rbac_owner:
                remaining_owners += rbac_owner_count
            else:
                remaining_owners += rbac_owner_count - (1 if is_currently_rbac_owner else 0)

            if remaining_owners < 1:
                raise exceptions.ValidationError("There must be at least one owner in the organization.")

        return super().validate(attrs)

    class Meta:
        model = models.TenantMembership
        fields = (
            "id",
            "role",
        )
