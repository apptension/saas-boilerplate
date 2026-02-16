"""
SSO URL configuration.
"""

from django.urls import path

from . import views

urlpatterns = [
    # SAML endpoints
    path("saml/<str:connection_id>/metadata", views.SAMLMetadataView.as_view(), name="saml-metadata"),
    path("saml/<str:connection_id>/login", views.SAMLLoginView.as_view(), name="saml-login"),
    path("saml/<str:connection_id>/acs", views.SAMLACSView.as_view(), name="saml-acs"),
    # OIDC endpoints
    path("oidc/<str:connection_id>/login", views.OIDCLoginView.as_view(), name="oidc-login"),
    path("oidc/<str:connection_id>/callback", views.OIDCCallbackView.as_view(), name="oidc-callback"),
    # SCIM endpoints
    path("scim/v2/Users", views.SCIMUsersView.as_view(), name="scim-users"),
    path("scim/v2/Users/<str:user_id>", views.SCIMUserDetailView.as_view(), name="scim-user-detail"),
    path("scim/v2/Groups", views.SCIMGroupsView.as_view(), name="scim-groups"),
    path("scim/v2/Groups/<str:group_id>", views.SCIMGroupDetailView.as_view(), name="scim-group-detail"),
    # WebAuthn/Passkey endpoints
    path("passkeys/register/options", views.PasskeyRegistrationOptionsView.as_view(), name="passkey-register-options"),
    path("passkeys/register/verify", views.PasskeyRegistrationVerifyView.as_view(), name="passkey-register-verify"),
    path(
        "passkeys/authenticate/options", views.PasskeyAuthenticationOptionsView.as_view(), name="passkey-auth-options"
    ),
    path("passkeys/authenticate/verify", views.PasskeyAuthenticationVerifyView.as_view(), name="passkey-auth-verify"),
    path("tenant/<str:tenant_id>/audit-logs/", views.AuditLogListView.as_view(), name="audit-log-list"),
]
