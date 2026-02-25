"""
GraphQL schema for Enterprise SSO management.
"""

import graphene
from graphene import relay
from graphene.types.generic import GenericScalar
from graphene_django import DjangoObjectType
from graphql_relay import to_global_id, from_global_id
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import PermissionDenied

from common.acl import policies
from common.graphql import mutations
from common.graphql.acl.decorators import permission_classes, requires
from common.action_logging.decorators import action_logged
from common.action_logging.service import log_action, log_delete
from apps.multitenancy.constants import ActionType
from apps.users.services.users import get_user_from_resolver
from . import models
from . import serializers
from . import constants


def _resolve_tenant(info, tenant_id=None):
    """Resolve tenant from context or from tenant_id when context.tenant is None."""
    tenant = info.context.tenant
    if tenant is not None:
        return tenant
    if not tenant_id:
        return None
    from apps.multitenancy.models import Tenant, TenantMembership

    try:
        _, tenant_pk = from_global_id(tenant_id)
    except (TypeError, ValueError):
        tenant_pk = tenant_id
    tenant = Tenant.objects.filter(pk=tenant_pk).first()
    if tenant is None:
        raise PermissionDenied("Tenant not found")
    user = getattr(info.context, 'user', None)
    if user and not TenantMembership.objects.filter(user=user, tenant=tenant, is_accepted=True).exists():
        raise PermissionDenied("You don't have access to this tenant")
    return tenant


# ==================
# Types
# ==================


class SSOConnectionType(DjangoObjectType):
    """GraphQL type for SSO connections."""

    id = graphene.ID(required=True)
    is_active = graphene.Boolean()
    is_saml = graphene.Boolean()
    is_oidc = graphene.Boolean()
    sp_metadata_url = graphene.String()
    sp_acs_url = graphene.String()
    sp_entity_id = graphene.String()
    oidc_callback_url = graphene.String()
    oidc_login_url = graphene.String()

    class Meta:
        model = models.TenantSSOConnection
        fields = [
            "id",
            "name",
            "connection_type",
            "status",
            "allowed_domains",
            'enforce_sso',
            "jit_provisioning_enabled",
            "group_role_mapping",
            # SAML
            "saml_entity_id",
            "saml_sso_url",
            "saml_slo_url",
            "saml_name_id_format",
            "saml_want_assertions_signed",
            "saml_want_response_signed",
            "saml_attribute_mapping",
            # OIDC
            "oidc_issuer",
            "oidc_client_id",
            "oidc_authorization_endpoint",
            "oidc_token_endpoint",
            "oidc_userinfo_endpoint",
            "oidc_jwks_uri",
            "oidc_scopes",
            "oidc_claim_mapping",
            # Stats
            "last_login_at",
            "login_count",
            "created_at",
            "updated_at",
        ]
        interfaces = (relay.Node,)

    def resolve_id(self, info):
        return to_global_id("SSOConnectionType", self.id)

    def resolve_sp_metadata_url(self, info):
        from django.conf import settings

        if self.is_saml:
            api_url = getattr(settings, "API_URL", "http://localhost:5001")
            return f"{api_url}/api/sso/saml/{self.id}/metadata"
        return None

    def resolve_sp_acs_url(self, info):
        return self.sp_acs_url if self.is_saml else None

    def resolve_sp_entity_id(self, info):
        return self.sp_entity_id if self.is_saml else None

    def resolve_oidc_callback_url(self, info):
        return self.oidc_callback_url if self.is_oidc else None

    def resolve_sp_acs_url(self, info):
        return self.sp_acs_url if self.is_saml else None

    def resolve_sp_entity_id(self, info):
        return self.sp_entity_id if self.is_saml else None

    def resolve_oidc_callback_url(self, info):
        return self.oidc_callback_url if self.is_oidc else None

    def resolve_oidc_login_url(self, info):
        return self.login_url if self.is_oidc else None


class SSOConnectionConnection(graphene.Connection):
    class Meta:
        node = SSOConnectionType


class SCIMTokenType(DjangoObjectType):
    """GraphQL type for SCIM tokens."""

    id = graphene.ID(required=True)
    is_valid = graphene.Boolean()
    is_expired = graphene.Boolean()

    class Meta:
        model = models.SCIMToken
        fields = [
            "id",
            "name",
            "token_prefix",
            "is_active",
            "expires_at",
            "last_used_at",
            "last_used_ip",
            "request_count",
            "created_at",
            "updated_at",
        ]
        interfaces = (relay.Node,)

    def resolve_id(self, info):
        return to_global_id("SCIMTokenType", self.id)


class SCIMTokenConnection(graphene.Connection):
    class Meta:
        node = SCIMTokenType


class SSOSessionType(DjangoObjectType):
    """GraphQL type for SSO sessions."""

    id = graphene.ID(required=True)
    is_valid = graphene.Boolean()
    is_expired = graphene.Boolean()
    is_current = graphene.Boolean()

    class Meta:
        model = models.SSOSession
        fields = [
            "id",
            "session_id",  # Raw session ID for revoke mutations
            "device_name",
            "device_type",
            "browser",
            "operating_system",
            "ip_address",
            "location",
            "is_active",
            "last_activity_at",
            "expires_at",
            "created_at",
        ]
        interfaces = (relay.Node,)

    def resolve_id(self, info):
        return to_global_id("SSOSessionType", self.id)

    def resolve_is_current(self, info):
        """Dynamically determine if this is the current session based on request cookie."""
        from django.conf import settings

        request = info.context._request if hasattr(info.context, "_request") else info.context
        current_session_id = request.COOKIES.get(settings.SESSION_ID_COOKIE)

        return bool(current_session_id and self.session_id == current_session_id)


class SSOSessionConnection(graphene.Connection):
    class Meta:
        node = SSOSessionType


class UserDeviceType(DjangoObjectType):
    """GraphQL type for user devices."""

    id = graphene.ID(required=True)

    class Meta:
        model = models.UserDevice
        fields = [
            "id",
            "device_name",
            "device_type",
            "browser",
            "operating_system",
            "is_trusted",
            "trusted_at",
            "last_seen_at",
            "last_ip_address",
            "last_location",
            "is_blocked",
            "created_at",
        ]
        interfaces = (relay.Node,)

    def resolve_id(self, info):
        return to_global_id("UserDeviceType", self.id)


class UserDeviceConnection(graphene.Connection):
    class Meta:
        node = UserDeviceType


class PasskeyType(DjangoObjectType):
    """GraphQL type for passkeys."""

    id = graphene.ID(required=True)

    class Meta:
        model = models.UserPasskey
        fields = [
            "id",
            "name",
            "authenticator_type",
            "transports",
            "is_active",
            "last_used_at",
            "use_count",
            "device_type",
            "created_at",
        ]
        interfaces = (relay.Node,)

    def resolve_id(self, info):
        return to_global_id("PasskeyType", self.id)


class PasskeyConnection(graphene.Connection):
    class Meta:
        node = PasskeyType


class TenantPasskeyType(graphene.ObjectType):
    id = graphene.ID()
    name = graphene.String()
    authenticator_type = graphene.String()
    transports = GenericScalar()
    is_active = graphene.Boolean()
    last_used_at = graphene.DateTime()
    use_count = graphene.Int()
    device_type = graphene.String()
    created_at = graphene.DateTime()
    user_email = graphene.String()
    user_name = graphene.String()

    def resolve_id(self, info):
        return to_global_id("PasskeyType", self.id)

    def resolve_user_email(self, info):
        return self.user.email if hasattr(self, "user") and self.user else None

    def resolve_user_name(self, info):
        if not hasattr(self, "user") or not self.user:
            return None
        first = getattr(self.user.profile, "first_name", "") or ""
        last = getattr(self.user.profile, "last_name", "") or ""
        return f"{first} {last}".strip() or self.user.email


class SSOAuditLogType(DjangoObjectType):
    """GraphQL type for SSO audit logs."""

    id = graphene.ID(required=True)
    user_email = graphene.String()
    connection_name = graphene.String()

    class Meta:
        model = models.SSOAuditLog
        fields = [
            "id",
            "event_type",
            "event_description",
            "ip_address",
            "success",
            "error_message",
            "metadata",
            "created_at",
        ]
        interfaces = (relay.Node,)

    def resolve_id(self, info):
        return to_global_id("SSOAuditLogType", self.id)

    def resolve_user_email(self, info):
        return self.user.email if self.user else None

    def resolve_connection_name(self, info):
        return self.sso_connection.name if self.sso_connection else None


class SSOAuditLogConnection(graphene.Connection):
    class Meta:
        node = SSOAuditLogType


class SSODiscoveryConnectionType(graphene.ObjectType):
    id = graphene.String()
    name = graphene.String()
    type = graphene.String()
    tenant_id = graphene.String()
    tenant_name = graphene.String()
    login_url = graphene.String()


class SSODiscoveryResultType(graphene.ObjectType):
    sso_available = graphene.Boolean()
    require_sso = graphene.Boolean()
    connections = graphene.List(SSODiscoveryConnectionType)


# ==================
# Mutations
# ==================


@action_logged(entity_type="sso_connection", action_type=ActionType.CREATE)
class CreateSSOConnectionMutation(mutations.SerializerMutation):
    """Create a new SSO connection."""

    sso_connection = graphene.Field(SSOConnectionType)

    class Meta:
        serializer_class = serializers.TenantSSOConnectionSerializer

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        tenant = _resolve_tenant(info, input.get('tenant_id') or input.get('tenantId'))
        if tenant is None:
            raise PermissionDenied("Tenant context is required for this operation")
        input['tenant_id'] = str(tenant.id)
        return super().mutate_and_get_payload(root, info, **input)

    @classmethod
    def perform_mutate(cls, serializer, info):
        connection = serializer.save()
        return cls(sso_connection=connection)


@action_logged(entity_type="sso_connection", action_type=ActionType.UPDATE)
class UpdateSSOConnectionMutation(mutations.SerializerMutation):
    """Update an existing SSO connection."""

    sso_connection = graphene.Field(SSOConnectionType)

    class Meta:
        serializer_class = serializers.UpdateTenantSSOConnectionSerializer

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        if 'id' in input and input['id']:
            try:
                _, pk = from_global_id(input['id'])
                input['id'] = pk
            except (TypeError, ValueError):
                pass  # Already a hashid or invalid, pass through
        tenant = _resolve_tenant(info, input.get('tenant_id') or input.get('tenantId'))
        if tenant is not None:
            input['tenant_id'] = str(tenant.id)
        return super().mutate_and_get_payload(root, info, **input)

    @classmethod
    def perform_mutate(cls, serializer, info):
        connection = serializer.save()
        return cls(sso_connection=connection)


class DeleteSSOConnectionMutation(mutations.DeleteModelMutation):
    """Delete an SSO connection. Requires tenantId in input for tenant context."""

    class Input:
        id = graphene.String()
        tenant_id = graphene.String(required=True)

    class Meta:
        model = models.TenantSSOConnection

    @classmethod
    def mutate_and_get_payload(cls, root, info, id, **kwargs):
        tenant_id = kwargs.get('tenant_id') or kwargs.get('tenantId')
        tenant = _resolve_tenant(info, tenant_id)
        if tenant is None:
            raise PermissionDenied("Tenant context is required for this operation")

        _, pk = from_global_id(id)
        obj = get_object_or_404(
            models.TenantSSOConnection,
            pk=pk,
            tenant=tenant,
        )

        # Log the deletion
        log_delete(
            tenant_id=tenant.pk,
            entity_type="sso_connection",
            instance=obj,
            actor_user=info.context.user,
        )

        obj.delete()
        return cls(deleted_ids=[id])


class ActivateSSOConnectionMutation(mutations.SerializerMutation):
    """Activate an SSO connection."""

    sso_connection = graphene.Field(SSOConnectionType)

    class Meta:
        serializer_class = serializers.ActivateSSOConnectionSerializer

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        tenant = _resolve_tenant(info, input.get('tenant_id') or input.get('tenantId'))
        if tenant is None:
            raise PermissionDenied("Tenant context is required for this operation")
        _, pk = from_global_id(input["id"])
        input["id"] = pk
        input['tenant_id'] = str(tenant.id)

        serializer = cls._meta.serializer_class(data=input)
        serializer.is_valid(raise_exception=True)
        connection = serializer.save()

        # Log the activation
        log_action(
            tenant_id=tenant.pk,
            action_type=ActionType.ACTIVATE,
            entity_type="sso_connection",
            entity_id=str(connection.pk),
            entity_name=connection.name,
            actor_user=info.context.user,
            changes={"status": {"old": "inactive", "new": "active"}},
        )

        return cls(sso_connection=connection)


class DeactivateSSOConnectionMutation(graphene.Mutation):
    """Deactivate an SSO connection. Requires tenantId for tenant context."""

    class Arguments:
        id = graphene.ID(required=True)
        tenant_id = graphene.ID(required=True)

    sso_connection = graphene.Field(SSOConnectionType)

    @classmethod
    def mutate(cls, root, info, id, tenant_id=None):
        tenant = _resolve_tenant(info, tenant_id)
        if tenant is None:
            raise PermissionDenied("Tenant context is required for this operation")
        _, pk = from_global_id(id)
        connection = get_object_or_404(
            models.TenantSSOConnection,
            pk=pk,
            tenant=tenant,
        )
        old_status = connection.status
        connection.status = constants.SSOConnectionStatus.INACTIVE
        connection.save(update_fields=["status", "updated_at"])

        # Log the deactivation
        log_action(
            tenant_id=tenant.pk,
            action_type=ActionType.DEACTIVATE,
            entity_type="sso_connection",
            entity_id=str(connection.pk),
            entity_name=connection.name,
            actor_user=info.context.user,
            changes={"status": {"old": old_status, "new": "inactive"}},
        )

        return cls(sso_connection=connection)


class TestSSOConnectionCheckType(graphene.ObjectType):
    name = graphene.String()
    status = graphene.String()
    message = graphene.String()
    details = GenericScalar()


class TestSSOConnectionPayload(graphene.ObjectType):
    connectionId = graphene.String()
    connectionName = graphene.String()
    connectionType = graphene.String()
    overallStatus = graphene.String()
    checks = graphene.List(TestSSOConnectionCheckType)
    testedAt = graphene.String()


class TestSSOConnectionMutation(graphene.Mutation):
    """Test an SSO connection configuration."""

    class Arguments:
        id = graphene.ID(required=True)

    result = graphene.Field(TestSSOConnectionPayload)

    @classmethod
    def mutate(cls, root, info, id):
        from .services.connection_test import test_sso_connection

        _, pk = from_global_id(id)
        connection = get_object_or_404(
            models.TenantSSOConnection,
            pk=pk,
            tenant=info.context.tenant,
        )
        result = test_sso_connection(connection)
        return cls(
            result={
                "connectionId": result["connectionId"],
                "connectionName": result["connectionName"],
                "connectionType": result["connectionType"],
                "overallStatus": result["overallStatus"],
                "checks": result["checks"],
                "testedAt": result["testedAt"],
            }
        )


class TestSSOConnectionCheckType(graphene.ObjectType):
    name = graphene.String()
    status = graphene.String()
    message = graphene.String()
    details = GenericScalar()


class TestSSOConnectionPayload(graphene.ObjectType):
    connectionId = graphene.String()
    connectionName = graphene.String()
    connectionType = graphene.String()
    overallStatus = graphene.String()
    checks = graphene.List(TestSSOConnectionCheckType)
    testedAt = graphene.String()


class TestSSOConnectionMutation(graphene.Mutation):
    """Test an SSO connection configuration. Requires tenantId for tenant context."""

    class Arguments:
        id = graphene.ID(required=True)
        tenant_id = graphene.ID(required=True)

    result = graphene.Field(TestSSOConnectionPayload)

    @classmethod
    def mutate(cls, root, info, id, tenant_id=None):
        from .services.connection_test import test_sso_connection

        tenant = _resolve_tenant(info, tenant_id)
        if tenant is None:
            raise PermissionDenied("Tenant context is required for this operation")

        _, pk = from_global_id(id)
        connection = get_object_or_404(
            models.TenantSSOConnection,
            pk=pk,
            tenant=tenant,
        )
        result = test_sso_connection(connection)
        return cls(
            result={
                "connectionId": result["connectionId"],
                "connectionName": result["connectionName"],
                "connectionType": result["connectionType"],
                "overallStatus": result["overallStatus"],
                "checks": result["checks"],
                "testedAt": result["testedAt"],
            }
        )


class CreateSCIMTokenMutation(mutations.SerializerMutation):
    """Create a new SCIM token."""

    scim_token = graphene.Field(SCIMTokenType)
    raw_token = graphene.String()  # Only returned once on creation

    class Meta:
        serializer_class = serializers.CreateSCIMTokenSerializer

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        tenant = _resolve_tenant(info, input.get('tenant_id') or input.get('tenantId'))
        if tenant is None:
            raise PermissionDenied("Tenant context is required for this operation")
        input['tenant_id'] = str(tenant.id)

        if "sso_connection_id" in input and input["sso_connection_id"]:
            _, pk = from_global_id(input["sso_connection_id"])
            input["sso_connection_id"] = pk

        serializer = cls._meta.serializer_class(data=input)
        serializer.is_valid(raise_exception=True)
        token_instance, raw_token = serializer.save()

        # Log the token creation
        log_action(
            tenant_id=tenant.pk,
            action_type=ActionType.CREATE,
            entity_type="scim_token",
            entity_id=str(token_instance.pk),
            entity_name=token_instance.name,
            actor_user=info.context.user,
        )

        return cls(scim_token=token_instance, raw_token=raw_token)


class RevokeSCIMTokenMutation(graphene.Mutation):
    """Revoke a SCIM token. Requires tenantId for tenant context."""

    class Arguments:
        id = graphene.ID(required=True)
        tenant_id = graphene.ID(required=True)

    ok = graphene.Boolean()

    @classmethod
    def mutate(cls, root, info, id, tenant_id=None):
        tenant = _resolve_tenant(info, tenant_id)
        if tenant is None:
            raise PermissionDenied("Tenant context is required for this operation")

        _, pk = from_global_id(id)
        token = get_object_or_404(
            models.SCIMToken,
            pk=pk,
            tenant=tenant,
        )
        token.is_active = False
        token.save(update_fields=["is_active", "updated_at"])

        # Log the token revocation
        log_action(
            tenant_id=tenant.pk,
            action_type=ActionType.REVOKE,
            entity_type="scim_token",
            entity_id=str(token.pk),
            entity_name=token.name,
            actor_user=info.context.user,
            changes={"is_active": {"old": True, "new": False}},
        )

        return cls(ok=True)


class RevokeSessionMutation(graphene.Mutation):
    """Revoke an SSO session."""

    class Arguments:
        session_id = graphene.String(required=True)
        reason = graphene.String()

    ok = graphene.Boolean()

    @classmethod
    def mutate(cls, root, info, session_id, reason=None):
        user = get_user_from_resolver(info)
        session = get_object_or_404(
            models.SSOSession,
            session_id=session_id,
            user=user,
        )
        session.revoke(reason=reason or "User requested")

        return cls(ok=True)


class RevokeAllSessionsMutation(graphene.Mutation):
    """Revoke all SSO sessions for the current user except the current session."""

    class Arguments:
        pass

    ok = graphene.Boolean()
    revoked_count = graphene.Int()

    @classmethod
    def mutate(cls, root, info):
        from django.conf import settings

        user = get_user_from_resolver(info)

        # Get current session ID from cookie to exclude it
        request = info.context._request if hasattr(info.context, "_request") else info.context
        current_session_id = request.COOKIES.get(settings.SESSION_ID_COOKIE)

        sessions = models.SSOSession.objects.filter(
            user=user,
            is_active=True,
        )

        # Exclude current session if we have one
        if current_session_id:
            sessions = sessions.exclude(session_id=current_session_id)

        count = sessions.update(
            is_active=False,
            revoked_reason="User revoked all sessions",
        )

        return cls(ok=True, revoked_count=count)


class TrustDeviceMutation(graphene.Mutation):
    """Mark a device as trusted."""

    class Arguments:
        id = graphene.ID(required=True)

    device = graphene.Field(UserDeviceType)

    @classmethod
    def mutate(cls, root, info, id):
        _, pk = from_global_id(id)
        user = get_user_from_resolver(info)
        device = get_object_or_404(
            models.UserDevice,
            pk=pk,
            user=user,
        )
        device.trust()

        return cls(device=device)


class UntrustDeviceMutation(graphene.Mutation):
    """Remove trust from a device."""

    class Arguments:
        id = graphene.ID(required=True)

    device = graphene.Field(UserDeviceType)

    @classmethod
    def mutate(cls, root, info, id):
        _, pk = from_global_id(id)
        user = get_user_from_resolver(info)
        device = get_object_or_404(
            models.UserDevice,
            pk=pk,
            user=user,
        )
        device.untrust()

        return cls(device=device)


class BlockDeviceMutation(graphene.Mutation):
    """Block a device."""

    class Arguments:
        id = graphene.ID(required=True)
        reason = graphene.String()

    device = graphene.Field(UserDeviceType)

    @classmethod
    def mutate(cls, root, info, id, reason=None):
        _, pk = from_global_id(id)
        user = get_user_from_resolver(info)
        device = get_object_or_404(
            models.UserDevice,
            pk=pk,
            user=user,
        )
        device.block(reason=reason or "")

        return cls(device=device)


class RenamePasskeyMutation(graphene.Mutation):
    """Rename a passkey."""

    class Arguments:
        id = graphene.ID(required=True)
        name = graphene.String(required=True)

    passkey = graphene.Field(PasskeyType)

    @classmethod
    def mutate(cls, root, info, id, name):
        _, pk = from_global_id(id)
        user = get_user_from_resolver(info)
        passkey = get_object_or_404(
            models.UserPasskey,
            pk=pk,
            user=user,
            is_active=True,
        )
        passkey.name = name
        passkey.save(update_fields=["name", "updated_at"])

        return cls(passkey=passkey)


class DeletePasskeyMutation(mutations.DeleteModelMutation):
    """Delete a passkey."""

    class Meta:
        model = models.UserPasskey

    @classmethod
    def mutate_and_get_payload(cls, root, info, id, **kwargs):
        _, pk = from_global_id(id)
        user = get_user_from_resolver(info)
        passkey = get_object_or_404(
            models.UserPasskey,
            pk=pk,
            user=user,
        )
        passkey.deactivate()

        return cls(deleted_ids=[id])


class DeleteTenantPasskeyMutation(graphene.Mutation):
    """Delete a passkey as tenant admin (for any tenant member)."""

    class Arguments:
        id = graphene.ID(required=True)

    ok = graphene.Boolean()

    @classmethod
    def mutate(cls, root, info, id):
        from apps.multitenancy.models import TenantMembership

        _, pk = from_global_id(id)
        passkey = get_object_or_404(models.UserPasskey, pk=pk, is_active=True)
        tenant = info.context.tenant

        if not TenantMembership.objects.filter(tenant=tenant, user=passkey.user).exists():
            raise ValueError("Passkey does not belong to a tenant member")

        passkey.is_active = False
        passkey.save(update_fields=["is_active"])

        from .services import get_client_ip

        request = info.context._request if hasattr(info.context, "_request") else info.context
        ip_address = get_client_ip(request) if hasattr(request, "META") else None

        models.SSOAuditLog.log_event(
            event_type=constants.SSOAuditEventType.PASSKEY_REMOVED,
            tenant=tenant,
            user=passkey.user,
            description=f'Passkey "{passkey.name}" removed by admin {info.context.user.email}',
            ip_address=ip_address,
            metadata={"removed_by": info.context.user.email, "passkey_owner": passkey.user.email},
        )

        return cls(ok=True)


class DeleteTenantPasskeyMutation(graphene.Mutation):
    """Delete a passkey as tenant admin (for any tenant member). Requires tenantId for tenant context."""

    class Arguments:
        id = graphene.ID(required=True)
        tenant_id = graphene.ID(required=True)

    ok = graphene.Boolean()

    @classmethod
    def mutate(cls, root, info, id, tenant_id=None):
        tenant = _resolve_tenant(info, tenant_id)
        if tenant is None:
            raise PermissionDenied("Tenant context is required for this operation")

        from apps.multitenancy.models import TenantMembership

        _, pk = from_global_id(id)
        passkey = get_object_or_404(models.UserPasskey, pk=pk, is_active=True)

        if not TenantMembership.objects.filter(tenant=tenant, user=passkey.user).exists():
            raise ValueError("Passkey does not belong to a tenant member")

        passkey.is_active = False
        passkey.save(update_fields=["is_active"])

        from .services import get_client_ip

        request = info.context._request if hasattr(info.context, "_request") else info.context
        ip_address = get_client_ip(request) if hasattr(request, "META") else None

        models.SSOAuditLog.log_event(
            event_type=constants.SSOAuditEventType.PASSKEY_REMOVED,
            tenant=tenant,
            user=passkey.user,
            description=f'Passkey "{passkey.name}" removed by admin {info.context.user.email}',
            ip_address=ip_address,
            metadata={"removed_by": info.context.user.email, "passkey_owner": passkey.user.email},
        )

        return cls(ok=True)


# ==================
# Queries
# ==================


@permission_classes(policies.AnyoneFullAccess)
class Query(graphene.ObjectType):
    """SSO queries available to authenticated users."""

    my_passkeys = graphene.relay.ConnectionField(PasskeyConnection)
    my_sessions = graphene.relay.ConnectionField(SSOSessionConnection)
    my_devices = graphene.relay.ConnectionField(UserDeviceConnection)
    sso_discover = graphene.Field(SSODiscoveryResultType, email=graphene.String(required=True))

    @staticmethod
    def resolve_my_passkeys(root, info, **kwargs):
        user = get_user_from_resolver(info)
        if not user.is_authenticated:
            return []
        return models.UserPasskey.objects.filter(user=user, is_active=True)

    @staticmethod
    def resolve_my_sessions(root, info, **kwargs):
        user = get_user_from_resolver(info)
        if not user.is_authenticated:
            return []
        return models.SSOSession.objects.filter(user=user, is_active=True)

    @staticmethod
    def resolve_my_devices(root, info, **kwargs):
        user = get_user_from_resolver(info)
        if not user.is_authenticated:
            return []
        return models.UserDevice.objects.filter(user=user)

    @staticmethod
    def resolve_sso_discover(root, info, email):
        from django.db import models as db_models

        email = (email or "").strip().lower()
        if not email or "@" not in email:
            return {"sso_available": False, "require_sso": False, "connections": []}

        domain = email.split("@")[-1]
        connections = (
            models.TenantSSOConnection.objects.filter(
                status=constants.SSOConnectionStatus.ACTIVE,
            )
            .filter(
                db_models.Q(allowed_domains__contains=[domain])
                | db_models.Q(allowed_domains=[])
                | db_models.Q(allowed_domains__isnull=True)
            )
            .select_related("tenant")
        )

        matching_connections = []
        for conn in connections:
            tenant_domains = getattr(conn.tenant, "domains", None)
            domain_matches = tenant_domains and domain in tenant_domains
            allowed_matches = conn.allowed_domains and domain in conn.allowed_domains
            if domain_matches or allowed_matches:
                matching_connections.append(conn)

        seen_ids = set()
        unique_connections = []
        for conn in matching_connections:
            if conn.id not in seen_ids:
                seen_ids.add(conn.id)
                unique_connections.append(conn)

        if not unique_connections:
            return {"sso_available": False, "require_sso": False, "connections": []}

        require_sso = any(getattr(conn, "enforce_sso", False) for conn in unique_connections)
        from django.conf import settings

        api_url = getattr(settings, "API_URL", "http://localhost:5001")
        return {
            "sso_available": True,
            "require_sso": require_sso,
            "connections": [
                {
                    "id": str(conn.id),
                    "name": conn.name,
                    "type": conn.connection_type,
                    "tenant_id": str(conn.tenant.id),
                    "tenant_name": conn.tenant.name,
                    "login_url": f"{api_url}/api/sso/{conn.connection_type}/{conn.id}/login",
                }
                for conn in unique_connections
            ],
        }


@permission_classes(policies.IsTenantMemberAccess)
class TenantSSOQuery(graphene.ObjectType):
    """
    SSO queries for tenant members with appropriate security permissions.

    Uses RBAC permissions:
    - security.view: View SSO connections and settings
    - security.sso.manage: Full access to SSO management
    """

    sso_connections = graphene.relay.ConnectionField(
        SSOConnectionConnection,
        tenant_id=graphene.ID(required=True),
    )
    sso_connection = graphene.Field(
        SSOConnectionType,
        tenant_id=graphene.ID(required=True),
        id=graphene.ID(),
    )
    scim_tokens = graphene.relay.ConnectionField(
        SCIMTokenConnection,
        tenant_id=graphene.ID(required=True),
    )
    sso_audit_logs = graphene.relay.ConnectionField(
        SSOAuditLogConnection,
        tenant_id=graphene.ID(required=True),
        event_type=graphene.String(),
        user_email=graphene.String(),
        success=graphene.Boolean(),
        start_date=graphene.String(),
        end_date=graphene.String(),
        search=graphene.String(),
    )
    tenant_passkeys = graphene.List(
        TenantPasskeyType,
        tenant_id=graphene.ID(required=True),
        search=graphene.String(),
    )

    @staticmethod
    @permission_classes(requires("security.view"))
    def resolve_sso_connections(root, info, **kwargs):
        tenant = info.context.tenant
        if tenant is None:
            return models.TenantSSOConnection.objects.none()
        return models.TenantSSOConnection.objects.filter(tenant=tenant)

    @staticmethod
    @permission_classes(requires("security.view"))
    def resolve_sso_connection(root, info, id=None, **kwargs):
        tenant = info.context.tenant
        if tenant is None:
            return None
        _, pk = from_global_id(id) if id else (None, None)
        if not pk:
            return None
        return models.TenantSSOConnection.objects.filter(
            pk=pk,
            tenant=tenant,
        ).first()

    @staticmethod
    @permission_classes(requires("security.sso.manage"))
    def resolve_scim_tokens(root, info, **kwargs):
        tenant = info.context.tenant
        if tenant is None:
            return models.SCIMToken.objects.none()
        return models.SCIMToken.objects.filter(tenant=tenant)

    @staticmethod
    @permission_classes(requires("security.view"))
    def resolve_sso_audit_logs(
            root,
            info,
            event_type=None,
            user_email=None,
            success=None,
            start_date=None,
            end_date=None,
            search=None,
            **kwargs,
    ):
        from datetime import datetime, timedelta
        from django.utils import timezone
        from django.db import models as db_models

        tenant = info.context.tenant
        if tenant is None:
            return models.SSOAuditLog.objects.none().order_by("-created_at")
        logs = models.SSOAuditLog.objects.filter(tenant=tenant).select_related("user", "sso_connection")

        if start_date:
            try:
                start_dt = datetime.fromisoformat(start_date)
                logs = logs.filter(created_at__gte=start_dt)
            except ValueError:
                pass

        if end_date:
            try:
                end_dt = datetime.fromisoformat(end_date) + timedelta(days=1)
                logs = logs.filter(created_at__lt=end_dt)
            except ValueError:
                pass

        if not start_date and not end_date:
            default_cutoff = timezone.now() - timedelta(days=90)
            logs = logs.filter(created_at__gte=default_cutoff)

        if event_type:
            logs = logs.filter(event_type=event_type)
        if user_email:
            logs = logs.filter(user__email__icontains=user_email)
        if success is not None:
            logs = logs.filter(success=success)
        if search:
            logs = logs.filter(
                db_models.Q(event_description__icontains=search)
                | db_models.Q(user__email__icontains=search)
                | db_models.Q(ip_address__icontains=search)
            )

        return logs.order_by("-created_at")

    @staticmethod
    @permission_classes(requires("security.passkeys.manage"))
    def resolve_tenant_passkeys(root, info, tenant_id=None, search=None, **kwargs):
        from apps.multitenancy.models import TenantMembership
        from django.db.models import Q

        # Tenant is set by middleware from tenantId argument; without it we get HashidField errors
        tenant = info.context.tenant
        if tenant is None:
            return []
        tenant_members = TenantMembership.objects.filter(tenant=tenant).values_list("user_id", flat=True)
        passkeys = (
            models.UserPasskey.objects.filter(user_id__in=tenant_members, is_active=True)
            .select_related("user", "user__profile")
            .order_by("-created_at")
        )
        if search:
            search_lower = search.strip().lower()
            passkeys = passkeys.filter(
                Q(user__email__icontains=search_lower)
                | Q(user__profile__first_name__icontains=search_lower)
                | Q(user__profile__last_name__icontains=search_lower)
                | Q(name__icontains=search_lower)
            )
        return list(passkeys)


# ==================
# Mutation Groups
# ==================


@permission_classes(policies.IsAuthenticatedFullAccess)
class Mutation(graphene.ObjectType):
    """User-level SSO mutations."""

    revoke_session = RevokeSessionMutation.Field()
    revoke_all_sessions = RevokeAllSessionsMutation.Field()
    trust_device = TrustDeviceMutation.Field()
    untrust_device = UntrustDeviceMutation.Field()
    block_device = BlockDeviceMutation.Field()
    rename_passkey = RenamePasskeyMutation.Field()
    delete_passkey = DeletePasskeyMutation.Field()


@permission_classes(policies.IsTenantAdminAccess)
class TenantOwnerMutation(graphene.ObjectType):
    """
    SSO mutations with RBAC permission checks.

    Uses IsTenantAdminAccess at class level,
    with specific RBAC permissions for each mutation.

    Permissions:
    - security.sso.manage: Manage SSO connections and SCIM tokens
    """

    # SSO Connection management - requires security.sso.manage
    create_sso_connection = permission_classes(requires("security.sso.manage"))(CreateSSOConnectionMutation.Field())
    update_sso_connection = permission_classes(requires("security.sso.manage"))(UpdateSSOConnectionMutation.Field())
    delete_sso_connection = permission_classes(requires("security.sso.manage"))(DeleteSSOConnectionMutation.Field())
    activate_sso_connection = permission_classes(requires("security.sso.manage"))(ActivateSSOConnectionMutation.Field())
    deactivate_sso_connection = permission_classes(requires("security.sso.manage"))(
        DeactivateSSOConnectionMutation.Field()
    )
    test_sso_connection = permission_classes(requires("security.sso.manage"))(TestSSOConnectionMutation.Field())

    # SCIM Token management - requires security.sso.manage
    create_scim_token = permission_classes(requires("security.sso.manage"))(CreateSCIMTokenMutation.Field())
    revoke_scim_token = permission_classes(requires("security.sso.manage"))(RevokeSCIMTokenMutation.Field())

    # Passkey management (tenant admin) - requires security.passkeys.manage
    delete_tenant_passkey = permission_classes(requires("security.passkeys.manage"))(
        DeleteTenantPasskeyMutation.Field()
    )
