"""
SSO URL configuration.
"""

from django.urls import path

from . import views

urlpatterns = [
    # SSO Discovery (for login page)
    path('discover', views.SSODiscoverView.as_view(), name='sso-discover'),
    path('login-options', views.SSOLoginOptionsView.as_view(), name='sso-login-options'),
    # SSO Connection Management endpoints (tenant scoped)
    path('tenant/<str:tenant_id>/connections/', views.SSOConnectionListView.as_view(), name='sso-connection-list'),
    path(
        'tenant/<str:tenant_id>/connections/<str:connection_id>',
        views.SSOConnectionDetailView.as_view(),
        name='sso-connection-detail',
    ),
    path(
        'tenant/<str:tenant_id>/connections/<str:connection_id>/activate',
        views.SSOConnectionActivateView.as_view(),
        name='sso-connection-activate',
    ),
    path(
        'tenant/<str:tenant_id>/connections/<str:connection_id>/deactivate',
        views.SSOConnectionDeactivateView.as_view(),
        name='sso-connection-deactivate',
    ),
    path(
        'tenant/<str:tenant_id>/connections/<str:connection_id>/test',
        views.SSOConnectionTestView.as_view(),
        name='sso-connection-test',
    ),
    # SAML endpoints
    path('saml/<str:connection_id>/metadata', views.SAMLMetadataView.as_view(), name='saml-metadata'),
    path('saml/<str:connection_id>/login', views.SAMLLoginView.as_view(), name='saml-login'),
    path('saml/<str:connection_id>/acs', views.SAMLACSView.as_view(), name='saml-acs'),
    # OIDC endpoints
    path('oidc/<str:connection_id>/login', views.OIDCLoginView.as_view(), name='oidc-login'),
    path('oidc/<str:connection_id>/callback', views.OIDCCallbackView.as_view(), name='oidc-callback'),
    # SCIM endpoints
    path('scim/v2/Users', views.SCIMUsersView.as_view(), name='scim-users'),
    path('scim/v2/Users/<str:user_id>', views.SCIMUserDetailView.as_view(), name='scim-user-detail'),
    path('scim/v2/Groups', views.SCIMGroupsView.as_view(), name='scim-groups'),
    path('scim/v2/Groups/<str:group_id>', views.SCIMGroupDetailView.as_view(), name='scim-group-detail'),
    # WebAuthn/Passkey endpoints
    path('passkeys/register/options', views.PasskeyRegistrationOptionsView.as_view(), name='passkey-register-options'),
    path('passkeys/register/verify', views.PasskeyRegistrationVerifyView.as_view(), name='passkey-register-verify'),
    path(
        'passkeys/authenticate/options', views.PasskeyAuthenticationOptionsView.as_view(), name='passkey-auth-options'
    ),
    path('passkeys/authenticate/verify', views.PasskeyAuthenticationVerifyView.as_view(), name='passkey-auth-verify'),
    path('passkeys/', views.PasskeyListView.as_view(), name='passkey-list'),
    path('passkeys/<str:passkey_id>', views.PasskeyDeleteView.as_view(), name='passkey-delete'),
    # Tenant Passkeys Management (for owners/admins)
    path('tenant/<str:tenant_id>/passkeys/', views.TenantPasskeyListView.as_view(), name='tenant-passkey-list'),
    path(
        'tenant/<str:tenant_id>/passkeys/<str:passkey_id>',
        views.TenantPasskeyListView.as_view(),
        name='tenant-passkey-delete',
    ),
    # SCIM Token Management
    path('tenant/<str:tenant_id>/scim-tokens/', views.SCIMTokenListView.as_view(), name='scim-token-list'),
    path(
        'tenant/<str:tenant_id>/scim-tokens/<str:token_id>',
        views.SCIMTokenDetailView.as_view(),
        name='scim-token-detail',
    ),
    # Audit Log endpoints
    path('tenant/<str:tenant_id>/audit-logs/', views.AuditLogListView.as_view(), name='audit-log-list'),
]
