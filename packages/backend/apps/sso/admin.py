"""
Django admin configuration for SSO models.
"""

from django.contrib import admin
from .models import (
    TenantSSOConnection,
    SCIMToken,
    SSOUserLink,
    SSOSession,
    UserDevice,
    UserPasskey,
    WebAuthnChallenge,
    SSOAuditLog,
)


@admin.register(TenantSSOConnection)
class TenantSSOConnectionAdmin(admin.ModelAdmin):
    list_display = ['name', 'tenant', 'connection_type', 'status', 'last_login_at', 'login_count']
    list_filter = ['connection_type', 'status', 'jit_provisioning_enabled']
    search_fields = ['name', 'tenant__name', 'saml_entity_id', 'oidc_issuer']
    readonly_fields = ['created_at', 'updated_at', 'login_count', 'last_login_at']
    
    fieldsets = (
        ('Basic', {
            'fields': ('tenant', 'name', 'connection_type', 'status')
        }),
        ('Access Control', {
            'fields': ('allowed_domains', 'jit_provisioning_enabled', 'group_role_mapping')
        }),
        ('SAML Configuration', {
            'fields': (
                'saml_entity_id', 'saml_sso_url', 'saml_slo_url', 'saml_name_id_format',
                'saml_certificate_arn', 'saml_signing_certificate_arn',
                'saml_want_assertions_signed', 'saml_want_response_signed',
                'saml_attribute_mapping',
            ),
            'classes': ('collapse',),
        }),
        ('OIDC Configuration', {
            'fields': (
                'oidc_issuer', 'oidc_client_id', 'oidc_client_secret_arn',
                'oidc_authorization_endpoint', 'oidc_token_endpoint',
                'oidc_userinfo_endpoint', 'oidc_jwks_uri', 'oidc_scopes',
                'oidc_claim_mapping',
            ),
            'classes': ('collapse',),
        }),
        ('Metadata', {
            'fields': ('idp_metadata_xml', 'sp_metadata_xml', 'metadata_last_updated'),
            'classes': ('collapse',),
        }),
        ('Statistics', {
            'fields': ('login_count', 'last_login_at', 'created_at', 'updated_at'),
        }),
    )


@admin.register(SCIMToken)
class SCIMTokenAdmin(admin.ModelAdmin):
    list_display = ['name', 'tenant', 'token_prefix', 'is_active', 'expires_at', 'last_used_at']
    list_filter = ['is_active', 'tenant']
    search_fields = ['name', 'tenant__name', 'token_prefix']
    readonly_fields = ['token_hash', 'token_prefix', 'created_at', 'updated_at', 'last_used_at', 'request_count']


@admin.register(SSOUserLink)
class SSOUserLinkAdmin(admin.ModelAdmin):
    list_display = ['user', 'sso_connection', 'idp_user_id', 'provisioned_via_jit', 'last_login_at']
    list_filter = ['provisioned_via_jit', 'provisioned_via_scim', 'sso_connection__tenant']
    search_fields = ['user__email', 'idp_user_id', 'idp_email']
    readonly_fields = ['created_at', 'updated_at', 'last_login_at', 'login_count']


@admin.register(SSOSession)
class SSOSessionAdmin(admin.ModelAdmin):
    list_display = ['user', 'device_name', 'is_active', 'ip_address', 'last_activity_at']
    list_filter = ['is_active', 'device_type']
    search_fields = ['user__email', 'device_name', 'ip_address']
    readonly_fields = ['session_id', 'created_at', 'last_activity_at']


@admin.register(UserDevice)
class UserDeviceAdmin(admin.ModelAdmin):
    list_display = ['user', 'device_name', 'device_type', 'is_trusted', 'is_blocked', 'last_seen_at']
    list_filter = ['is_trusted', 'is_blocked', 'device_type']
    search_fields = ['user__email', 'device_name']
    readonly_fields = ['device_id', 'created_at', 'updated_at', 'last_seen_at']


@admin.register(UserPasskey)
class UserPasskeyAdmin(admin.ModelAdmin):
    list_display = ['user', 'name', 'authenticator_type', 'is_active', 'last_used_at', 'use_count']
    list_filter = ['is_active', 'authenticator_type']
    search_fields = ['user__email', 'name']
    readonly_fields = ['credential_id', 'public_key', 'sign_count', 'created_at', 'updated_at']


@admin.register(WebAuthnChallenge)
class WebAuthnChallengeAdmin(admin.ModelAdmin):
    list_display = ['user', 'challenge_type', 'expires_at', 'used_at']
    list_filter = ['challenge_type']
    readonly_fields = ['challenge', 'created_at']


@admin.register(SSOAuditLog)
class SSOAuditLogAdmin(admin.ModelAdmin):
    list_display = ['event_type', 'user', 'tenant', 'success', 'ip_address', 'created_at']
    list_filter = ['event_type', 'success', 'tenant']
    search_fields = ['user__email', 'event_description', 'ip_address']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'

