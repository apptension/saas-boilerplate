"""
Pytest fixtures for SSO tests.
"""

import pytest
import pytest_factoryboy
from unittest.mock import Mock, patch

from . import factories

# Register SSO factories with pytest_factoryboy
pytest_factoryboy.register(factories.TenantSSOConnectionFactory)
pytest_factoryboy.register(factories.OIDCSSOConnectionFactory, _name="oidc_sso_connection")
pytest_factoryboy.register(factories.SCIMTokenFactory)
pytest_factoryboy.register(factories.SSOUserLinkFactory)
pytest_factoryboy.register(factories.SSOSessionFactory)
pytest_factoryboy.register(factories.UserDeviceFactory)
pytest_factoryboy.register(factories.UserPasskeyFactory, _name="user_passkey")
pytest_factoryboy.register(factories.WebAuthnChallengeFactory)
pytest_factoryboy.register(factories.SSOAuditLogFactory)


@pytest.fixture
def sso_connection(tenant_sso_connection):
    """Alias for tenant_sso_connection for easier use."""
    return tenant_sso_connection


@pytest.fixture
def oidc_connection(oidc_sso_connection):
    """Alias for oidc_sso_connection."""
    return oidc_sso_connection


@pytest.fixture
def active_sso_connection(tenant_sso_connection):
    """Create an active SSO connection."""
    from apps.sso.constants import SSOConnectionStatus
    tenant_sso_connection.status = SSOConnectionStatus.ACTIVE
    tenant_sso_connection.save()
    return tenant_sso_connection


@pytest.fixture
def scim_token_with_raw(tenant):
    """Create a SCIM token and return both instance and raw token."""
    from apps.sso.models import SCIMToken
    token_instance, raw_token = SCIMToken.create_for_tenant(
        tenant=tenant,
        name="Test SCIM Token",
    )
    return token_instance, raw_token


@pytest.fixture
def passkey(user_passkey):
    """Alias for user_passkey for easier use."""
    return user_passkey


@pytest.fixture
def webauthn_challenge(web_authn_challenge):
    """Alias for web_authn_challenge."""
    return web_authn_challenge


@pytest.fixture
def mock_secrets_service():
    """Mock the SecretsService."""
    with patch('apps.sso.services.secrets.SecretsService') as mock:
        instance = mock.return_value
        instance.get_secret.return_value = "mock_secret"
        instance.store_secret.return_value = "arn:aws:secretsmanager:region:account:secret:name"
        instance.get_sp_signing_key.return_value = {
            'private_key': 'mock_private_key',
            'certificate': 'mock_certificate',
        }
        yield instance


@pytest.fixture
def mock_cache():
    """Mock Django cache."""
    with patch('django.core.cache.cache') as mock:
        cache_data = {}
        mock.get.side_effect = lambda k, default=None: cache_data.get(k, default)
        mock.set.side_effect = lambda k, v, timeout=None: cache_data.update({k: v})
        mock.delete.side_effect = lambda k: cache_data.pop(k, None)
        yield mock
