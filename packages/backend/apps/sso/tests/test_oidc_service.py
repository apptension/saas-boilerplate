"""
Tests for OIDC service.
"""

import pytest
from unittest.mock import patch

from apps.sso.services.oidc import OIDCService
from apps.sso import constants

from . import factories


pytestmark = pytest.mark.django_db


@pytest.fixture
def oidc_connection(tenant):
    return factories.OIDCSSOConnectionFactory(
        tenant=tenant,
        status=constants.SSOConnectionStatus.ACTIVE,
        oidc_issuer="https://oidc.example.com",
        oidc_client_id="test_client",
        oidc_scopes="openid email profile",
    )


class TestOIDCServiceStaticMethods:
    """Tests for OIDCService static methods."""

    def test_generate_pkce(self):
        verifier, challenge = OIDCService.generate_pkce()
        assert len(verifier) > 40
        assert len(challenge) > 40
        assert verifier != challenge

    def test_generate_pkce_unique_each_time(self):
        v1, c1 = OIDCService.generate_pkce()
        v2, c2 = OIDCService.generate_pkce()
        assert v1 != v2
        assert c1 != c2

    def test_generate_state(self):
        state = OIDCService.generate_state()
        assert len(state) > 20

    def test_generate_nonce(self):
        nonce = OIDCService.generate_nonce()
        assert len(nonce) > 20


class TestOIDCServiceUrls:
    """Tests for OIDC service URL methods."""

    @patch("apps.sso.services.oidc.settings")
    def test_get_callback_url(self, mock_settings, oidc_connection):
        mock_settings.API_URL = "https://api.example.com"
        service = OIDCService(oidc_connection)
        url = service.get_callback_url()
        assert "https://api.example.com" in url
        assert str(oidc_connection.id) in url
        assert "callback" in url


class TestOIDCServiceCreateAuthorizationUrl:
    """Tests for create_authorization_url."""

    def test_create_authorization_url(self, oidc_connection):
        service = OIDCService(oidc_connection)
        oidc_connection.oidc_authorization_endpoint = "https://oidc.example.com/authorize"
        oidc_connection.save()

        url, params = service.create_authorization_url(
            code_challenge="challenge123",
            login_hint="user@example.com",
        )
        assert "https://oidc.example.com/authorize" in url
        assert "code_challenge=challenge123" in url or "challenge123" in url
        assert "login_hint" in url or "user%40example.com" in url
        assert "state" in params
        assert "nonce" in params

    def test_create_authorization_url_with_prompt(self, oidc_connection):
        service = OIDCService(oidc_connection)
        oidc_connection.oidc_authorization_endpoint = "https://oidc.example.com/authorize"
        oidc_connection.save()

        url, _ = service.create_authorization_url(
            code_challenge="ch",
            prompt="login",
        )
        assert "prompt=login" in url


class TestOIDCServiceGetClientSecret:
    """Tests for get_client_secret."""

    def test_get_client_secret_from_connection(self, oidc_connection):
        oidc_connection.oidc_client_secret = "secret123"
        oidc_connection.save()
        service = OIDCService(oidc_connection)
        secret = service.get_client_secret()
        assert secret == "secret123"

    def test_get_client_secret_from_secrets_manager(self, oidc_connection):
        oidc_connection.oidc_client_secret = ""
        oidc_connection.oidc_client_secret_arn = "arn:aws:secretsmanager:..."
        oidc_connection.save()

        with patch("apps.sso.services.oidc.get_secrets_service") as mock_get:
            mock_svc = mock_get.return_value
            mock_svc.get_secret.return_value = "from_aws"
            service = OIDCService(oidc_connection)
            secret = service.get_client_secret()
            assert secret == "from_aws"

    def test_get_client_secret_returns_none_when_not_configured(self, oidc_connection):
        oidc_connection.oidc_client_secret = ""
        oidc_connection.oidc_client_secret_arn = ""
        oidc_connection.save()
        service = OIDCService(oidc_connection)
        secret = service.get_client_secret()
        assert secret is None
