"""
SAML 2.0 Service Provider implementation.
Uses djangosaml2 for SAML protocol handling.
"""

import base64
import logging
from datetime import datetime
from typing import Optional, Dict, Any, Tuple
from urllib.parse import urlencode

import defusedxml.ElementTree as ET

from django.conf import settings

from .secrets import get_secrets_service

logger = logging.getLogger(__name__)


# SAML namespaces
SAML_NS = {
    'md': 'urn:oasis:names:tc:SAML:2.0:metadata',
    'saml': 'urn:oasis:names:tc:SAML:2.0:assertion',
    'samlp': 'urn:oasis:names:tc:SAML:2.0:protocol',
    'ds': 'http://www.w3.org/2000/09/xmldsig#',
}


class SAMLService:
    """
    SAML 2.0 Service Provider implementation.
    Handles SAML authentication flows, metadata generation, and response parsing.
    """

    def __init__(self, sso_connection):
        """
        Initialize SAML service for a specific SSO connection.

        Args:
            sso_connection: TenantSSOConnection instance configured for SAML
        """
        self.connection = sso_connection
        self.tenant = sso_connection.tenant
        self.secrets_service = get_secrets_service()

    def get_sp_entity_id(self) -> str:
        """Get the Service Provider Entity ID."""
        base_url = getattr(settings, 'WEB_APP_URL', 'http://localhost:3000')
        return f"{base_url}/sso/saml/{self.connection.id}/metadata"

    def get_acs_url(self) -> str:
        """Get the Assertion Consumer Service URL."""
        base_url = getattr(settings, 'API_URL', 'http://localhost:5001')
        return f"{base_url}/api/sso/saml/{self.connection.id}/acs"

    def get_slo_url(self) -> str:
        """Get the Single Logout URL."""
        base_url = getattr(settings, 'API_URL', 'http://localhost:5001')
        return f"{base_url}/api/sso/saml/{self.connection.id}/slo"

    def get_idp_certificate(self) -> Optional[str]:
        """Retrieve the IdP certificate from Secrets Manager."""
        if not self.connection.saml_certificate_arn:
            return None
        return self.secrets_service.get_secret(self.connection.saml_certificate_arn)

    def get_sp_signing_keys(self) -> Optional[Dict[str, str]]:
        """Retrieve the SP signing key pair from Secrets Manager."""
        if not self.connection.saml_signing_certificate_arn:
            return None
        return self.secrets_service.get_sp_signing_key(self.connection.saml_signing_certificate_arn)

    def generate_sp_metadata(self) -> str:
        """
        Generate SAML Service Provider metadata XML.

        Returns:
            SP metadata XML string
        """
        sp_entity_id = self.get_sp_entity_id()
        acs_url = self.get_acs_url()
        slo_url = self.get_slo_url()

        # Get signing certificate if available
        signing_keys = self.get_sp_signing_keys()
        certificate_xml = ''
        if signing_keys and signing_keys.get('certificate'):
            cert = signing_keys['certificate']
            # Remove PEM headers/footers and whitespace
            cert_clean = cert.replace('-----BEGIN CERTIFICATE-----', '')
            cert_clean = cert_clean.replace('-----END CERTIFICATE-----', '')
            cert_clean = cert_clean.replace('\n', '').strip()

            certificate_xml = f'''
    <md:KeyDescriptor use="signing">
      <ds:KeyInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
        <ds:X509Data>
          <ds:X509Certificate>{cert_clean}</ds:X509Certificate>
        </ds:X509Data>
      </ds:KeyInfo>
    </md:KeyDescriptor>'''

        metadata = f'''<?xml version="1.0" encoding="UTF-8"?>
<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata"
                     entityID="{sp_entity_id}">
  <md:SPSSODescriptor AuthnRequestsSigned="true"
                      WantAssertionsSigned="{str(self.connection.saml_want_assertions_signed).lower()}"
                      protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
{certificate_xml}
    <md:SingleLogoutService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect"
                            Location="{slo_url}"/>
    <md:NameIDFormat>{self.connection.saml_name_id_format}</md:NameIDFormat>
    <md:AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
                                 Location="{acs_url}"
                                 index="1"
                                 isDefault="true"/>
  </md:SPSSODescriptor>
</md:EntityDescriptor>'''

        return metadata.strip()

    def create_authn_request(
        self,
        relay_state: str = '',
        force_authn: bool = False,
    ) -> Tuple[str, str]:
        """
        Create a SAML AuthnRequest.

        Args:
            relay_state: State to preserve across the SSO flow
            force_authn: If True, request fresh authentication

        Returns:
            Tuple of (redirect_url, request_id)
        """
        import uuid
        import zlib

        request_id = f"_id{uuid.uuid4().hex}"
        issue_instant = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')

        sp_entity_id = self.get_sp_entity_id()
        acs_url = self.get_acs_url()

        force_authn_attr = 'ForceAuthn="true" ' if force_authn else ''

        authn_request = f'''<samlp:AuthnRequest xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
                           xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
                           ID="{request_id}"
                           Version="2.0"
                           IssueInstant="{issue_instant}"
                           Destination="{self.connection.saml_sso_url}"
                           AssertionConsumerServiceURL="{acs_url}"
                           {force_authn_attr}ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST">
  <saml:Issuer>{sp_entity_id}</saml:Issuer>
  <samlp:NameIDPolicy Format="{self.connection.saml_name_id_format}"
                      AllowCreate="true"/>
</samlp:AuthnRequest>'''

        # Deflate and base64 encode for HTTP-Redirect binding
        compressed = zlib.compress(authn_request.encode('utf-8'))[2:-4]  # Remove zlib header/trailer
        encoded = base64.b64encode(compressed).decode('utf-8')

        # Build redirect URL
        params = {'SAMLRequest': encoded}
        if relay_state:
            params['RelayState'] = relay_state

        redirect_url = f"{self.connection.saml_sso_url}?{urlencode(params)}"

        return redirect_url, request_id

    def parse_saml_response(
        self,
        saml_response: str,
        request_id: str = None,
    ) -> Dict[str, Any]:
        """
        Parse and validate a SAML Response.

        Args:
            saml_response: Base64-encoded SAML Response
            request_id: Expected InResponseTo value

        Returns:
            Dict containing user attributes from the assertion

        Raises:
            ValueError: If response validation fails
        """
        try:
            # Decode response
            response_xml = base64.b64decode(saml_response)
            root = ET.fromstring(response_xml)
        except Exception as e:
            raise ValueError(f"Invalid SAML Response format: {e}")

        # Check status
        status = root.find('.//samlp:StatusCode', SAML_NS)
        if status is None:
            raise ValueError("Missing StatusCode in SAML Response")

        status_value = status.get('Value', '')
        if not status_value.endswith('Success'):
            raise ValueError(f"SAML authentication failed: {status_value}")

        # Get assertion
        assertion = root.find('.//saml:Assertion', SAML_NS)
        if assertion is None:
            raise ValueError("No Assertion found in SAML Response")

        # Validate InResponseTo if request_id provided
        if request_id:
            in_response_to = root.get('InResponseTo')
            if in_response_to and in_response_to != request_id:
                raise ValueError("InResponseTo mismatch")

        # TODO: Validate signature using IdP certificate
        # This is a simplified implementation - production should use
        # a proper SAML library like python3-saml or djangosaml2

        # Extract NameID
        name_id = assertion.find('.//saml:NameID', SAML_NS)
        name_id_value = name_id.text if name_id is not None else None

        # Extract attributes
        attributes = {}
        attr_statement = assertion.find('.//saml:AttributeStatement', SAML_NS)
        if attr_statement is not None:
            for attr in attr_statement.findall('.//saml:Attribute', SAML_NS):
                attr_name = attr.get('Name', '')
                values = []
                for value in attr.findall('.//saml:AttributeValue', SAML_NS):
                    if value.text:
                        values.append(value.text)

                if len(values) == 1:
                    attributes[attr_name] = values[0]
                elif len(values) > 1:
                    attributes[attr_name] = values

        # Map attributes using configuration
        mapped = self._map_attributes(attributes)
        mapped['name_id'] = name_id_value
        mapped['raw_attributes'] = attributes

        return mapped

    def _map_attributes(self, attributes: Dict[str, Any]) -> Dict[str, Any]:
        """Map SAML attributes to user fields using connection configuration."""
        mapping = self.connection.saml_attribute_mapping or {
            # Default mappings for common attribute names
            'email': ['email', 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
            'first_name': ['firstName', 'givenName', 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'],
            'last_name': ['lastName', 'surname', 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname'],
            'groups': ['groups', 'memberOf', 'http://schemas.microsoft.com/ws/2008/06/identity/claims/groups'],
        }

        result = {}
        for target_field, source_attrs in mapping.items():
            if isinstance(source_attrs, str):
                source_attrs = [source_attrs]

            for source_attr in source_attrs:
                if source_attr in attributes:
                    result[target_field] = attributes[source_attr]
                    break

        # Ensure groups is always a list
        if 'groups' in result and not isinstance(result['groups'], list):
            result['groups'] = [result['groups']]

        return result

    def parse_idp_metadata(self, metadata_xml: str) -> Dict[str, Any]:
        """
        Parse IdP metadata XML to extract configuration.

        Args:
            metadata_xml: IdP metadata XML string

        Returns:
            Dict with extracted configuration values
        """
        try:
            root = ET.fromstring(metadata_xml)
        except ET.ParseError as e:
            raise ValueError(f"Invalid XML: {e}")

        config = {}

        # Get EntityID
        config['entity_id'] = root.get('entityID')

        # Find IDPSSODescriptor
        idp_desc = root.find('.//md:IDPSSODescriptor', SAML_NS)
        if idp_desc is None:
            raise ValueError("No IDPSSODescriptor found in metadata")

        # Get SSO endpoint
        sso_service = idp_desc.find(
            ".//md:SingleSignOnService[@Binding='urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect']", SAML_NS
        )
        if sso_service is not None:
            config['sso_url'] = sso_service.get('Location')

        # Get SLO endpoint
        slo_service = idp_desc.find(
            ".//md:SingleLogoutService[@Binding='urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect']", SAML_NS
        )
        if slo_service is not None:
            config['slo_url'] = slo_service.get('Location')

        # Get signing certificate
        key_desc = idp_desc.find(".//md:KeyDescriptor[@use='signing']", SAML_NS)
        if key_desc is None:
            # Try without use attribute
            key_desc = idp_desc.find(".//md:KeyDescriptor", SAML_NS)

        if key_desc is not None:
            cert = key_desc.find('.//ds:X509Certificate', SAML_NS)
            if cert is not None and cert.text:
                config['certificate'] = f"-----BEGIN CERTIFICATE-----\n{cert.text.strip()}\n-----END CERTIFICATE-----"

        return config
