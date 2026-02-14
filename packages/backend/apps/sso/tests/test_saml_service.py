"""
Tests for SAML service.
"""

import pytest
from unittest.mock import patch, MagicMock

from apps.sso.services.saml import SAMLService
from apps.sso import constants

from . import factories


pytestmark = pytest.mark.django_db


@pytest.fixture
def saml_connection(tenant):
    return factories.TenantSSOConnectionFactory(
        tenant=tenant,
        connection_type=constants.IdentityProviderType.SAML,
        saml_entity_id="https://idp.example.com",
        saml_sso_url="https://idp.example.com/sso",
        saml_name_id_format=constants.SAMLNameIdFormat.EMAIL,
    )


class TestSAMLServiceUrls:
    """Tests for SAML service URL methods."""

    @patch("apps.sso.services.saml.settings")
    def test_get_sp_entity_id(self, mock_settings, saml_connection):
        mock_settings.API_URL = "https://api.example.com"
        service = SAMLService(saml_connection)
        entity_id = service.get_sp_entity_id()
        assert "https://api.example.com" in entity_id
        assert str(saml_connection.id) in entity_id
        assert "metadata" in entity_id

    @patch("apps.sso.services.saml.settings")
    def test_get_acs_url(self, mock_settings, saml_connection):
        mock_settings.API_URL = "https://api.example.com"
        service = SAMLService(saml_connection)
        acs_url = service.get_acs_url()
        assert "https://api.example.com" in acs_url
        assert str(saml_connection.id) in acs_url
        assert "acs" in acs_url

    @patch("apps.sso.services.saml.settings")
    def test_get_slo_url(self, mock_settings, saml_connection):
        mock_settings.API_URL = "https://api.example.com"
        service = SAMLService(saml_connection)
        slo_url = service.get_slo_url()
        assert "https://api.example.com" in slo_url
        assert "slo" in slo_url


class TestSAMLServiceMetadata:
    """Tests for SAML metadata generation."""

    def test_generate_sp_metadata(self, saml_connection):
        service = SAMLService(saml_connection)
        metadata = service.generate_sp_metadata()
        assert "EntityDescriptor" in metadata
        assert "SPSSODescriptor" in metadata
        assert "AssertionConsumerService" in metadata
        assert "SingleLogoutService" in metadata


class TestSAMLServiceAuthnRequest:
    """Tests for SAML AuthnRequest creation."""

    def test_create_authn_request(self, saml_connection):
        service = SAMLService(saml_connection)
        redirect_url, request_id = service.create_authn_request(relay_state="/dashboard")
        assert redirect_url
        assert request_id
        assert saml_connection.saml_sso_url in redirect_url
        assert "SAMLRequest" in redirect_url
        assert "RelayState" in redirect_url or "/dashboard" in redirect_url

    def test_create_authn_request_with_force_authn(self, saml_connection):
        service = SAMLService(saml_connection)
        redirect_url, request_id = service.create_authn_request(relay_state="/", force_authn=True)
        assert redirect_url
        assert request_id


class TestSAMLServiceParseIdpMetadata:
    """Tests for IdP metadata parsing."""

    def test_parse_idp_metadata_success(self, saml_connection):
        metadata_xml = """<?xml version="1.0"?>
<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata"
                    entityID="https://idp.example.com">
  <md:IDPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <md:SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect"
                            Location="https://idp.example.com/sso"/>
    <md:SingleLogoutService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect"
                            Location="https://idp.example.com/slo"/>
    <md:KeyDescriptor use="signing">
      <ds:KeyInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
        <ds:X509Data>
          <ds:X509Certificate>MIIBkTCB+wIJAK...</ds:X509Certificate>
        </ds:X509Data>
      </ds:KeyInfo>
    </md:KeyDescriptor>
  </md:IDPSSODescriptor>
</md:EntityDescriptor>"""
        service = SAMLService(saml_connection)
        config = service.parse_idp_metadata(metadata_xml)
        assert config["entity_id"] == "https://idp.example.com"
        assert config["sso_url"] == "https://idp.example.com/sso"
        assert config["slo_url"] == "https://idp.example.com/slo"
        assert "certificate" in config

    def test_parse_idp_metadata_invalid_xml(self, saml_connection):
        service = SAMLService(saml_connection)
        with pytest.raises(ValueError):
            service.parse_idp_metadata("not valid xml")

    def test_parse_idp_metadata_missing_idp_descriptor(self, saml_connection):
        metadata_xml = """<?xml version="1.0"?>
<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata"
                    entityID="https://idp.example.com">
</md:EntityDescriptor>"""
        service = SAMLService(saml_connection)
        with pytest.raises(ValueError):
            service.parse_idp_metadata(metadata_xml)


class TestSAMLServiceMapAttributes:
    """Tests for _map_attributes (via parse_saml_response - tested indirectly)."""

    def test_get_idp_certificate_from_connection(self, saml_connection):
        saml_connection.saml_certificate = "-----BEGIN CERTIFICATE-----\ntest\n-----END CERTIFICATE-----"
        saml_connection.save()
        service = SAMLService(saml_connection)
        cert = service.get_idp_certificate()
        assert cert == "-----BEGIN CERTIFICATE-----\ntest\n-----END CERTIFICATE-----"
