"""
GraphQL schema for Enterprise SSO management.
"""

import graphene
from graphene import relay
from graphene_django import DjangoObjectType
from graphql_relay import to_global_id, from_global_id
from django.shortcuts import get_object_or_404

from common.acl import policies
from common.graphql import mutations
from common.graphql.acl.decorators import permission_classes
from apps.users.services.users import get_user_from_resolver
from . import models
from . import serializers
from . import constants


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
    
    class Meta:
        model = models.TenantSSOConnection
        fields = [
            'id', 'name', 'connection_type', 'status', 'allowed_domains',
            'jit_provisioning_enabled', 'group_role_mapping',
            # SAML
            'saml_entity_id', 'saml_sso_url', 'saml_slo_url', 'saml_name_id_format',
            'saml_want_assertions_signed', 'saml_want_response_signed', 'saml_attribute_mapping',
            # OIDC
            'oidc_issuer', 'oidc_client_id', 'oidc_authorization_endpoint',
            'oidc_token_endpoint', 'oidc_userinfo_endpoint', 'oidc_jwks_uri',
            'oidc_scopes', 'oidc_claim_mapping',
            # Stats
            'last_login_at', 'login_count',
            'created_at', 'updated_at',
        ]
        interfaces = (relay.Node,)
    
    def resolve_id(self, info):
        return to_global_id('SSOConnectionType', self.id)
    
    def resolve_sp_metadata_url(self, info):
        from django.conf import settings
        if self.is_saml:
            api_url = getattr(settings, 'API_URL', 'http://localhost:5001')
            return f"{api_url}/api/sso/saml/{self.id}/metadata"
        return None


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
            'id', 'name', 'token_prefix', 'is_active', 'expires_at',
            'last_used_at', 'last_used_ip', 'request_count',
            'created_at', 'updated_at',
        ]
        interfaces = (relay.Node,)
    
    def resolve_id(self, info):
        return to_global_id('SCIMTokenType', self.id)


class SCIMTokenConnection(graphene.Connection):
    class Meta:
        node = SCIMTokenType


class SSOSessionType(DjangoObjectType):
    """GraphQL type for SSO sessions."""
    
    id = graphene.ID(required=True)
    is_valid = graphene.Boolean()
    is_expired = graphene.Boolean()
    
    class Meta:
        model = models.SSOSession
        fields = [
            'id', 'device_name', 'device_type', 'browser', 'operating_system',
            'ip_address', 'location', 'is_active', 'is_current',
            'last_activity_at', 'expires_at', 'created_at',
        ]
        interfaces = (relay.Node,)
    
    def resolve_id(self, info):
        return to_global_id('SSOSessionType', self.id)


class SSOSessionConnection(graphene.Connection):
    class Meta:
        node = SSOSessionType


class UserDeviceType(DjangoObjectType):
    """GraphQL type for user devices."""
    
    id = graphene.ID(required=True)
    
    class Meta:
        model = models.UserDevice
        fields = [
            'id', 'device_name', 'device_type', 'browser', 'operating_system',
            'is_trusted', 'trusted_at', 'last_seen_at', 'last_ip_address',
            'last_location', 'is_blocked', 'created_at',
        ]
        interfaces = (relay.Node,)
    
    def resolve_id(self, info):
        return to_global_id('UserDeviceType', self.id)


class UserDeviceConnection(graphene.Connection):
    class Meta:
        node = UserDeviceType


class PasskeyType(DjangoObjectType):
    """GraphQL type for passkeys."""
    
    id = graphene.ID(required=True)
    
    class Meta:
        model = models.UserPasskey
        fields = [
            'id', 'name', 'authenticator_type', 'transports', 'is_active',
            'last_used_at', 'use_count', 'device_type', 'created_at',
        ]
        interfaces = (relay.Node,)
    
    def resolve_id(self, info):
        return to_global_id('PasskeyType', self.id)


class PasskeyConnection(graphene.Connection):
    class Meta:
        node = PasskeyType


class SSOAuditLogType(DjangoObjectType):
    """GraphQL type for SSO audit logs."""
    
    id = graphene.ID(required=True)
    user_email = graphene.String()
    connection_name = graphene.String()
    
    class Meta:
        model = models.SSOAuditLog
        fields = [
            'id', 'event_type', 'event_description', 'ip_address',
            'success', 'error_message', 'metadata', 'created_at',
        ]
        interfaces = (relay.Node,)
    
    def resolve_id(self, info):
        return to_global_id('SSOAuditLogType', self.id)
    
    def resolve_user_email(self, info):
        return self.user.email if self.user else None
    
    def resolve_connection_name(self, info):
        return self.sso_connection.name if self.sso_connection else None


class SSOAuditLogConnection(graphene.Connection):
    class Meta:
        node = SSOAuditLogType


# ==================
# Mutations
# ==================

class CreateSSOConnectionMutation(mutations.SerializerMutation):
    """Create a new SSO connection."""
    
    sso_connection = graphene.Field(SSOConnectionType)
    
    class Meta:
        serializer_class = serializers.TenantSSOConnectionSerializer
    
    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        input['tenant_id'] = str(info.context.tenant.id)
        return super().mutate_and_get_payload(root, info, **input)


class UpdateSSOConnectionMutation(mutations.SerializerMutation):
    """Update an existing SSO connection."""
    
    sso_connection = graphene.Field(SSOConnectionType)
    
    class Meta:
        serializer_class = serializers.TenantSSOConnectionSerializer


class DeleteSSOConnectionMutation(mutations.DeleteModelMutation):
    """Delete an SSO connection."""
    
    class Meta:
        model = models.TenantSSOConnection
    
    @classmethod
    def mutate_and_get_payload(cls, root, info, id, **kwargs):
        _, pk = from_global_id(id)
        obj = get_object_or_404(
            models.TenantSSOConnection,
            pk=pk,
            tenant=info.context.tenant,
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
        _, pk = from_global_id(input['id'])
        input['id'] = pk
        input['tenant_id'] = str(info.context.tenant.id)
        
        serializer = cls._meta.serializer_class(data=input)
        serializer.is_valid(raise_exception=True)
        connection = serializer.save()
        
        return cls(sso_connection=connection)


class DeactivateSSOConnectionMutation(graphene.Mutation):
    """Deactivate an SSO connection."""
    
    class Arguments:
        id = graphene.ID(required=True)
    
    sso_connection = graphene.Field(SSOConnectionType)
    
    @classmethod
    def mutate(cls, root, info, id):
        _, pk = from_global_id(id)
        connection = get_object_or_404(
            models.TenantSSOConnection,
            pk=pk,
            tenant=info.context.tenant,
        )
        connection.status = constants.SSOConnectionStatus.INACTIVE
        connection.save(update_fields=['status', 'updated_at'])
        
        return cls(sso_connection=connection)


class CreateSCIMTokenMutation(mutations.SerializerMutation):
    """Create a new SCIM token."""
    
    scim_token = graphene.Field(SCIMTokenType)
    raw_token = graphene.String()  # Only returned once on creation
    
    class Meta:
        serializer_class = serializers.CreateSCIMTokenSerializer
    
    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        input['tenant_id'] = str(info.context.tenant.id)
        
        if 'sso_connection_id' in input and input['sso_connection_id']:
            _, pk = from_global_id(input['sso_connection_id'])
            input['sso_connection_id'] = pk
        
        serializer = cls._meta.serializer_class(data=input)
        serializer.is_valid(raise_exception=True)
        token_instance, raw_token = serializer.save()
        
        return cls(scim_token=token_instance, raw_token=raw_token)


class RevokeSCIMTokenMutation(graphene.Mutation):
    """Revoke a SCIM token."""
    
    class Arguments:
        id = graphene.ID(required=True)
    
    ok = graphene.Boolean()
    
    @classmethod
    def mutate(cls, root, info, id):
        _, pk = from_global_id(id)
        token = get_object_or_404(
            models.SCIMToken,
            pk=pk,
            tenant=info.context.tenant,
        )
        token.is_active = False
        token.save(update_fields=['is_active', 'updated_at'])
        
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
        session.revoke(reason=reason or 'User requested')
        
        return cls(ok=True)


class RevokeAllSessionsMutation(graphene.Mutation):
    """Revoke all SSO sessions for the current user."""
    
    class Arguments:
        pass
    
    ok = graphene.Boolean()
    revoked_count = graphene.Int()
    
    @classmethod
    def mutate(cls, root, info):
        user = get_user_from_resolver(info)
        count = models.SSOSession.objects.filter(
            user=user,
            is_active=True,
        ).update(
            is_active=False,
            revoked_reason='User revoked all sessions',
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
        device.block(reason=reason or '')
        
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
        passkey.save(update_fields=['name', 'updated_at'])
        
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


# ==================
# Queries
# ==================

@permission_classes(policies.AnyoneFullAccess)
class Query(graphene.ObjectType):
    """SSO queries available to authenticated users."""
    
    # User's own data
    my_passkeys = graphene.relay.ConnectionField(PasskeyConnection)
    my_sessions = graphene.relay.ConnectionField(SSOSessionConnection)
    my_devices = graphene.relay.ConnectionField(UserDeviceConnection)
    
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


@permission_classes(policies.IsTenantOwnerAccess)
class TenantSSOQuery(graphene.ObjectType):
    """SSO queries for tenant owners."""
    
    sso_connections = graphene.relay.ConnectionField(SSOConnectionConnection)
    sso_connection = graphene.Field(SSOConnectionType, id=graphene.ID())
    scim_tokens = graphene.relay.ConnectionField(SCIMTokenConnection)
    sso_audit_logs = graphene.relay.ConnectionField(SSOAuditLogConnection)
    
    @staticmethod
    def resolve_sso_connections(root, info, **kwargs):
        return models.TenantSSOConnection.objects.filter(tenant=info.context.tenant)
    
    @staticmethod
    def resolve_sso_connection(root, info, id):
        _, pk = from_global_id(id)
        return models.TenantSSOConnection.objects.filter(
            pk=pk,
            tenant=info.context.tenant,
        ).first()
    
    @staticmethod
    def resolve_scim_tokens(root, info, **kwargs):
        return models.SCIMToken.objects.filter(tenant=info.context.tenant)
    
    @staticmethod
    def resolve_sso_audit_logs(root, info, **kwargs):
        return models.SSOAuditLog.objects.filter(tenant=info.context.tenant)[:100]


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


@permission_classes(policies.IsTenantOwnerAccess)
class TenantOwnerMutation(graphene.ObjectType):
    """SSO mutations for tenant owners."""
    
    create_sso_connection = CreateSSOConnectionMutation.Field()
    update_sso_connection = UpdateSSOConnectionMutation.Field()
    delete_sso_connection = DeleteSSOConnectionMutation.Field()
    activate_sso_connection = ActivateSSOConnectionMutation.Field()
    deactivate_sso_connection = DeactivateSSOConnectionMutation.Field()
    create_scim_token = CreateSCIMTokenMutation.Field()
    revoke_scim_token = RevokeSCIMTokenMutation.Field()

