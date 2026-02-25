import graphene
from graphene import relay
from graphene.types.generic import GenericScalar
from graphql_relay import to_global_id, from_global_id
from graphene_django import DjangoObjectType
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.db import close_old_connections
from rest_framework.exceptions import PermissionDenied

from apps.users.services.users import get_user_from_resolver, get_user_avatar_url
from common.acl import policies
from common.graphql import mutations, exceptions
from common.graphql.acl.decorators import permission_classes, requires
from common.action_logging.decorators import action_logged
from common.action_logging.service import log_action, log_delete
from apps.finances.services import subscriptions
from apps.finances.serializers import CancelTenantActiveSubscriptionSerializer
from apps.sso.enforcement import filter_tenants_for_password_session
from . import models
from . import serializers
from .tokens import tenant_invitation_token
from .constants import (
    TenantUserRole,
    TenantType as ConstantsTenantType,
    ActionType,
    PermissionCategory,
    RoleColor,
    SystemRoleType,
)


TenantUserRoleType = graphene.Enum.from_enum(TenantUserRole)
PermissionCategoryType = graphene.Enum.from_enum(PermissionCategory)
RoleColorType = graphene.Enum.from_enum(RoleColor)
SystemRoleTypeEnum = graphene.Enum.from_enum(SystemRoleType)


# ============ RBAC Types ============


class PermissionType(DjangoObjectType):
    """GraphQL type for Permission model - available permissions in the system."""

    id = graphene.ID(required=True)
    category = graphene.String(description="Category for grouping (multitenancy or app-defined)")
    category_label = graphene.String(description="Display label for the category")
    category_description = graphene.String(description="Optional description (app-defined categories only)")

    class Meta:
        model = models.Permission
        interfaces = (relay.Node,)
        fields = (
            "id",
            "code",
            "name",
            "description",
            "category",
            "category_label",
            "category_description",
            "is_system",
            "sort_order",
        )

    def resolve_id(self, info):
        return to_global_id("PermissionType", self.id)

    def resolve_category(self, info):
        return self.category

    def resolve_category_label(self, info):
        from .permissions import get_category_display

        label, _ = get_category_display(self.category)
        return label

    def resolve_category_description(self, info):
        from .permissions import get_category_display

        _, description = get_category_display(self.category)
        return description


class PermissionConnection(graphene.Connection):
    class Meta:
        node = PermissionType


class OrganizationRoleType(DjangoObjectType):
    """GraphQL type for OrganizationRole - custom roles per tenant."""

    id = graphene.ID(required=True)
    color = RoleColorType()
    system_role_type = SystemRoleTypeEnum()
    is_system_role = graphene.Boolean()
    is_owner_role = graphene.Boolean()
    permissions = graphene.List(PermissionType)
    member_count = graphene.Int()

    class Meta:
        model = models.OrganizationRole
        interfaces = (relay.Node,)
        fields = (
            "id",
            "name",
            "description",
            "system_role_type",
            "color",
            "is_system_role",
            "is_owner_role",
            "permissions",
            "member_count",
            "created_at",
            "updated_at",
        )

    def resolve_id(self, info):
        return to_global_id("OrganizationRoleType", self.id)

    def resolve_is_system_role(self, info):
        return self.is_system_role

    def resolve_is_owner_role(self, info):
        return self.is_owner_role

    def resolve_permissions(self, info):
        return self.permissions.all()

    def resolve_member_count(self, info):
        return self.member_assignments.count()


class OrganizationRoleConnection(graphene.Connection):
    class Meta:
        node = OrganizationRoleType


class TenantMembershipRoleType(DjangoObjectType):
    """GraphQL type for TenantMembershipRole - role assignments for members."""

    id = graphene.ID(required=True)
    role = graphene.Field(OrganizationRoleType)

    class Meta:
        model = models.TenantMembershipRole
        interfaces = (relay.Node,)
        fields = (
            "id",
            "role",
            "assigned_at",
        )

    def resolve_id(self, info):
        return to_global_id("TenantMembershipRoleType", self.id)


class TenantMembershipType(DjangoObjectType):
    id = graphene.ID(required=True)
    invitation_accepted = graphene.Boolean()
    user_id = graphene.ID()
    invitee_email_address = graphene.String()
    invitation_token = graphene.String()
    first_name = graphene.String()
    last_name = graphene.String()
    user_email = graphene.String()
    avatar = graphene.String()
    role = TenantUserRoleType()
    # New RBAC fields
    organization_roles = graphene.List(OrganizationRoleType)
    effective_permissions = graphene.List(graphene.String)

    class Meta:
        model = models.TenantMembership
        fields = (
            "id",
            "role",
            "invitation_accepted",
            "user_id",
            "invitee_email_address",
            "invitation_token",
            "first_name",
            "last_name",
            "user_email",
            "avatar",
            "organization_roles",
            "effective_permissions",
        )
        interfaces = (relay.Node,)

    def resolve_id(self, info):
        return to_global_id("TenantMembershipType", self.id)

    @staticmethod
    def resolve_invitation_token(parent, info):
        user = get_user_from_resolver(info)
        if parent.user and user == parent.user and not parent.is_accepted:
            return tenant_invitation_token.make_token(user.email, parent)
        return None

    @staticmethod
    def resolve_invitation_accepted(parent, info):
        return parent.is_accepted

    @staticmethod
    def resolve_first_name(parent, info):
        return parent.user.profile.first_name if parent.user else None

    @staticmethod
    def resolve_last_name(parent, info):
        return parent.user.profile.last_name if parent.user else None

    @staticmethod
    def resolve_user_email(parent, info):
        return parent.user.email if parent.user else None

    @staticmethod
    def resolve_avatar(parent, info):
        return get_user_avatar_url(parent.user) if parent.user else None

    @staticmethod
    def resolve_user_id(parent, info):
        """Return the user ID as a GraphQL global ID."""
        if parent.user:
            return to_global_id("User", parent.user.id)
        return None

    @staticmethod
    def resolve_organization_roles(parent, info):
        """Get all organization roles assigned to this membership."""
        return [mr.role for mr in parent.membership_roles.select_related("role").all()]

    @staticmethod
    def resolve_effective_permissions(parent, info):
        """Get all effective permissions for this member (union of all role permissions)."""
        if not parent.user:
            return []
        permissions = models.get_user_permissions_for_tenant(parent.user, parent.tenant)
        return list(permissions)


class TenantType(DjangoObjectType):
    id = graphene.ID(required=True)
    name = graphene.String()
    slug = graphene.String()
    type = graphene.String()
    billing_email = graphene.String()
    action_logging_enabled = graphene.Boolean()
    membership = graphene.NonNull(of_type=TenantMembershipType)
    user_memberships = graphene.List(of_type=TenantMembershipType)

    class Meta:
        model = models.Tenant
        fields = (
            "id",
            "name",
            "slug",
            "billing_email",
            "type",
            "action_logging_enabled",
            "membership",
            "user_memberships",
        )
        interfaces = (relay.Node,)

    @staticmethod
    def resolve_membership(parent, info):
        user = get_user_from_resolver(info)
        return models.TenantMembership.objects.get_all().filter(user=user, tenant=parent).first()

    def resolve_id(self, info):
        return to_global_id("TenantType", self.id)

    @staticmethod
    def resolve_user_memberships(parent, info):
        """
        Resolve all memberships for this tenant.

        Permission: Requires 'members.view' permission via the new RBAC system.
        """
        user = get_user_from_resolver(info)
        if not user or not user.is_authenticated:
            return []

        # Check if user has members.view permission using new RBAC system
        if not models.user_has_permission(user, parent, "members.view"):
            return []

        return parent.user_memberships.get_all().filter(tenant=parent)


class TenantConnection(graphene.Connection):
    class Meta:
        node = TenantType


# ============ Action Log Types ============


class ActionLogType(DjangoObjectType):
    """GraphQL type for ActionLog model - audit trail of actions."""

    changes = GenericScalar()
    metadata = GenericScalar()

    class Meta:
        model = models.ActionLog
        interfaces = (relay.Node,)
        fields = "__all__"


class ActionLogConnection(graphene.Connection):
    """Connection class for paginated ActionLog lists."""

    class Meta:
        node = ActionLogType

    total_count = graphene.Int()

    def resolve_total_count(root, info, **kwargs):
        # For relay connections, the iterable contains the queryset
        if hasattr(root, "iterable"):
            return root.iterable.count()
        return 0


# ============ Mutations ============


class CreateTenantMutation(mutations.CreateModelMutation):
    class Meta:
        serializer_class = serializers.TenantSerializer
        edge_class = TenantConnection.Edge


@action_logged(entity_type="tenant", action_type=ActionType.UPDATE)
class UpdateTenantMutation(mutations.UpdateModelMutation):
    class Meta:
        serializer_class = serializers.TenantSerializer
        edge_class = TenantConnection.Edge

    @classmethod
    def get_object(cls, model_class, root, info, **input):
        return info.context.tenant


class DeleteTenantMutation(mutations.DeleteModelMutation):
    """
    Mutation to delete a tenant from the system.
    """

    class Meta:
        model = models.Tenant

    @classmethod
    def mutate_and_get_payload(cls, root, info, id, **kwargs):
        """
        Perform deletion of a tenant and subscription cancellation.

        Returns:
            DeleteTenantMutation: The mutation object with list of deleted_ids.

        Raises:
            GraphQlValidationError: If deletion encounters validation errors.
        """
        tenant = info.context.tenant

        if tenant.type == ConstantsTenantType.DEFAULT:
            raise exceptions.GraphQlValidationError("Cannot delete default type tenant.")

        with transaction.atomic():
            log_delete(
                tenant_id=tenant.pk,
                entity_type="tenant",
                instance=tenant,
                actor_user=info.context.user,
            )

            try:
                schedule = subscriptions.get_schedule(tenant)
                if schedule:
                    cancel_subscription_serializer = CancelTenantActiveSubscriptionSerializer(
                        instance=schedule, data={}
                    )
                    if cancel_subscription_serializer.is_valid():
                        cancel_subscription_serializer.save()
            except Exception as e:
                import logging

                logger = logging.getLogger(__name__)
                logger.warning(f"Failed to cancel subscription for tenant {tenant.pk} during deletion: {e}")

            tenant.delete()

        close_old_connections()

        return cls(deleted_ids=[id])


class CreateTenantInvitationMutation(mutations.SerializerMutation):
    ok = graphene.Boolean()

    class Meta:
        serializer_class = serializers.CreateTenantInvitationSerializer


class ResendTenantInvitationMutation(mutations.SerializerMutation):
    ok = graphene.Boolean()

    class Meta:
        serializer_class = serializers.ResendTenantInvitationSerializer

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        if "id" in input:
            _, input["id"] = from_global_id(input["id"])
        return super().mutate_and_get_payload(root, info, **input)


class DeleteTenantMembershipMutation(mutations.DeleteModelMutation):
    """
    Delete/remove a member from the organization.

    SECURITY:
    - Requires 'members.remove' permission to remove other members
    - Users can always remove themselves (leave organization)
    - Only owners can remove other owners
    - Cannot remove the last owner
    """

    class Input:
        id = graphene.String()
        tenant_id = graphene.String(required=True)

    class Meta:
        model = models.TenantMembership

    @classmethod
    def get_object(cls, id, tenant, **kwargs):
        model = cls._meta.model
        _, pk = from_global_id(id)
        return get_object_or_404(model.objects.get_all(), pk=pk, tenant=tenant)

    @classmethod
    def mutate_and_get_payload(cls, root, info, id, **kwargs):
        obj = cls.get_object(id, info.context.tenant)
        user = info.context.user
        tenant = info.context.tenant

        # Check if this is a self-removal (user removing themselves)
        # Note: obj.user can be None for pending invitations
        is_self_removal = obj.user is not None and obj.user == user

        # SECURITY CHECK 1: If not removing self, check members.remove permission
        if not is_self_removal and not models.user_has_permission(user, tenant, "members.remove"):
            raise PermissionDenied("You don't have permission to remove members.")

        # Get acting user's owner status
        acting_user_membership = models.TenantMembership.objects.filter(
            user=user, tenant=tenant, is_accepted=True
        ).first()
        is_acting_user_owner = acting_user_membership and (
            acting_user_membership.role == TenantUserRole.OWNER
            or models.TenantMembershipRole.objects.filter(
                membership=acting_user_membership, role__system_role_type=SystemRoleType.OWNER
            ).exists()
        )

        # Check if target is an owner
        target_is_owner = (
            obj.role == TenantUserRole.OWNER
            or models.TenantMembershipRole.objects.filter(
                membership=obj, role__system_role_type=SystemRoleType.OWNER
            ).exists()
        )

        # SECURITY CHECK 2: Only owners can remove other owners
        if target_is_owner and not is_self_removal and not is_acting_user_owner:
            raise PermissionDenied("Only organization owners can remove other owners.")

        # SECURITY CHECK 3: Cannot remove the last owner
        if target_is_owner:
            # Count owners (both legacy and RBAC)
            owner_count = models.TenantMembershipRole.objects.filter(
                membership__tenant=tenant, role__system_role_type=SystemRoleType.OWNER, membership__is_accepted=True
            ).count()

            legacy_owner_count = models.TenantMembership.objects.filter(
                tenant=tenant, role=TenantUserRole.OWNER, is_accepted=True
            ).count()

            total_owners = max(owner_count, legacy_owner_count)

            if total_owners <= 1:
                raise exceptions.GraphQlValidationError(
                    "Cannot remove the last owner. Transfer ownership first or delete the organization."
                )

        # Log the membership deletion
        log_delete(
            tenant_id=tenant.pk,
            entity_type="tenant_membership",
            instance=obj,
            actor_user=user,
            name_field="invitee_email_address" if not obj.user else None,
        )

        # Invalidate permission cache if user exists
        if obj.user:
            models.invalidate_user_permissions_cache(obj.user.id, tenant.pk)

        obj.delete()
        return cls(deleted_ids=[id])


@action_logged(entity_type="tenant_membership", action_type=ActionType.UPDATE)
class UpdateTenantMembershipMutation(mutations.UpdateModelMutation):
    class Input:
        id = graphene.String()
        tenant_id = graphene.String(required=True)

    class Meta:
        serializer_class = serializers.UpdateTenantMembershipSerializer
        edge_class = TenantConnection.Edge
        convert_choices_to_enum = True

    @classmethod
    def get_object(cls, model_class, root, info, **input):
        return get_object_or_404(model_class.objects.get_all(), pk=input["id"], tenant=info.context.tenant)

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        if "id" in input:
            _, input["id"] = from_global_id(input["id"])
        return super().mutate_and_get_payload(root, info, **input)


class AcceptTenantInvitationMutation(mutations.SerializerMutation):
    ok = graphene.Boolean()

    class Meta:
        serializer_class = serializers.AcceptTenantInvitationSerializer

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        if "id" in input:
            _, input["id"] = from_global_id(input["id"])
        return super().mutate_and_get_payload(root, info, **input)


class DeclineTenantInvitationMutation(mutations.SerializerMutation):
    ok = graphene.Boolean()

    class Meta:
        serializer_class = serializers.DeclineTenantInvitationSerializer

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        if "id" in input:
            _, input["id"] = from_global_id(input["id"])
        return super().mutate_and_get_payload(root, info, **input)


class UpdateTenantActionLoggingMutation(graphene.Mutation):
    """Mutation to enable or disable action logging for a tenant."""

    class Arguments:
        tenant_id = graphene.ID(required=True)
        enabled = graphene.Boolean(required=True)

    tenant = graphene.Field(TenantType)
    ok = graphene.Boolean()

    @classmethod
    def mutate(cls, root, info, tenant_id, enabled):
        _, pk = from_global_id(tenant_id)
        tenant = get_object_or_404(models.Tenant, pk=pk)

        # Get user from context
        user = getattr(info.context, "user", None) if info.context else None

        # Log the settings change if logging is enabled (before we potentially disable it)
        from common.action_logging import log_action
        from .constants import ActionType

        if tenant.action_logging_enabled:
            log_action(
                tenant_id=pk,
                action_type=ActionType.SETTINGS_CHANGE,
                entity_type="tenant_settings",
                entity_id=str(tenant.pk),
                entity_name="Action Logging",
                actor_user=user,
                actor_type="USER",
                changes={
                    "action_logging_enabled": {
                        "old": tenant.action_logging_enabled,
                        "new": enabled,
                    },
                },
                force_log=True,  # Force log even if we're disabling
            )

        tenant.action_logging_enabled = enabled
        tenant.save(update_fields=["action_logging_enabled"])

        return cls(tenant=tenant, ok=True)


# ============ Action Log Export Types ============


class ActionLogExportType(DjangoObjectType):
    """GraphQL type for ActionLogExport model."""

    download_url = graphene.String()
    filters = GenericScalar()

    class Meta:
        model = models.ActionLogExport
        interfaces = (relay.Node,)
        fields = "__all__"

    def resolve_download_url(self, info):
        if self.status == models.ActionLogExport.Status.COMPLETED:
            return self.get_download_url()
        return None


class ExportActionLogsMutation(graphene.Mutation):
    """
    Mutation to trigger an async export of action logs.

    Creates an export job that processes in the background.
    User receives a notification when the export is ready.
    """

    class Arguments:
        tenant_id = graphene.ID(required=True)
        # Filter arguments (same as allActionLogs query)
        entity_type = graphene.String()
        action_type = graphene.String()
        actor_email = graphene.String()
        from_datetime = graphene.DateTime()
        to_datetime = graphene.DateTime()
        search = graphene.String()

    export = graphene.Field(ActionLogExportType)
    ok = graphene.Boolean()

    @classmethod
    def mutate(
        cls,
        root,
        info,
        tenant_id,
        entity_type=None,
        action_type=None,
        actor_email=None,
        from_datetime=None,
        to_datetime=None,
        search=None,
    ):
        _, pk = from_global_id(tenant_id)
        tenant = get_object_or_404(models.Tenant, pk=pk)
        user = info.context.user

        # Build filters dict for storage
        filters = {}
        if entity_type:
            filters["entity_type"] = entity_type
        if action_type:
            filters["action_type"] = action_type
        if actor_email:
            filters["actor_email"] = actor_email
        if from_datetime:
            filters["from_datetime"] = from_datetime.isoformat()
        if to_datetime:
            filters["to_datetime"] = to_datetime.isoformat()
        if search:
            filters["search"] = search

        # Create export job
        export_job = models.ActionLogExport.objects.create(
            tenant=tenant,
            requested_by=user,
            filters=filters,
        )

        # Trigger async task
        from .tasks import export_action_logs

        export_action_logs.delay(str(export_job.pk))

        return cls(export=export_job, ok=True)


# ============ RBAC Mutations ============


class CreateOrganizationRoleMutation(graphene.Mutation):
    """
    Create a new custom organization role.

    SECURITY:
    - Requires 'org.roles.manage' permission
    - Users can only create roles with permissions they themselves have (except owners)
    """

    class Arguments:
        tenant_id = graphene.ID(required=True)
        name = graphene.String(required=True)
        description = graphene.String()
        color = RoleColorType()
        permission_ids = graphene.List(graphene.ID, required=True)

    role = graphene.Field(OrganizationRoleType)
    ok = graphene.Boolean()

    @classmethod
    def mutate(cls, root, info, tenant_id, name, permission_ids, description="", color=None):
        _, pk = from_global_id(tenant_id)
        tenant = get_object_or_404(models.Tenant, pk=pk)
        user = info.context.user

        # SECURITY CHECK 1: Verify user has permission to manage roles
        if not models.user_has_permission(user, tenant, "org.roles.manage"):
            raise PermissionDenied("You don't have permission to manage organization roles.")

        # Check for duplicate name
        if models.OrganizationRole.objects.filter(tenant=tenant, name=name).exists():
            raise exceptions.GraphQlValidationError(f"A role with the name '{name}' already exists.")

        # SECURITY CHECK 2: Users can only create roles with permissions they have (except owners)
        user_permissions = models.get_user_permissions_for_tenant(user, tenant)
        is_owner = models.user_has_permission(user, tenant, "org.*")  # Owners have org.*

        if not is_owner:
            for perm_id in permission_ids:
                _, perm_pk = from_global_id(perm_id)
                permission = get_object_or_404(models.Permission, pk=perm_pk)
                if permission.code not in user_permissions:
                    raise PermissionDenied(
                        f"You cannot create a role with permission '{permission.code}' that you don't have."
                    )

        with transaction.atomic():
            role = models.OrganizationRole.objects.create(
                tenant=tenant,
                name=name,
                description=description,
                color=color or RoleColor.BLUE,
            )

            # Add permissions
            for perm_id in permission_ids:
                _, perm_pk = from_global_id(perm_id)
                permission = get_object_or_404(models.Permission, pk=perm_pk)
                models.OrganizationRolePermission.objects.create(
                    role=role,
                    permission=permission,
                )

            # Log the action
            log_action(
                tenant_id=pk,
                action_type=ActionType.CREATE,
                entity_type="organization_role",
                entity_id=str(role.pk),
                entity_name=role.name,
                actor_user=user,
                changes={"name": {"new": name}},
            )

        return cls(role=role, ok=True)


class UpdateOrganizationRoleMutation(graphene.Mutation):
    """
    Update an existing organization role.

    SECURITY:
    - Requires 'org.roles.manage' permission
    - Cannot modify the Owner role
    - Users can only add permissions they themselves have (except owners)
    """

    class Arguments:
        id = graphene.ID(required=True)
        tenant_id = graphene.ID(required=True)
        name = graphene.String()
        description = graphene.String()
        color = RoleColorType()
        permission_ids = graphene.List(graphene.ID)

    role = graphene.Field(OrganizationRoleType)
    ok = graphene.Boolean()

    @classmethod
    def mutate(cls, root, info, id, tenant_id, name=None, description=None, color=None, permission_ids=None):
        _, role_pk = from_global_id(id)
        _, tenant_pk = from_global_id(tenant_id)
        role = get_object_or_404(models.OrganizationRole, pk=role_pk, tenant_id=tenant_pk)
        tenant = get_object_or_404(models.Tenant, pk=tenant_pk)
        user = info.context.user

        # SECURITY CHECK 1: Verify user has permission to manage roles
        if not models.user_has_permission(user, tenant, "org.roles.manage"):
            raise PermissionDenied("You don't have permission to manage organization roles.")

        # Cannot modify OWNER role permissions
        if role.is_owner_role:
            raise exceptions.GraphQlValidationError("Cannot modify the Owner role.")

        # SECURITY CHECK 2: If adding permissions, verify user has those permissions
        if permission_ids is not None:
            user_permissions = models.get_user_permissions_for_tenant(user, tenant)
            is_owner = models.user_has_permission(user, tenant, "org.*")

            if not is_owner:
                for perm_id in permission_ids:
                    _, perm_pk = from_global_id(perm_id)
                    permission = get_object_or_404(models.Permission, pk=perm_pk)
                    if permission.code not in user_permissions:
                        raise PermissionDenied(f"You cannot add permission '{permission.code}' that you don't have.")

        changes = {}
        with transaction.atomic():
            if name is not None and name != role.name:
                # Check for duplicate name
                if models.OrganizationRole.objects.filter(tenant_id=tenant_pk, name=name).exclude(pk=role_pk).exists():
                    raise exceptions.GraphQlValidationError(f"A role with the name '{name}' already exists.")
                changes["name"] = {"old": role.name, "new": name}
                role.name = name

            if description is not None and description != role.description:
                changes["description"] = {"old": role.description, "new": description}
                role.description = description

            if color is not None and color != role.color:
                changes["color"] = {"old": role.color, "new": color}
                role.color = color

            if permission_ids is not None:
                # Replace all permissions
                old_perms = list(role.permissions.values_list("code", flat=True))
                role.role_permissions.all().delete()
                new_perms = []
                for perm_id in permission_ids:
                    _, perm_pk = from_global_id(perm_id)
                    permission = get_object_or_404(models.Permission, pk=perm_pk)
                    models.OrganizationRolePermission.objects.create(
                        role=role,
                        permission=permission,
                    )
                    new_perms.append(permission.code)
                changes["permissions"] = {"old": old_perms, "new": new_perms}

            role.save()

            # Invalidate permission cache for all members with this role
            for mr in role.member_assignments.select_related("membership__user").all():
                if mr.membership.user:
                    models.invalidate_user_permissions_cache(mr.membership.user.id, tenant_pk)

            # Log the action
            if changes:
                log_action(
                    tenant_id=tenant_pk,
                    action_type=ActionType.UPDATE,
                    entity_type="organization_role",
                    entity_id=str(role.pk),
                    entity_name=role.name,
                    actor_user=user,
                    changes=changes,
                )

        return cls(role=role, ok=True)


class DeleteOrganizationRoleMutation(graphene.Mutation):
    """
    Delete an organization role.

    If there are members with this role, a replacement_role_id must be provided.

    SECURITY:
    - Requires 'org.roles.manage' permission
    - Cannot delete system roles (Owner, Admin, Member)
    """

    class Arguments:
        id = graphene.ID(required=True)
        tenant_id = graphene.ID(required=True)
        replacement_role_id = graphene.ID(description="Role to assign to affected members")

    ok = graphene.Boolean()
    affected_member_count = graphene.Int()

    @classmethod
    def mutate(cls, root, info, id, tenant_id, replacement_role_id=None):
        _, role_pk = from_global_id(id)
        _, tenant_pk = from_global_id(tenant_id)
        role = get_object_or_404(models.OrganizationRole, pk=role_pk, tenant_id=tenant_pk)
        tenant = get_object_or_404(models.Tenant, pk=tenant_pk)
        user = info.context.user

        # SECURITY CHECK: Verify user has permission to manage roles
        if not models.user_has_permission(user, tenant, "org.roles.manage"):
            raise PermissionDenied("You don't have permission to manage organization roles.")

        # Cannot delete system roles
        if role.is_system_role:
            raise exceptions.GraphQlValidationError("Cannot delete system roles.")

        # Check for affected members
        affected_members = role.member_assignments.all()
        affected_count = affected_members.count()

        if affected_count > 0:
            if not replacement_role_id:
                raise exceptions.GraphQlValidationError(
                    f"This role is assigned to {affected_count} member(s). Please provide a replacement role."
                )

            _, replacement_pk = from_global_id(replacement_role_id)
            replacement_role = get_object_or_404(models.OrganizationRole, pk=replacement_pk, tenant_id=tenant_pk)

            if replacement_role.pk == role.pk:
                raise exceptions.GraphQlValidationError("Replacement role cannot be the same as the deleted role.")

            with transaction.atomic():
                # Reassign members to replacement role
                for mr in affected_members:
                    # Check if member already has replacement role
                    if not models.TenantMembershipRole.objects.filter(
                        membership=mr.membership, role=replacement_role
                    ).exists():
                        models.TenantMembershipRole.objects.create(
                            membership=mr.membership,
                            role=replacement_role,
                            assigned_by=user,
                        )
                    # Invalidate cache
                    if mr.membership.user:
                        models.invalidate_user_permissions_cache(mr.membership.user.id, tenant_pk)

                # Log the deletion
                log_delete(
                    tenant_id=tenant_pk,
                    entity_type="organization_role",
                    instance=role,
                    actor_user=user,
                )

                role.delete()
        else:
            # No affected members, just delete
            log_delete(
                tenant_id=tenant_pk,
                entity_type="organization_role",
                instance=role,
                actor_user=user,
            )
            role.delete()

        return cls(ok=True, affected_member_count=affected_count)


class AssignRolesToMemberMutation(graphene.Mutation):
    """
    Assign one or more organization roles to a member.

    SECURITY:
    - Requires 'members.roles.edit' permission
    - Only owners can assign the Owner role
    - Users can only assign roles with permissions they themselves have
    - Users cannot remove their own owner role if they're the last owner
    """

    class Arguments:
        membership_id = graphene.ID(required=True)
        tenant_id = graphene.ID(required=True)
        role_ids = graphene.List(graphene.ID, required=True)

    membership = graphene.Field(TenantMembershipType)
    ok = graphene.Boolean()

    @classmethod
    def mutate(cls, root, info, membership_id, tenant_id, role_ids):
        _, membership_pk = from_global_id(membership_id)
        _, tenant_pk = from_global_id(tenant_id)
        membership = get_object_or_404(models.TenantMembership.objects.get_all(), pk=membership_pk, tenant_id=tenant_pk)
        tenant = get_object_or_404(models.Tenant, pk=tenant_pk)
        user = info.context.user

        # SECURITY CHECK 1: Verify user has permission to edit member roles
        if not models.user_has_permission(user, tenant, "members.roles.edit"):
            raise PermissionDenied("You don't have permission to edit member roles.")

        if not role_ids:
            raise exceptions.GraphQlValidationError("At least one role must be assigned.")

        # Get user's permissions and owner status for validation
        user_permissions = models.get_user_permissions_for_tenant(user, tenant)

        # Check if the acting user is an owner
        acting_user_membership = models.TenantMembership.objects.filter(
            user=user, tenant=tenant, is_accepted=True
        ).first()
        is_acting_user_owner = acting_user_membership and (
            acting_user_membership.role == TenantUserRole.OWNER
            or models.TenantMembershipRole.objects.filter(
                membership=acting_user_membership, role__system_role_type=SystemRoleType.OWNER
            ).exists()
        )

        # Check if target membership currently has owner role
        target_has_owner_role = models.TenantMembershipRole.objects.filter(
            membership=membership, role__system_role_type=SystemRoleType.OWNER
        ).exists()

        # Validate all roles before making changes
        roles_to_assign = []
        will_have_owner_role = False

        for role_id in role_ids:
            _, role_pk = from_global_id(role_id)
            role = get_object_or_404(models.OrganizationRole, pk=role_pk, tenant_id=tenant_pk)

            # SECURITY CHECK 2: Only owners can assign the Owner role
            if role.is_owner_role:
                will_have_owner_role = True
                if not is_acting_user_owner:
                    raise PermissionDenied("Only organization owners can assign the Owner role.")

            # SECURITY CHECK 3: Users can only assign roles with permissions they have
            # (owners can assign any role)
            if not is_acting_user_owner:
                role_permissions = set(role.permissions.values_list("code", flat=True))
                missing_permissions = role_permissions - user_permissions
                if missing_permissions:
                    permissions_list = ", ".join(list(missing_permissions)[:3])
                    raise PermissionDenied(
                        f"You cannot assign roles with permissions you don't have: {permissions_list}"
                    )

            roles_to_assign.append(role)

        # SECURITY CHECK 4: Prevent removing owner role if this would leave no owners
        if target_has_owner_role and not will_have_owner_role:
            # Count how many owners the tenant has
            owner_count = models.TenantMembershipRole.objects.filter(
                membership__tenant=tenant, role__system_role_type=SystemRoleType.OWNER, membership__is_accepted=True
            ).count()

            # Also count legacy owners
            legacy_owner_count = (
                models.TenantMembership.objects.filter(tenant=tenant, role=TenantUserRole.OWNER, is_accepted=True)
                .exclude(pk=membership.pk)
                .count()
            )  # Exclude target if they're legacy owner

            if owner_count <= 1 and legacy_owner_count == 0:
                raise exceptions.GraphQlValidationError(
                    "Cannot remove the Owner role: there must be at least one owner in the organization."
                )

        # SECURITY CHECK 5: Non-owners cannot modify owner memberships
        if target_has_owner_role and not is_acting_user_owner:
            raise PermissionDenied("Only owners can modify the roles of other owners.")

        with transaction.atomic():
            # Get old roles for logging
            old_roles = list(membership.membership_roles.values_list("role__name", flat=True))

            # Clear existing role assignments
            membership.membership_roles.all().delete()

            # Assign new roles
            new_role_names = []
            for role in roles_to_assign:
                models.TenantMembershipRole.objects.create(
                    membership=membership,
                    role=role,
                    assigned_by=user,
                )
                new_role_names.append(role.name)

            # Invalidate permission cache
            if membership.user:
                models.invalidate_user_permissions_cache(membership.user.id, tenant_pk)

            # Log the action
            member_name = f"{membership.user.email}" if membership.user else membership.invitee_email_address
            log_action(
                tenant_id=tenant_pk,
                action_type=ActionType.UPDATE,
                entity_type="tenant_membership",
                entity_id=str(membership.pk),
                entity_name=member_name,
                actor_user=user,
                changes={"roles": {"old": old_roles, "new": new_role_names}},
            )

        return cls(membership=membership, ok=True)


class RemoveRoleFromMemberMutation(graphene.Mutation):
    """
    Remove a specific role from a member.

    SECURITY:
    - Requires 'members.roles.edit' permission
    - Only owners can remove the Owner role
    - Cannot remove the last owner's owner role
    - Non-owners cannot modify owner memberships
    """

    class Arguments:
        membership_id = graphene.ID(required=True)
        tenant_id = graphene.ID(required=True)
        role_id = graphene.ID(required=True)

    membership = graphene.Field(TenantMembershipType)
    ok = graphene.Boolean()

    @classmethod
    def mutate(cls, root, info, membership_id, tenant_id, role_id):
        _, membership_pk = from_global_id(membership_id)
        _, tenant_pk = from_global_id(tenant_id)
        _, role_pk = from_global_id(role_id)

        membership = get_object_or_404(models.TenantMembership.objects.get_all(), pk=membership_pk, tenant_id=tenant_pk)
        tenant = get_object_or_404(models.Tenant, pk=tenant_pk)
        user = info.context.user

        # SECURITY CHECK 1: Verify user has permission to edit member roles
        if not models.user_has_permission(user, tenant, "members.roles.edit"):
            raise PermissionDenied("You don't have permission to edit member roles.")

        # Find the role assignment
        mr = models.TenantMembershipRole.objects.filter(membership=membership, role_id=role_pk).first()

        if not mr:
            raise exceptions.GraphQlValidationError("This role is not assigned to the member.")

        # Get acting user's owner status
        acting_user_membership = models.TenantMembership.objects.filter(
            user=user, tenant=tenant, is_accepted=True
        ).first()
        is_acting_user_owner = acting_user_membership and (
            acting_user_membership.role == TenantUserRole.OWNER
            or models.TenantMembershipRole.objects.filter(
                membership=acting_user_membership, role__system_role_type=SystemRoleType.OWNER
            ).exists()
        )

        # Check if target has owner role
        target_has_owner_role = models.TenantMembershipRole.objects.filter(
            membership=membership, role__system_role_type=SystemRoleType.OWNER
        ).exists()

        # SECURITY CHECK 2: Only owners can remove owner role
        if mr.role.is_owner_role and not is_acting_user_owner:
            raise PermissionDenied("Only organization owners can remove the Owner role.")

        # SECURITY CHECK 3: Non-owners cannot modify owner memberships
        if target_has_owner_role and not is_acting_user_owner:
            raise PermissionDenied("Only owners can modify the roles of other owners.")

        # SECURITY CHECK 4: Cannot remove the last owner's owner role
        if mr.role.is_owner_role:
            owner_count = models.TenantMembershipRole.objects.filter(
                membership__tenant=tenant, role__system_role_type=SystemRoleType.OWNER, membership__is_accepted=True
            ).count()

            if owner_count <= 1:
                raise exceptions.GraphQlValidationError(
                    "Cannot remove the Owner role: there must be at least one owner in the organization."
                )

        # Ensure at least one role remains
        remaining_roles = membership.membership_roles.exclude(pk=mr.pk).count()
        if remaining_roles == 0:
            raise exceptions.GraphQlValidationError("Cannot remove the last role. Member must have at least one role.")

        role_name = mr.role.name
        mr.delete()

        # Invalidate permission cache
        if membership.user:
            models.invalidate_user_permissions_cache(membership.user.id, tenant_pk)

        # Log the action
        member_name = f"{membership.user.email}" if membership.user else membership.invitee_email_address
        log_action(
            tenant_id=tenant_pk,
            action_type=ActionType.UPDATE,
            entity_type="tenant_membership",
            entity_id=str(membership.pk),
            entity_name=member_name,
            actor_user=user,
            changes={"role_removed": {"old": role_name, "new": None}},
        )

        return cls(membership=membership, ok=True)


class Query(graphene.ObjectType):
    all_tenants = graphene.relay.ConnectionField(TenantConnection)
    tenant = graphene.Field(TenantType, id=graphene.ID())

    # Action Logs
    all_action_logs = graphene.relay.ConnectionField(
        ActionLogConnection,
        tenant_id=graphene.ID(required=True),
        entity_type=graphene.String(description="Filter by entity type"),
        action_type=graphene.String(description="Filter by action type"),
        actor_email=graphene.String(description="Filter by actor email"),
        from_datetime=graphene.DateTime(description="Filter logs from this datetime"),
        to_datetime=graphene.DateTime(description="Filter logs until this datetime"),
        search=graphene.String(description="Search in entity name, actor email, or metadata"),
    )

    # RBAC Queries
    all_permissions = graphene.relay.ConnectionField(
        PermissionConnection,
        category=PermissionCategoryType(description="Filter by category"),
    )
    all_organization_roles = graphene.relay.ConnectionField(
        OrganizationRoleConnection,
        tenant_id=graphene.ID(required=True),
    )
    organization_role = graphene.Field(
        OrganizationRoleType,
        id=graphene.ID(required=True),
    )
    current_user_permissions = graphene.List(
        graphene.String,
        tenant_id=graphene.ID(required=True),
        description="Get all permission codes for the current user in a tenant",
    )
    current_user_organization_roles = graphene.List(
        OrganizationRoleType,
        tenant_id=graphene.ID(required=True),
        description="Get all organization roles for the current user in a tenant",
    )

    @staticmethod
    @permission_classes(policies.AnyoneFullAccess)
    def resolve_all_tenants(root, info, **kwargs):
        if info.context.user.is_authenticated:
            qs = models.Tenant.objects.filter(user_memberships__user=info.context.user).all()
            return filter_tenants_for_password_session(info.context, qs)
        return []

    @staticmethod
    def resolve_tenant(root, info, id):
        _, pk = from_global_id(id)
        return models.Tenant.objects.filter(pk=pk, user_memberships__user=info.context.user).first()

    @staticmethod
    @permission_classes(policies.IsTenantMemberAccess, requires("security.logs.view"))
    def resolve_all_action_logs(
        root,
        info,
        tenant_id,
        entity_type=None,
        action_type=None,
        actor_email=None,
        from_datetime=None,
        to_datetime=None,
        search=None,
        **kwargs,
    ):
        _, pk = from_global_id(tenant_id)
        qs = models.ActionLog.objects.filter(tenant_id=pk)

        if entity_type:
            qs = qs.filter(entity_type=entity_type)
        if action_type:
            qs = qs.filter(action_type=action_type)
        if actor_email:
            qs = qs.filter(actor_email__icontains=actor_email)
        if from_datetime:
            qs = qs.filter(created_at__gte=from_datetime)
        if to_datetime:
            qs = qs.filter(created_at__lte=to_datetime)
        if search:
            from django.db.models import Q

            qs = qs.filter(Q(entity_name__icontains=search) | Q(actor_email__icontains=search))

        return qs.order_by("-created_at")

    @staticmethod
    @permission_classes(policies.IsAuthenticatedFullAccess)
    def resolve_all_permissions(root, info, category=None, **kwargs):
        """Get all available permissions, optionally filtered by category.

        Permissions are global data, so only authentication is required.
        """
        qs = models.Permission.objects.all()
        if category:
            qs = qs.filter(category=category)
        return qs.order_by("category", "sort_order", "name")

    @staticmethod
    @permission_classes(policies.IsTenantMemberAccess, requires("org.roles.view"))
    def resolve_all_organization_roles(root, info, tenant_id, **kwargs):
        """Get all organization roles for a tenant."""
        _, pk = from_global_id(tenant_id)
        return models.OrganizationRole.objects.filter(tenant_id=pk).order_by("name")

    @staticmethod
    @permission_classes(policies.IsTenantMemberAccess, requires("org.roles.view"))
    def resolve_organization_role(root, info, id):
        """Get a single organization role by ID."""
        _, pk = from_global_id(id)
        return models.OrganizationRole.objects.filter(pk=pk).first()

    @staticmethod
    @permission_classes(policies.IsTenantMemberAccess)
    def resolve_current_user_permissions(root, info, tenant_id, **kwargs):
        """Get all permission codes for the current user in a tenant."""
        _, pk = from_global_id(tenant_id)
        tenant = models.Tenant.objects.filter(pk=pk).first()
        if not tenant:
            return []
        user = info.context.user
        permissions = models.get_user_permissions_for_tenant(user, tenant)
        return list(permissions)

    @staticmethod
    @permission_classes(policies.IsTenantMemberAccess)
    def resolve_current_user_organization_roles(root, info, tenant_id, **kwargs):
        """Get all organization roles assigned to the current user in a tenant."""
        _, pk = from_global_id(tenant_id)
        user = info.context.user

        # Get the user's membership for this tenant
        membership = models.TenantMembership.objects.filter(user=user, tenant_id=pk, is_accepted=True).first()

        if not membership:
            return []

        # Get all organization roles assigned to this membership
        role_ids = models.TenantMembershipRole.objects.filter(membership=membership).values_list("role_id", flat=True)

        return models.OrganizationRole.objects.filter(id__in=role_ids).order_by("name")


@permission_classes(policies.IsTenantAdminAccess)
class TenantOwnerMutation(graphene.ObjectType):
    """
    Tenant admin mutations with RBAC permission checks.

    Uses IsTenantAdminAccess at class level,
    with specific RBAC permissions for each mutation.
    """

    # Organization settings - org.settings.edit
    update_tenant = permission_classes(requires("org.settings.edit"))(UpdateTenantMutation.Field())

    # Delete organization - org.delete (owner-only)
    delete_tenant = permission_classes(policies.IsTenantOwnerAccess)(DeleteTenantMutation.Field())

    # Member invitations - members.invite
    create_tenant_invitation = permission_classes(requires("members.invite"))(CreateTenantInvitationMutation.Field())
    resend_tenant_invitation = permission_classes(requires("members.invite"))(ResendTenantInvitationMutation.Field())

    # Member management - members.roles.edit
    update_tenant_membership = permission_classes(requires("members.roles.edit"))(
        UpdateTenantMembershipMutation.Field()
    )

    # Action logging - security.logs.view for toggle, security.logs.export for export
    update_tenant_action_logging = permission_classes(requires("org.settings.edit"))(
        UpdateTenantActionLoggingMutation.Field()
    )
    export_action_logs = permission_classes(requires("security.logs.export"))(ExportActionLogsMutation.Field())

    # RBAC Mutations - org.roles.manage
    create_organization_role = permission_classes(requires("org.roles.manage"))(CreateOrganizationRoleMutation.Field())
    update_organization_role = permission_classes(requires("org.roles.manage"))(UpdateOrganizationRoleMutation.Field())
    delete_organization_role = permission_classes(requires("org.roles.manage"))(DeleteOrganizationRoleMutation.Field())

    # Member role assignments - members.roles.edit
    assign_roles_to_member = permission_classes(requires("members.roles.edit"))(AssignRolesToMemberMutation.Field())
    remove_role_from_member = permission_classes(requires("members.roles.edit"))(RemoveRoleFromMemberMutation.Field())


class Mutation(graphene.ObjectType):
    """
    Base tenant mutations.

    These mutations have their own permission checks:
    - create_tenant: Authenticated users can create tenants
    - accept/decline_tenant_invitation: Token-based validation
    - delete_tenant_membership: Requires members.remove permission
    """

    create_tenant = CreateTenantMutation.Field()
    accept_tenant_invitation = AcceptTenantInvitationMutation.Field()
    decline_tenant_invitation = DeclineTenantInvitationMutation.Field()
    # Member removal - permission check is done in the mutation (allows self-removal without members.remove)
    delete_tenant_membership = permission_classes(policies.IsTenantMemberAccess)(DeleteTenantMembershipMutation.Field())
