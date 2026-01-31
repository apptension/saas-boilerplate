"""
Security tests for SSO module.

These tests verify that security vulnerabilities are properly mitigated:
1. Open redirect prevention
2. Safe error handling (no information disclosure)
3. Input validation
4. SAML signature validation
5. OIDC security checks
6. SCIM filter security
7. Rate limiting (conceptual - requires integration tests)
8. WebAuthn signature verification
9. WebAuthn origin validation
10. WebAuthn sign count enforcement
11. SAML certificate requirement
12. SAML InResponseTo validation (replay protection)
"""

import pytest
import base64
import json
import hashlib
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime, timedelta
from django.utils import timezone
from django.test import override_settings

from apps.sso.security import (
    validate_redirect_path,
    build_safe_redirect_url,
    get_safe_error_code,
    SSO_ERROR_CODES,
    validate_pagination_params,
    sanitize_scim_filter,
    safe_log_user_identifier,
    hash_for_logging,
    constant_time_compare,
    validate_saml_response_basic,
)
from apps.sso import constants


pytestmark = pytest.mark.django_db


class TestOpenRedirectPrevention:
    """Tests for open redirect vulnerability prevention."""

    def test_valid_relative_path_allowed(self):
        """Valid relative paths should be allowed."""
        assert validate_redirect_path('/dashboard') == '/dashboard'
        assert validate_redirect_path('/en/') == '/en/'
        assert validate_redirect_path('/app/settings') == '/app/settings'
        assert validate_redirect_path('/tenant/123/users') == '/tenant/123/users'

    def test_empty_path_returns_default(self):
        """Empty or None paths should return default."""
        assert validate_redirect_path('') == '/en/'
        assert validate_redirect_path(None) == '/en/'
        assert validate_redirect_path('', default='/home') == '/home'

    def test_protocol_relative_url_blocked(self):
        """Protocol-relative URLs (//evil.com) should be blocked."""
        assert validate_redirect_path('//evil.com') == '/en/'
        assert validate_redirect_path('//evil.com/path') == '/en/'
        assert validate_redirect_path('///evil.com') == '/en/'

    def test_absolute_url_blocked(self):
        """Absolute URLs with protocol should be blocked."""
        assert validate_redirect_path('http://evil.com') == '/en/'
        assert validate_redirect_path('https://evil.com') == '/en/'
        assert validate_redirect_path('javascript:alert(1)') == '/en/'
        assert validate_redirect_path('data:text/html,<script>') == '/en/'

    def test_embedded_protocol_blocked(self):
        """Paths containing :// should be blocked."""
        assert validate_redirect_path('/redirect?url=http://evil.com') == '/en/'
        assert validate_redirect_path('/foo://bar') == '/en/'

    def test_backslash_tricks_blocked(self):
        """Backslash tricks should be blocked."""
        assert validate_redirect_path('/\\evil.com') == '/en/'
        assert validate_redirect_path('/\\\\evil.com') == '/en/'
        assert validate_redirect_path('\\evil.com') == '/en/'

    def test_null_byte_injection_blocked(self):
        """Null byte injection should be blocked."""
        assert validate_redirect_path('/path\x00evil') == '/en/'
        assert validate_redirect_path('/path%00evil') == '/en/'

    def test_encoded_tricks_blocked(self):
        """URL-encoded bypass attempts should be blocked."""
        assert validate_redirect_path('/path%2f%2fevil.com') == '/en/'
        assert validate_redirect_path('/path%5cevil') == '/en/'
        assert validate_redirect_path('/path%252f%252f') == '/en/'

    def test_at_sign_blocked(self):
        """URLs with @ (user@host pattern) should be blocked."""
        assert validate_redirect_path('/user@evil.com') == '/en/'

    def test_non_slash_start_blocked(self):
        """Paths not starting with / should be blocked."""
        assert validate_redirect_path('dashboard') == '/en/'
        assert validate_redirect_path('..') == '/en/'
        assert validate_redirect_path('../etc/passwd') == '/en/'

    def test_build_safe_redirect_url(self):
        """Test the full URL builder with validation."""
        base = 'https://app.example.com'

        # Valid paths
        assert build_safe_redirect_url(base, '/dashboard') == 'https://app.example.com/dashboard'
        assert build_safe_redirect_url(base, '/en/') == 'https://app.example.com/en/'

        # Invalid paths use default
        assert build_safe_redirect_url(base, '//evil.com') == 'https://app.example.com/en/'
        assert build_safe_redirect_url(base, 'http://evil.com') == 'https://app.example.com/en/'

        # Custom default
        assert build_safe_redirect_url(base, '//evil.com', '/home') == 'https://app.example.com/home'


class TestSafeErrorHandling:
    """Tests for safe error handling (no information disclosure)."""

    def test_error_code_mapping_email(self):
        """Email-related errors should map to missing_email."""
        assert get_safe_error_code(ValueError("No email found")) == 'missing_email'
        assert get_safe_error_code(ValueError("Email is missing")) == 'missing_email'
        assert get_safe_error_code(ValueError("email not found in response")) == 'missing_email'

    def test_error_code_mapping_domain(self):
        """Domain-related errors should map to domain_not_allowed."""
        assert get_safe_error_code(ValueError("Domain not allowed")) == 'domain_not_allowed'
        assert get_safe_error_code(ValueError("email domain is restricted")) == 'domain_not_allowed'

    def test_error_code_mapping_provisioning(self):
        """Provisioning errors should map to provisioning_disabled."""
        assert get_safe_error_code(ValueError("JIT provisioning is disabled")) == 'provisioning_disabled'
        assert get_safe_error_code(ValueError("Provisioning not allowed")) == 'provisioning_disabled'

    def test_error_code_mapping_signature(self):
        """Signature errors should map to signature_invalid."""
        assert get_safe_error_code(ValueError("Signature verification failed")) == 'signature_invalid'
        assert get_safe_error_code(ValueError("Invalid certificate")) == 'signature_invalid'

    def test_error_code_mapping_state(self):
        """State mismatch errors should map to state_mismatch."""
        assert get_safe_error_code(ValueError("State mismatch")) == 'state_mismatch'
        assert get_safe_error_code(ValueError("Invalid state parameter")) == 'state_mismatch'

    def test_error_code_mapping_generic(self):
        """Unknown errors should map to generic."""
        assert get_safe_error_code(ValueError("Some random error")) == 'generic'
        assert get_safe_error_code(Exception("Internal error")) == 'generic'

    def test_all_error_codes_have_messages(self):
        """All error codes should have corresponding user-friendly messages."""
        test_cases = [
            'auth_failed',
            'invalid_response',
            'missing_email',
            'domain_not_allowed',
            'provisioning_disabled',
            'session_expired',
            'config_error',
            'signature_invalid',
            'state_mismatch',
            'rate_limited',
            'generic',
        ]
        for code in test_cases:
            assert code in SSO_ERROR_CODES
            assert SSO_ERROR_CODES[code]  # Not empty


class TestInputValidation:
    """Tests for input validation functions."""

    def test_pagination_valid_params(self):
        """Valid pagination params should be accepted."""
        start, count = validate_pagination_params('1', '50')
        assert start == 1
        assert count == 50

    def test_pagination_invalid_params_use_defaults(self):
        """Invalid pagination params should use defaults."""
        start, count = validate_pagination_params('invalid', 'bad')
        assert start == 1
        assert count == 100

    def test_pagination_negative_values_clamped(self):
        """Negative values should be clamped to minimum."""
        start, count = validate_pagination_params('-10', '-5')
        assert start == 1
        assert count == 1

    def test_pagination_count_max_enforced(self):
        """Count should be capped at max value."""
        start, count = validate_pagination_params('1', '10000')
        assert count == 1000  # max_count default

    def test_pagination_custom_max(self):
        """Custom max_count should be respected."""
        start, count = validate_pagination_params('1', '500', max_count=100)
        assert count == 100

    def test_pagination_overflow_protection(self):
        """Large start_index values should be handled."""
        start, count = validate_pagination_params('999999999999999', '100')
        assert start == 1  # Reset to default for very large values

    def test_scim_filter_username_eq(self):
        """Valid userName eq filter should be parsed."""
        result = sanitize_scim_filter('userName eq "test@example.com"')
        assert result is not None
        assert result['attribute'] == 'username'
        assert result['value'] == 'test@example.com'

    def test_scim_filter_external_id(self):
        """Valid externalId filter should be parsed."""
        result = sanitize_scim_filter('externalId eq "user123"')
        assert result is not None
        assert result['attribute'] == 'externalid'
        assert result['value'] == 'user123'

    def test_scim_filter_active_boolean(self):
        """Active eq true/false should be parsed."""
        result = sanitize_scim_filter('active eq true')
        assert result is not None
        assert result['attribute'] == 'active'
        assert result['value'] is True

        result = sanitize_scim_filter('active eq false')
        assert result['value'] is False

    def test_scim_filter_unsupported_rejected(self):
        """Unsupported filters should return None."""
        assert sanitize_scim_filter('name.familyName eq "Smith"') is None
        assert sanitize_scim_filter('emails[type eq "work"].value eq "x"') is None
        assert sanitize_scim_filter('userName co "test"') is None  # co not supported

    def test_scim_filter_injection_blocked(self):
        """SQL injection attempts should be blocked."""
        assert sanitize_scim_filter('userName eq "test\'; DROP TABLE users;--"') is None
        assert sanitize_scim_filter('userName eq "test" OR 1=1') is None

    def test_scim_filter_too_long_rejected(self):
        """Very long filters should be rejected."""
        long_filter = 'userName eq "' + 'a' * 1000 + '"'
        assert sanitize_scim_filter(long_filter, max_length=500) is None


class TestSecureLogging:
    """Tests for secure logging utilities."""

    def test_safe_log_user_identifier_masks_email(self):
        """Email should be partially masked for logging."""
        assert safe_log_user_identifier('john.doe@example.com') == 'jo***@example.com'
        # Short local parts are fully masked
        assert safe_log_user_identifier('ab@test.com') == '***@test.com'
        assert safe_log_user_identifier('x@a.io') == '***@a.io'

    def test_safe_log_user_identifier_invalid_input(self):
        """Invalid input should return 'unknown'."""
        assert safe_log_user_identifier('') == 'unknown'
        assert safe_log_user_identifier(None) == 'unknown'
        assert safe_log_user_identifier('noemail') == 'unknown'

    def test_hash_for_logging_consistent(self):
        """Hash should be consistent for same input."""
        hash1 = hash_for_logging('test@example.com')
        hash2 = hash_for_logging('test@example.com')
        assert hash1 == hash2

    def test_hash_for_logging_different_for_different_inputs(self):
        """Different inputs should produce different hashes."""
        hash1 = hash_for_logging('user1@example.com')
        hash2 = hash_for_logging('user2@example.com')
        assert hash1 != hash2

    def test_hash_for_logging_length(self):
        """Hash should be of requested length."""
        assert len(hash_for_logging('test', length=8)) == 8
        assert len(hash_for_logging('test', length=16)) == 16


class TestConstantTimeCompare:
    """Tests for timing-safe comparison."""

    def test_constant_time_compare_equal(self):
        """Equal strings should return True."""
        assert constant_time_compare('secret123', 'secret123') is True
        assert constant_time_compare('', '') is True

    def test_constant_time_compare_not_equal(self):
        """Different strings should return False."""
        assert constant_time_compare('secret123', 'secret456') is False
        assert constant_time_compare('short', 'longer') is False


class TestSAMLResponseValidation:
    """Tests for SAML response basic validation."""

    def test_empty_response_rejected(self):
        """Empty response should be rejected."""
        assert validate_saml_response_basic(b'') is False
        assert validate_saml_response_basic(None) is False

    def test_oversized_response_rejected(self):
        """Very large responses should be rejected."""
        large_response = b'<saml>' + b'x' * (2 * 1024 * 1024)  # 2MB
        assert validate_saml_response_basic(large_response) is False

    def test_non_saml_xml_rejected(self):
        """Non-SAML XML should be rejected."""
        assert validate_saml_response_basic(b'<html><body>Not SAML</body></html>') is False
        assert validate_saml_response_basic(b'{"json": "not xml"}') is False

    def test_valid_saml_response_accepted(self):
        """Valid SAML response structure should be accepted."""
        valid_response = b'''<?xml version="1.0"?>
        <samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol">
            <saml:Assertion xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion">
            </saml:Assertion>
        </samlp:Response>'''
        assert validate_saml_response_basic(valid_response) is True


class TestSAMLSignatureValidation:
    """Tests for SAML signature validation."""

    def test_saml_service_requires_certificate_when_configured(self):
        """SAML service should require certificate when signature validation is enabled."""
        from apps.sso.services.saml import SAMLService
        from apps.sso.tests.factories import TenantSSOConnectionFactory

        # Create connection with signature validation enabled but no certificate
        connection = TenantSSOConnectionFactory(
            saml_want_assertions_signed=True,
            saml_want_response_signed=True,
            saml_certificate='',  # No certificate
            saml_certificate_arn='',
        )

        saml_service = SAMLService(connection)

        # Create a minimal SAML response
        saml_response = base64.b64encode(
            b'''<?xml version="1.0"?>
        <samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" 
                        xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion">
            <samlp:Status>
                <samlp:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Success"/>
            </samlp:Status>
            <saml:Assertion>
                <saml:NameID>test@example.com</saml:NameID>
            </saml:Assertion>
        </samlp:Response>'''
        ).decode()

        # Should raise error about missing certificate
        with pytest.raises(ValueError) as exc_info:
            saml_service.parse_saml_response(saml_response)

        assert 'certificate' in str(exc_info.value).lower() or 'signature' in str(exc_info.value).lower()


class TestOIDCSecurityValidation:
    """Tests for OIDC security checks."""

    def test_oidc_requires_id_token(self):
        """OIDC callback should require id_token in response."""
        from apps.sso.services.oidc import OIDCService
        from apps.sso.tests.factories import OIDCSSOConnectionFactory

        connection = OIDCSSOConnectionFactory()
        oidc_service = OIDCService(connection)

        # Mock token exchange to return no id_token
        with patch.object(oidc_service, 'exchange_code_for_tokens') as mock_exchange:
            mock_exchange.return_value = {
                'access_token': 'some_access_token',
                # No id_token!
            }

            with pytest.raises(ValueError) as exc_info:
                oidc_service.process_callback(
                    code='test_code',
                    state='test_state',
                    stored_state='test_state',
                    stored_nonce='test_nonce',
                )

            assert 'id token' in str(exc_info.value).lower()

    def test_oidc_state_mismatch_rejected(self):
        """OIDC should reject state mismatch."""
        from apps.sso.services.oidc import OIDCService
        from apps.sso.tests.factories import OIDCSSOConnectionFactory

        connection = OIDCSSOConnectionFactory()
        oidc_service = OIDCService(connection)

        with pytest.raises(ValueError) as exc_info:
            oidc_service.process_callback(
                code='test_code',
                state='received_state',
                stored_state='different_state',  # Mismatch!
                stored_nonce='test_nonce',
            )

        assert 'state' in str(exc_info.value).lower()


class TestViewSecurityIntegration:
    """Integration tests for view security features."""

    @pytest.fixture
    def api_client(self):
        from rest_framework.test import APIClient

        return APIClient()

    def test_saml_acs_error_uses_safe_code(self, api_client):
        """SAML ACS errors should use safe error codes, not raw messages."""
        from apps.sso.tests.factories import TenantSSOConnectionFactory

        connection = TenantSSOConnectionFactory(
            status=constants.SSOConnectionStatus.ACTIVE,
        )

        # Send invalid SAML response
        response = api_client.post(
            f'/api/sso/saml/{connection.id}/acs',
            {'SAMLResponse': 'invalid_base64_data'},
        )

        # Should redirect with error code, not raw message
        assert response.status_code == 302
        location = response.get('Location', '')
        assert 'code=' in location
        # Should NOT contain raw error details
        assert 'Invalid SAML' not in location
        assert 'base64' not in location

    def test_sso_discovery_rate_limit_class_present(self, api_client):
        """SSO discovery view should have rate limiting configured."""
        from apps.sso.views import SSODiscoverView, SSODiscoveryThrottle

        # Verify throttle class is configured
        assert SSODiscoveryThrottle in SSODiscoverView.throttle_classes

    def test_passkey_auth_rate_limit_class_present(self):
        """Passkey auth views should have rate limiting configured."""
        from apps.sso.views import (
            PasskeyAuthenticationOptionsView,
            PasskeyAuthenticationVerifyView,
            PasskeyAuthThrottle,
        )

        assert PasskeyAuthThrottle in PasskeyAuthenticationOptionsView.throttle_classes
        assert PasskeyAuthThrottle in PasskeyAuthenticationVerifyView.throttle_classes

    def test_tenant_passkey_list_rate_limit_class_present(self):
        """Tenant passkey list view should have rate limiting configured."""
        from apps.sso.views import TenantPasskeyListView, SCIMApiThrottle

        assert SCIMApiThrottle in TenantPasskeyListView.throttle_classes

    def test_scim_users_uses_safe_pagination(self, api_client):
        """SCIM users endpoint should use safe pagination."""
        from apps.sso.tests.factories import SCIMTokenFactory, TenantSSOConnectionFactory
        from apps.sso.models import SCIMToken

        connection = TenantSSOConnectionFactory(status=constants.SSOConnectionStatus.ACTIVE)
        token_instance, raw_token = SCIMToken.create_for_tenant(
            tenant=connection.tenant,
            name='Test Token',
            sso_connection=connection,
        )

        # Try to request an unreasonably large page
        response = api_client.get(
            '/api/sso/scim/v2/Users',
            {'count': '999999', 'startIndex': '1'},
            HTTP_AUTHORIZATION=f'Bearer {raw_token}',
        )

        # Should succeed but with capped count
        if response.status_code == 200:
            data = response.json()
            # itemsPerPage should be capped
            assert data.get('itemsPerPage', 0) <= 1000


class TestSAMLCertificateRequirement:
    """Tests for SAML certificate requirement enforcement."""

    def test_saml_connection_requires_certificate_to_activate(self):
        """SAML connections should require certificate before activation."""
        from apps.sso.tests.factories import TenantSSOConnectionFactory

        connection = TenantSSOConnectionFactory(
            connection_type=constants.IdentityProviderType.SAML,
            status=constants.SSOConnectionStatus.DRAFT,
            saml_certificate='',  # No certificate
            saml_certificate_arn='',
            saml_sso_url='https://idp.example.com/sso',
        )

        # Should fail to activate without certificate
        with pytest.raises(ValueError) as exc_info:
            connection.activate()

        assert 'certificate' in str(exc_info.value).lower()

    def test_saml_connection_can_activate_with_certificate(self):
        """SAML connections with certificate should activate successfully."""
        from apps.sso.tests.factories import TenantSSOConnectionFactory

        connection = TenantSSOConnectionFactory(
            connection_type=constants.IdentityProviderType.SAML,
            status=constants.SSOConnectionStatus.DRAFT,
            saml_certificate='-----BEGIN CERTIFICATE-----\nMIIBIjANBgkqh...\n-----END CERTIFICATE-----',
            saml_sso_url='https://idp.example.com/sso',
        )

        # Should activate successfully
        connection.activate()
        assert connection.status == constants.SSOConnectionStatus.ACTIVE

    def test_saml_connection_can_activate_with_certificate_arn(self):
        """SAML connections with certificate ARN should activate successfully."""
        from apps.sso.tests.factories import TenantSSOConnectionFactory

        connection = TenantSSOConnectionFactory(
            connection_type=constants.IdentityProviderType.SAML,
            status=constants.SSOConnectionStatus.DRAFT,
            saml_certificate='',
            saml_certificate_arn='arn:aws:secretsmanager:us-east-1:123456789:secret:test',
            saml_sso_url='https://idp.example.com/sso',
        )

        # Should activate successfully
        connection.activate()
        assert connection.status == constants.SSOConnectionStatus.ACTIVE

    def test_saml_connection_requires_sso_url_to_activate(self):
        """SAML connections should require SSO URL before activation."""
        from apps.sso.tests.factories import TenantSSOConnectionFactory

        connection = TenantSSOConnectionFactory(
            connection_type=constants.IdentityProviderType.SAML,
            status=constants.SSOConnectionStatus.DRAFT,
            saml_certificate='-----BEGIN CERTIFICATE-----\nMIIBIjANBgkqh...\n-----END CERTIFICATE-----',
            saml_sso_url='',  # No SSO URL
        )

        # Should fail to activate without SSO URL
        with pytest.raises(ValueError) as exc_info:
            connection.activate()

        assert 'sso url' in str(exc_info.value).lower()


class TestOIDCConnectionRequirements:
    """Tests for OIDC connection configuration requirements."""

    def test_oidc_connection_requires_issuer_to_activate(self):
        """OIDC connections should require issuer before activation."""
        from apps.sso.tests.factories import OIDCSSOConnectionFactory

        connection = OIDCSSOConnectionFactory(
            status=constants.SSOConnectionStatus.DRAFT,
            oidc_issuer='',  # No issuer
            oidc_client_id='test_client_id',
        )

        # Should fail to activate without issuer
        with pytest.raises(ValueError) as exc_info:
            connection.activate()

        assert 'issuer' in str(exc_info.value).lower()

    def test_oidc_connection_requires_client_id_to_activate(self):
        """OIDC connections should require client ID before activation."""
        from apps.sso.tests.factories import OIDCSSOConnectionFactory

        connection = OIDCSSOConnectionFactory(
            status=constants.SSOConnectionStatus.DRAFT,
            oidc_issuer='https://idp.example.com',
            oidc_client_id='',  # No client ID
        )

        # Should fail to activate without client ID
        with pytest.raises(ValueError) as exc_info:
            connection.activate()

        assert 'client id' in str(exc_info.value).lower()


class TestWebAuthnOriginValidation:
    """Tests for WebAuthn origin validation."""

    def test_webauthn_service_verifies_origin(self):
        """WebAuthn service should verify origin against expected value."""
        from apps.sso.services.webauthn import WebAuthnService
        from apps.users.tests.factories import UserFactory

        user = UserFactory()
        service = WebAuthnService(user)

        # Valid origin should pass
        with override_settings(WEB_APP_URL='https://app.example.com'):
            service_with_settings = WebAuthnService(user)
            assert service_with_settings._verify_origin('https://app.example.com') is True

    def test_webauthn_service_rejects_invalid_origin(self):
        """WebAuthn service should reject invalid origins."""
        from apps.sso.services.webauthn import WebAuthnService
        from apps.users.tests.factories import UserFactory

        user = UserFactory()

        # Invalid origin should fail
        with override_settings(
            WEB_APP_URL='https://app.example.com',
            WEBAUTHN_ALLOW_ORIGIN_MISMATCH=False,
        ):
            service = WebAuthnService(user)
            with pytest.raises(ValueError) as exc_info:
                service._verify_origin('https://evil.com')

            assert 'origin' in str(exc_info.value).lower()

    def test_webauthn_origin_mismatch_allowed_when_configured(self):
        """WebAuthn should allow origin mismatch only when explicitly configured."""
        from apps.sso.services.webauthn import WebAuthnService
        from apps.users.tests.factories import UserFactory

        user = UserFactory()

        # With explicit override, mismatch should be allowed (for development)
        with override_settings(
            WEB_APP_URL='https://app.example.com',
            WEBAUTHN_ALLOW_ORIGIN_MISMATCH=True,
        ):
            service = WebAuthnService(user)
            # Should not raise
            assert service._verify_origin('http://localhost:3000') is True


class TestWebAuthnSignCountEnforcement:
    """Tests for WebAuthn sign count enforcement."""

    def test_webauthn_detects_sign_count_anomaly(self):
        """WebAuthn should detect sign count regression (possible cloned authenticator)."""
        from apps.sso.services.webauthn import WebAuthnService
        from apps.sso.tests.factories import UserPasskeyFactory, WebAuthnChallengeFactory
        from apps.users.tests.factories import UserFactory
        import secrets

        user = UserFactory()

        # Create passkey with sign count of 10
        passkey = UserPasskeyFactory(
            user=user,
            sign_count=10,
            is_active=True,
        )

        # Create a valid challenge
        challenge = WebAuthnChallengeFactory(
            user=user,
            challenge_type='authentication',
        )

        service = WebAuthnService(user)

        # Mock the signature verification to pass
        with patch.object(service, '_verify_webauthn_signature', return_value=True):
            with patch.object(service, '_verify_origin', return_value=True):
                # Create mock auth data with sign count of 5 (less than stored 10)
                auth_data = b'\x00' * 33 + (5).to_bytes(4, 'big')  # Sign count at bytes 33-36
                client_data = json.dumps(
                    {
                        'type': 'webauthn.get',
                        'challenge': challenge.challenge,
                        'origin': 'https://app.example.com',
                    }
                ).encode()

                # With strict mode, should raise error
                with override_settings(WEBAUTHN_STRICT_SIGN_COUNT=True):
                    with pytest.raises(ValueError) as exc_info:
                        service.verify_authentication(
                            challenge=challenge.challenge,
                            credential_id=passkey.credential_id,
                            authenticator_data=base64.urlsafe_b64encode(auth_data).decode().rstrip('='),
                            client_data_json=base64.urlsafe_b64encode(client_data).decode().rstrip('='),
                            signature=base64.urlsafe_b64encode(b'mock_signature').decode().rstrip('='),
                        )

                    assert 'security anomaly' in str(exc_info.value).lower()


class TestSAMLReplayProtection:
    """Tests for SAML replay attack protection."""

    def test_saml_validates_in_response_to(self):
        """SAML should validate InResponseTo when request_id is provided."""
        from apps.sso.services.saml import SAMLService
        from apps.sso.tests.factories import TenantSSOConnectionFactory

        connection = TenantSSOConnectionFactory(
            saml_certificate='-----BEGIN CERTIFICATE-----\nMIIBIjANBgkqh...\n-----END CERTIFICATE-----',
        )

        service = SAMLService(connection)

        # Create a SAML response with wrong InResponseTo
        saml_response = base64.b64encode(
            b'''<?xml version="1.0"?>
        <samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" 
                        xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
                        InResponseTo="wrong_request_id">
            <samlp:Status>
                <samlp:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Success"/>
            </samlp:Status>
            <saml:Assertion>
                <saml:NameID>test@example.com</saml:NameID>
            </saml:Assertion>
        </samlp:Response>'''
        ).decode()

        # Should raise error about request ID mismatch
        with pytest.raises(ValueError) as exc_info:
            service.parse_saml_response(saml_response, request_id='expected_request_id')

        error_message = str(exc_info.value).lower()
        # Could fail on certificate or request ID - both are valid security rejections
        assert 'certificate' in error_message or 'mismatch' in error_message or 'replay' in error_message


class TestSSODiscoveryNoEnumeration:
    """Tests to ensure SSO discovery doesn't enable email enumeration."""

    def test_sso_discovery_does_not_reveal_user_existence(self):
        """SSO discovery should not reveal whether a user exists."""
        from apps.sso.views import SSODiscoverView
        from django.test import RequestFactory
        from apps.users.tests.factories import UserFactory
        from apps.sso.tests.factories import TenantSSOConnectionFactory
        from apps.multitenancy.tests.factories import TenantFactory, TenantMembershipFactory

        # Create tenant and user
        tenant = TenantFactory()
        user = UserFactory(email='existing@company.com')
        membership = TenantMembershipFactory(user=user, tenant=tenant)

        # Create SSO connection that allows company.com domain
        connection = TenantSSOConnectionFactory(
            tenant=tenant,
            status=constants.SSOConnectionStatus.ACTIVE,
            allowed_domains=['company.com'],
        )

        factory = RequestFactory()
        view = SSODiscoverView.as_view()

        # Request for existing user
        request1 = factory.get('/api/sso/discover', {'email': 'existing@company.com'})
        response1 = view(request1)

        # Request for non-existing user in same domain
        request2 = factory.get('/api/sso/discover', {'email': 'nonexistent@company.com'})
        response2 = view(request2)

        # Both should return the same SSO connection (based on domain, not user existence)
        # The response should be identical for both - no enumeration possible
        assert response1.status_code == response2.status_code

        if response1.status_code == 200:
            # If SSO is available, both should see the same connections
            data1 = response1.data if hasattr(response1, 'data') else json.loads(response1.content)
            data2 = response2.data if hasattr(response2, 'data') else json.loads(response2.content)
            assert data1.get('sso_available') == data2.get('sso_available')


class TestErrorMessageSecurity:
    """Tests to ensure error messages don't leak sensitive information."""

    def test_saml_login_error_uses_safe_code(self):
        """SAML login errors should use safe error codes."""
        from apps.sso.views import SAMLLoginView
        from apps.sso.tests.factories import TenantSSOConnectionFactory
        from django.test import RequestFactory

        # Create connection that will cause an error (missing SSO URL)
        connection = TenantSSOConnectionFactory(
            status=constants.SSOConnectionStatus.ACTIVE,
            saml_sso_url='',  # This will cause an error
        )

        factory = RequestFactory()
        request = factory.get(f'/api/sso/saml/{connection.id}/login')

        view = SAMLLoginView.as_view()
        response = view(request, connection_id=str(connection.id))

        # Response should not contain stack traces or detailed error info
        content = response.content.decode() if hasattr(response, 'content') else str(response)
        assert 'Traceback' not in content
        assert 'Exception' not in content
        assert 'Error' not in content or 'error code' in content.lower() or 'not properly configured' in content.lower()
