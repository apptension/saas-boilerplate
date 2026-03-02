"""
SSO connection configuration test service.
Extracted from views for use in GraphQL mutation.
"""

import logging
from datetime import datetime

import requests
from cryptography import x509
from cryptography.hazmat.backends import default_backend
from django.conf import settings

from .saml import SAMLService

logger = logging.getLogger(__name__)


def test_sso_connection(connection):
    """
    Test SSO connection configuration.
    Returns dict with connectionId, connectionName, connectionType, overallStatus, checks, testedAt.
    """
    checks = []
    overall_status = "success"

    def add_check(name, status, message, details=None):
        nonlocal overall_status
        check = {"name": name, "status": status, "message": message}
        if details:
            check["details"] = details
        checks.append(check)
        if status == "error":
            overall_status = "error"
        elif status == "warning" and overall_status != "error":
            overall_status = "warning"

    if connection.is_saml:
        _test_saml_connection(connection, add_check)
    elif connection.is_oidc:
        _test_oidc_connection(connection, add_check)

    _test_api_url(add_check)

    from django.utils import timezone

    return {
        "connectionId": str(connection.id),
        "connectionName": connection.name,
        "connectionType": connection.connection_type,
        "overallStatus": overall_status,
        "checks": checks,
        "testedAt": timezone.now().isoformat(),
    }


def _test_saml_connection(connection, add_check):
    if connection.saml_entity_id:
        value = (
            connection.saml_entity_id[:100] + "..."
            if len(connection.saml_entity_id) > 100
            else connection.saml_entity_id
        )
        add_check("IdP Entity ID", "success", "Identity Provider Entity ID is configured", {"value": value})
    else:
        add_check("IdP Entity ID", "error", "Identity Provider Entity ID is not configured")

    if connection.saml_sso_url:
        add_check(
            "SSO URL Format",
            "success",
            "Single Sign-On URL is configured",
            {"value": connection.saml_sso_url},
        )
        try:
            resp = requests.head(connection.saml_sso_url, timeout=10, allow_redirects=True)
            if resp.status_code < 400:
                add_check("SSO URL Reachable", "success", f"SSO endpoint is reachable (HTTP {resp.status_code})")
            elif resp.status_code == 405:
                add_check(
                    "SSO URL Reachable",
                    "success",
                    "SSO endpoint exists (returned 405 - expected for SAML endpoints)",
                )
            else:
                add_check(
                    "SSO URL Reachable",
                    "warning",
                    f"SSO endpoint returned HTTP {resp.status_code}",
                    {"hint": "The endpoint might still work for SAML requests"},
                )
        except requests.exceptions.Timeout:
            add_check(
                "SSO URL Reachable",
                "warning",
                "Connection timed out when reaching SSO endpoint",
                {"hint": "The IdP might be behind a firewall or slow to respond"},
            )
        except requests.exceptions.SSLError as e:
            add_check(
                "SSO URL Reachable",
                "error",
                "SSL/TLS error when connecting to SSO endpoint",
                {"error": str(e)[:200]},
            )
        except requests.exceptions.RequestException as e:
            add_check(
                "SSO URL Reachable",
                "error",
                "Failed to connect to SSO endpoint",
                {"error": str(e)[:200]},
            )
    else:
        add_check("SSO URL Format", "error", "Single Sign-On URL is not configured")

    cert_pem = connection.saml_certificate
    if cert_pem:
        try:
            if "-----BEGIN CERTIFICATE-----" not in cert_pem:
                cert_pem = f"-----BEGIN CERTIFICATE-----\n{cert_pem}\n-----END CERTIFICATE-----"
            cert = x509.load_pem_x509_certificate(cert_pem.encode(), default_backend())
            now = datetime.utcnow()
            expires = (
                cert.not_valid_after_utc.replace(tzinfo=None)
                if hasattr(cert.not_valid_after_utc, "replace")
                else cert.not_valid_after
            )
            if hasattr(expires, "replace"):
                expires = expires.replace(tzinfo=None)
            days_until_expiry = (expires - now).days
            if days_until_expiry < 0:
                add_check(
                    "IdP Certificate",
                    "error",
                    f"Certificate expired {abs(days_until_expiry)} days ago",
                    {"expires": str(expires)},
                )
            elif days_until_expiry < 30:
                add_check(
                    "IdP Certificate",
                    "warning",
                    f"Certificate expires in {days_until_expiry} days",
                    {"expires": str(expires), "hint": "Consider renewing the certificate soon"},
                )
            else:
                add_check(
                    "IdP Certificate",
                    "success",
                    f"Certificate is valid (expires in {days_until_expiry} days)",
                    {"expires": str(expires)},
                )
        except Exception as e:
            add_check(
                "IdP Certificate",
                "error",
                "Failed to parse certificate",
                {"error": str(e)[:200], "hint": "Ensure the certificate is in valid PEM or base64 format"},
            )
    else:
        add_check(
            "IdP Certificate",
            "warning",
            "IdP certificate is not configured",
            {"hint": "Certificate is recommended for signature validation"},
        )

    sp_entity_id = connection.sp_entity_id
    sp_acs_url = connection.sp_acs_url
    if sp_entity_id and sp_acs_url:
        is_localhost = "localhost" in sp_acs_url or "127.0.0.1" in sp_acs_url
        if is_localhost:
            add_check(
                "SP Configuration",
                "error",
                "Service Provider URLs are using localhost - external IdPs cannot reach these URLs",
                {
                    "entityId": sp_entity_id,
                    "acsUrl": sp_acs_url,
                    "hint": "Set the API_URL environment variable to your public API domain",
                },
            )
        else:
            add_check(
                "SP Configuration",
                "success",
                "Service Provider URLs are configured",
                {"entityId": sp_entity_id, "acsUrl": sp_acs_url},
            )
    else:
        add_check("SP Configuration", "warning", "Service Provider configuration may be incomplete")

    try:
        saml_service = SAMLService(connection)
        test_url, test_id = saml_service.create_authn_request(relay_state="/test")
        if test_url and test_id:
            add_check(
                "SAML Request Generation",
                "success",
                "SAML AuthnRequest can be generated successfully",
                {"requestIdFormat": test_id[:10] + "..."},
            )
    except Exception as e:
        add_check(
            "SAML Request Generation",
            "error",
            "Failed to generate SAML AuthnRequest",
            {"error": str(e)[:200]},
        )


def _test_oidc_connection(connection, add_check):
    if connection.oidc_issuer:
        add_check("OIDC Issuer", "success", "Issuer URL is configured", {"value": connection.oidc_issuer})
        discovery_url = connection.oidc_issuer.rstrip("/") + "/.well-known/openid-configuration"
        try:
            resp = requests.get(discovery_url, timeout=10)
            if resp.status_code == 200:
                try:
                    config = resp.json()
                    add_check(
                        "OIDC Discovery",
                        "success",
                        "OpenID Connect discovery endpoint is accessible",
                        {"discoveredEndpoints": len(config.keys())},
                    )
                    required = ["authorization_endpoint", "token_endpoint"]
                    missing = [ep for ep in required if ep not in config]
                    if missing:
                        add_check(
                            "Required Endpoints",
                            "warning",
                            f"Missing endpoints in discovery: {', '.join(missing)}",
                        )
                    else:
                        add_check(
                            "Required Endpoints",
                            "success",
                            "All required OIDC endpoints are present",
                            {
                                "authorization": config.get("authorization_endpoint", "")[:80],
                                "token": config.get("token_endpoint", "")[:80],
                            },
                        )
                except ValueError:
                    add_check("OIDC Discovery", "error", "Discovery endpoint returned invalid JSON")
            else:
                add_check(
                    "OIDC Discovery",
                    "warning",
                    f"Discovery endpoint returned HTTP {resp.status_code}",
                    {"hint": "Some IdPs may not support automatic discovery"},
                )
        except requests.exceptions.Timeout:
            add_check("OIDC Discovery", "warning", "Connection timed out when fetching discovery document")
        except requests.exceptions.SSLError as e:
            add_check(
                "OIDC Discovery",
                "error",
                "SSL/TLS error when connecting to issuer",
                {"error": str(e)[:200]},
            )
        except requests.exceptions.RequestException as e:
            add_check(
                "OIDC Discovery",
                "warning",
                "Could not fetch discovery document",
                {"error": str(e)[:200], "hint": "Manual endpoint configuration may be required"},
            )
    else:
        add_check("OIDC Issuer", "error", "Issuer URL is not configured")

    if connection.oidc_client_id:
        value = (
            connection.oidc_client_id[:20] + "..." if len(connection.oidc_client_id) > 20 else connection.oidc_client_id
        )
        add_check("Client ID", "success", "OAuth Client ID is configured", {"value": value})
    else:
        add_check("Client ID", "error", "OAuth Client ID is not configured")

    if connection.oidc_client_secret or connection.oidc_client_secret_arn:
        add_check("Client Secret", "success", "OAuth Client Secret is configured")
    else:
        add_check("Client Secret", "error", "OAuth Client Secret is not configured")

    callback_url = connection.oidc_callback_url
    if callback_url:
        is_localhost = "localhost" in callback_url or "127.0.0.1" in callback_url
        if is_localhost:
            add_check(
                "Callback URL",
                "error",
                "Callback URL is using localhost - external IdPs cannot reach this URL",
                {
                    "value": callback_url,
                    "hint": "Set the API_URL environment variable to your public API domain",
                },
            )
        else:
            add_check("Callback URL", "success", "OAuth callback URL is configured", {"value": callback_url})
    else:
        add_check("Callback URL", "warning", "Callback URL configuration may be incomplete")


def _test_api_url(add_check):
    api_url = getattr(settings, "API_URL", None)
    is_localhost_api = api_url and ("localhost" in api_url or "127.0.0.1" in api_url)
    if api_url and not is_localhost_api:
        add_check("API URL", "success", "API URL is configured for production", {"value": api_url})
    elif is_localhost_api:
        add_check(
            "API URL",
            "error",
            "API URL is set to localhost - SSO will not work with external identity providers",
            {
                "value": api_url,
                "hint": "Set API_URL environment variable to your public API domain",
            },
        )
    else:
        add_check(
            "API URL",
            "error",
            "API_URL environment variable is not set",
            {"hint": "This will cause SSO redirects to fail. Set API_URL to your public API domain."},
        )
