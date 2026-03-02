"""
Factory classes for SSO tests.
"""

import secrets
import factory
from factory.django import DjangoModelFactory
from django.utils import timezone
from datetime import timedelta

from apps.users.tests.factories import UserFactory
from apps.multitenancy.tests.factories import TenantFactory
from apps.sso import models, constants


class TenantSSOConnectionFactory(DjangoModelFactory):
    class Meta:
        model = models.TenantSSOConnection

    tenant = factory.SubFactory(TenantFactory)
    name = factory.Sequence(lambda n: f"SSO Connection {n}")
    connection_type = constants.IdentityProviderType.SAML
    status = constants.SSOConnectionStatus.DRAFT
    allowed_domains = factory.LazyFunction(list)
    jit_provisioning_enabled = True
    group_role_mapping = factory.LazyFunction(dict)

    # SAML defaults
    saml_entity_id = factory.Sequence(lambda n: f"https://idp{n}.example.com")
    saml_sso_url = factory.Sequence(lambda n: f"https://idp{n}.example.com/sso")
    saml_name_id_format = constants.SAMLNameIdFormat.EMAIL


class OIDCSSOConnectionFactory(TenantSSOConnectionFactory):
    connection_type = constants.IdentityProviderType.OIDC
    saml_entity_id = ""
    saml_sso_url = ""
    oidc_issuer = factory.Sequence(lambda n: f"https://idp{n}.example.com")
    oidc_client_id = factory.Sequence(lambda n: f"client_{n}")
    oidc_scopes = "openid email profile"


class SCIMTokenFactory(DjangoModelFactory):
    class Meta:
        model = models.SCIMToken

    tenant = factory.SubFactory(TenantFactory)
    name = factory.Sequence(lambda n: f"SCIM Token {n}")
    token_hash = factory.LazyFunction(lambda: secrets.token_hex(32))
    token_prefix = factory.LazyFunction(lambda: secrets.token_urlsafe(4)[:8])
    is_active = True


class SSOUserLinkFactory(DjangoModelFactory):
    class Meta:
        model = models.SSOUserLink

    user = factory.SubFactory(UserFactory)
    sso_connection = factory.SubFactory(TenantSSOConnectionFactory)
    idp_user_id = factory.Sequence(lambda n: f"idp_user_{n}")
    idp_email = factory.LazyAttribute(lambda obj: obj.user.email)
    provisioned_via_jit = True


class SSOSessionFactory(DjangoModelFactory):
    class Meta:
        model = models.SSOSession

    user = factory.SubFactory(UserFactory)
    session_id = factory.LazyFunction(lambda: secrets.token_urlsafe(64))
    device_name = "Test Device"
    device_type = "desktop"
    browser = "Chrome"
    operating_system = "macOS"
    ip_address = "192.168.1.1"
    is_active = True
    expires_at = factory.LazyFunction(lambda: timezone.now() + timedelta(days=7))


class UserDeviceFactory(DjangoModelFactory):
    class Meta:
        model = models.UserDevice

    user = factory.SubFactory(UserFactory)
    device_id = factory.LazyFunction(lambda: secrets.token_urlsafe(32))
    device_name = "Test Device"
    device_type = "desktop"
    browser = "Chrome"
    operating_system = "macOS"


class UserPasskeyFactory(DjangoModelFactory):
    class Meta:
        model = models.UserPasskey

    user = factory.SubFactory(UserFactory)
    credential_id = factory.LazyFunction(lambda: secrets.token_urlsafe(32))
    name = factory.Sequence(lambda n: f"Passkey {n}")
    public_key = factory.LazyFunction(lambda: secrets.token_urlsafe(64))
    sign_count = 0
    authenticator_type = "platform"
    is_active = True


class WebAuthnChallengeFactory(DjangoModelFactory):
    class Meta:
        model = models.WebAuthnChallenge

    user = factory.SubFactory(UserFactory)
    challenge = factory.LazyFunction(lambda: secrets.token_urlsafe(32))
    challenge_type = "registration"
    expires_at = factory.LazyFunction(lambda: timezone.now() + timedelta(minutes=5))


class SSOAuditLogFactory(DjangoModelFactory):
    class Meta:
        model = models.SSOAuditLog

    tenant = factory.SubFactory(TenantFactory)
    user = factory.SubFactory(UserFactory)
    event_type = constants.SSOAuditEventType.SSO_LOGIN_SUCCESS
    event_description = "Test event"
    success = True
