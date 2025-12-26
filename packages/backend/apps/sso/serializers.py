from rest_framework import serializers
from django.utils import timezone
from hashid_field.rest import HashidSerializerCharField

from apps.multitenancy.constants import TenantUserRole
from . import models
from . import constants


class TenantSSOConnectionSerializer(serializers.ModelSerializer):
    """Serializer for SSO connection configuration."""
    
    id = HashidSerializerCharField(source_field='sso.TenantSSOConnection.id', read_only=True)
    tenant_id = serializers.CharField(write_only=True)
    
    class Meta:
        model = models.TenantSSOConnection
        fields = [
            'id', 'tenant_id', 'name', 'connection_type', 'status',
            'allowed_domains', 'jit_provisioning_enabled', 'group_role_mapping',
            # SAML fields
            'saml_entity_id', 'saml_sso_url', 'saml_slo_url', 'saml_name_id_format',
            'saml_want_assertions_signed', 'saml_want_response_signed', 'saml_attribute_mapping',
            # OIDC fields
            'oidc_issuer', 'oidc_client_id', 'oidc_authorization_endpoint',
            'oidc_token_endpoint', 'oidc_userinfo_endpoint', 'oidc_jwks_uri',
            'oidc_scopes', 'oidc_claim_mapping',
            # Metadata
            'sp_metadata_xml', 'metadata_last_updated',
            # Stats
            'last_login_at', 'login_count',
            # Timestamps
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'sp_metadata_xml', 'metadata_last_updated',
            'last_login_at', 'login_count', 'created_at', 'updated_at',
        ]
    
    def validate_connection_type(self, value):
        """Validate connection type is a valid choice."""
        if value not in dict(constants.IdentityProviderType.choices):
            raise serializers.ValidationError(
                f"Invalid connection type. Must be one of: {list(dict(constants.IdentityProviderType.choices).keys())}"
            )
        return value
    
    def validate_group_role_mapping(self, value):
        """Validate group-to-role mapping."""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Group role mapping must be a dictionary.")
        
        valid_roles = [r[0] for r in TenantUserRole.choices]
        for group, role in value.items():
            if role not in valid_roles:
                raise serializers.ValidationError(
                    f"Invalid role '{role}' for group '{group}'. Must be one of: {valid_roles}"
                )
        return value
    
    def validate_allowed_domains(self, value):
        """Validate allowed domains list."""
        if not isinstance(value, list):
            raise serializers.ValidationError("Allowed domains must be a list.")
        
        for domain in value:
            if not isinstance(domain, str) or not domain:
                raise serializers.ValidationError("Each domain must be a non-empty string.")
            # Basic domain validation
            if ' ' in domain or not '.' in domain:
                raise serializers.ValidationError(f"Invalid domain format: {domain}")
        
        return [d.lower().strip() for d in value]
    
    def validate(self, attrs):
        """Cross-field validation based on connection type."""
        connection_type = attrs.get('connection_type', getattr(self.instance, 'connection_type', None))
        
        if connection_type == constants.IdentityProviderType.SAML:
            # For SAML, require essential fields
            if not attrs.get('saml_entity_id') and not getattr(self.instance, 'saml_entity_id', None):
                raise serializers.ValidationError({
                    'saml_entity_id': 'SAML Entity ID is required for SAML connections.'
                })
            if not attrs.get('saml_sso_url') and not getattr(self.instance, 'saml_sso_url', None):
                raise serializers.ValidationError({
                    'saml_sso_url': 'SAML SSO URL is required for SAML connections.'
                })
        
        elif connection_type == constants.IdentityProviderType.OIDC:
            # For OIDC, require essential fields
            required_oidc = ['oidc_issuer', 'oidc_client_id']
            for field in required_oidc:
                if not attrs.get(field) and not getattr(self.instance, field, None):
                    raise serializers.ValidationError({
                        field: f'{field} is required for OIDC connections.'
                    })
        
        return attrs
    
    def create(self, validated_data):
        from apps.multitenancy.models import Tenant
        
        tenant_id = validated_data.pop('tenant_id')
        tenant = Tenant.objects.get(pk=tenant_id)
        
        return models.TenantSSOConnection.objects.create(
            tenant=tenant,
            **validated_data
        )


class ActivateSSOConnectionSerializer(serializers.Serializer):
    """Serializer for activating an SSO connection."""
    
    id = serializers.CharField()
    tenant_id = serializers.CharField()
    
    def validate(self, attrs):
        from apps.multitenancy.models import Tenant
        
        try:
            tenant = Tenant.objects.get(pk=attrs['tenant_id'])
        except Tenant.DoesNotExist:
            raise serializers.ValidationError({'tenant_id': 'Tenant not found.'})
        
        try:
            connection = models.TenantSSOConnection.objects.get(
                pk=attrs['id'],
                tenant=tenant
            )
        except models.TenantSSOConnection.DoesNotExist:
            raise serializers.ValidationError({'id': 'SSO connection not found.'})
        
        attrs['tenant'] = tenant
        attrs['connection'] = connection
        
        return attrs
    
    def save(self):
        connection = self.validated_data['connection']
        tenant = self.validated_data['tenant']
        
        # Deactivate any existing active connections
        models.TenantSSOConnection.objects.filter(
            tenant=tenant,
            status=constants.SSOConnectionStatus.ACTIVE
        ).exclude(pk=connection.pk).update(status=constants.SSOConnectionStatus.INACTIVE)
        
        # Activate this connection
        connection.status = constants.SSOConnectionStatus.ACTIVE
        connection.save(update_fields=['status', 'updated_at'])
        
        return connection


class CreateSCIMTokenSerializer(serializers.Serializer):
    """Serializer for creating a SCIM token."""
    
    tenant_id = serializers.CharField()
    name = serializers.CharField(max_length=255)
    sso_connection_id = serializers.CharField(required=False, allow_null=True)
    expires_in_days = serializers.IntegerField(required=False, min_value=1, max_value=365)
    
    def validate(self, attrs):
        from apps.multitenancy.models import Tenant
        
        try:
            tenant = Tenant.objects.get(pk=attrs['tenant_id'])
        except Tenant.DoesNotExist:
            raise serializers.ValidationError({'tenant_id': 'Tenant not found.'})
        
        attrs['tenant'] = tenant
        
        if attrs.get('sso_connection_id'):
            try:
                connection = models.TenantSSOConnection.objects.get(
                    pk=attrs['sso_connection_id'],
                    tenant=tenant
                )
                attrs['sso_connection'] = connection
            except models.TenantSSOConnection.DoesNotExist:
                raise serializers.ValidationError({'sso_connection_id': 'SSO connection not found.'})
        
        return attrs
    
    def save(self):
        token_instance, raw_token = models.SCIMToken.create_for_tenant(
            tenant=self.validated_data['tenant'],
            name=self.validated_data['name'],
            sso_connection=self.validated_data.get('sso_connection'),
            expires_in_days=self.validated_data.get('expires_in_days'),
        )
        
        return token_instance, raw_token


class SCIMTokenSerializer(serializers.ModelSerializer):
    """Serializer for viewing SCIM tokens (without the actual token)."""
    
    id = HashidSerializerCharField(source_field='sso.SCIMToken.id', read_only=True)
    is_valid = serializers.BooleanField(read_only=True)
    is_expired = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = models.SCIMToken
        fields = [
            'id', 'name', 'token_prefix', 'is_active', 'is_valid', 'is_expired',
            'expires_at', 'last_used_at', 'last_used_ip', 'request_count',
            'created_at', 'updated_at',
        ]
        read_only_fields = fields


class SSOSessionSerializer(serializers.ModelSerializer):
    """Serializer for SSO sessions."""
    
    id = HashidSerializerCharField(source_field='sso.SSOSession.id', read_only=True)
    is_valid = serializers.BooleanField(read_only=True)
    is_expired = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = models.SSOSession
        fields = [
            'id', 'session_id', 'device_name', 'device_type', 'browser',
            'operating_system', 'ip_address', 'location', 'is_active',
            'is_current', 'is_valid', 'is_expired', 'last_activity_at',
            'expires_at', 'created_at',
        ]
        read_only_fields = fields


class RevokeSessionSerializer(serializers.Serializer):
    """Serializer for revoking a session."""
    
    session_id = serializers.CharField()
    reason = serializers.CharField(required=False, default='User requested')
    
    def validate_session_id(self, value):
        try:
            session = models.SSOSession.objects.get(session_id=value)
        except models.SSOSession.DoesNotExist:
            raise serializers.ValidationError('Session not found.')
        
        self._session = session
        return value
    
    def save(self, user):
        # Verify user owns this session or is admin
        if self._session.user != user:
            raise serializers.ValidationError('Cannot revoke sessions for other users.')
        
        self._session.revoke(reason=self.validated_data.get('reason', 'User requested'))
        return self._session


class UserDeviceSerializer(serializers.ModelSerializer):
    """Serializer for user devices."""
    
    id = HashidSerializerCharField(source_field='sso.UserDevice.id', read_only=True)
    
    class Meta:
        model = models.UserDevice
        fields = [
            'id', 'device_id', 'device_name', 'device_type', 'browser',
            'operating_system', 'is_trusted', 'trusted_at', 'last_seen_at',
            'last_ip_address', 'last_location', 'is_blocked', 'created_at',
        ]
        read_only_fields = fields


class UserPasskeySerializer(serializers.ModelSerializer):
    """Serializer for passkeys."""
    
    id = HashidSerializerCharField(source_field='sso.UserPasskey.id', read_only=True)
    
    class Meta:
        model = models.UserPasskey
        fields = [
            'id', 'name', 'authenticator_type', 'transports', 'is_active',
            'last_used_at', 'use_count', 'device_type', 'created_at',
        ]
        read_only_fields = [
            'id', 'authenticator_type', 'transports', 'is_active',
            'last_used_at', 'use_count', 'device_type', 'created_at',
        ]


class RegisterPasskeySerializer(serializers.Serializer):
    """Serializer for passkey registration."""
    
    name = serializers.CharField(max_length=255)
    credential_id = serializers.CharField()
    public_key = serializers.CharField()
    attestation_object = serializers.CharField()
    client_data_json = serializers.CharField()
    transports = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        default=list
    )


class VerifyPasskeySerializer(serializers.Serializer):
    """Serializer for passkey verification during authentication."""
    
    credential_id = serializers.CharField()
    authenticator_data = serializers.CharField()
    client_data_json = serializers.CharField()
    signature = serializers.CharField()


class SSOAuditLogSerializer(serializers.ModelSerializer):
    """Serializer for SSO audit logs."""
    
    id = HashidSerializerCharField(source_field='sso.SSOAuditLog.id', read_only=True)
    user_email = serializers.SerializerMethodField()
    connection_name = serializers.SerializerMethodField()
    
    class Meta:
        model = models.SSOAuditLog
        fields = [
            'id', 'event_type', 'event_description', 'user_email',
            'connection_name', 'ip_address', 'success', 'error_message',
            'metadata', 'created_at',
        ]
        read_only_fields = fields
    
    def get_user_email(self, obj):
        return obj.user.email if obj.user else None
    
    def get_connection_name(self, obj):
        return obj.sso_connection.name if obj.sso_connection else None

