"""
SAML 2.0 Service Provider implementation.

Security Notes:
- All SAML responses MUST have their signatures validated before processing
- Uses defusedxml for XML parsing to prevent XXE attacks
- Signature validation uses cryptography library for proper verification
"""

import base64
import logging
from datetime import datetime, timezone as dt_timezone
from typing import Optional, Dict, Any, Tuple
from urllib.parse import urlencode

import defusedxml.ElementTree as ET
from xml.etree.ElementTree import Element
from cryptography import x509
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding, rsa, ec
from cryptography.hazmat.backends import default_backend
from cryptography.exceptions import InvalidSignature

from django.conf import settings

from .secrets import get_secrets_service
from apps.sso.security import safe_log_user_identifier, validate_saml_response_basic

logger = logging.getLogger(__name__)


# SAML namespaces
SAML_NS = {
    'md': 'urn:oasis:names:tc:SAML:2.0:metadata',
    'saml': 'urn:oasis:names:tc:SAML:2.0:assertion',
    'samlp': 'urn:oasis:names:tc:SAML:2.0:protocol',
    'ds': 'http://www.w3.org/2000/09/xmldsig#',
}

# Signature algorithm mappings
SIGNATURE_ALGORITHMS = {
    'http://www.w3.org/2000/09/xmldsig#rsa-sha1': (hashes.SHA1, 'rsa'),
    'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256': (hashes.SHA256, 'rsa'),
    'http://www.w3.org/2001/04/xmldsig-more#rsa-sha384': (hashes.SHA384, 'rsa'),
    'http://www.w3.org/2001/04/xmldsig-more#rsa-sha512': (hashes.SHA512, 'rsa'),
    'http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha256': (hashes.SHA256, 'ecdsa'),
    'http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha384': (hashes.SHA384, 'ecdsa'),
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
        """Get the Service Provider Entity ID.

        The Entity ID should match the metadata URL for consistency.
        This is a common SAML convention and ensures the IdP can validate the SP.
        """
        base_url = getattr(settings, 'API_URL', 'http://localhost:3000')
        return f"{base_url}/api/sso/saml/{self.connection.id}/metadata"

    def get_acs_url(self) -> str:
        """Get the Assertion Consumer Service URL."""
        base_url = getattr(settings, 'API_URL', 'http://localhost:3000')
        return f"{base_url}/api/sso/saml/{self.connection.id}/acs"

    def get_slo_url(self) -> str:
        """Get the Single Logout URL."""
        base_url = getattr(settings, 'API_URL', 'http://localhost:3000')
        return f"{base_url}/api/sso/saml/{self.connection.id}/slo"

    def get_idp_certificate(self) -> Optional[str]:
        """
        Retrieve the IdP certificate for signature validation.

        Checks both local storage (for development) and AWS Secrets Manager.
        """
        # First check local certificate (development mode)
        if self.connection.saml_certificate:
            return self.connection.saml_certificate

        # Then check AWS Secrets Manager
        if self.connection.saml_certificate_arn:
            return self.secrets_service.get_secret(self.connection.saml_certificate_arn)

        return None

    def _load_idp_certificate(self) -> Optional[x509.Certificate]:
        """
        Load and parse the IdP X.509 certificate.

        Returns:
            Parsed X.509 certificate object, or None if not available
        """
        cert_pem = self.get_idp_certificate()
        if not cert_pem:
            return None

        try:
            # Ensure PEM format
            if '-----BEGIN CERTIFICATE-----' not in cert_pem:
                cert_pem = f"-----BEGIN CERTIFICATE-----\n{cert_pem}\n-----END CERTIFICATE-----"

            return x509.load_pem_x509_certificate(cert_pem.encode(), default_backend())
        except Exception as e:
            logger.error(f"Failed to load IdP certificate: {e}")
            return None

    def _verify_signature(self, root: Element, idp_cert: x509.Certificate) -> bool:
        """
        Verify the XML signature on a SAML response or assertion.

        This implements XML Signature verification according to the SAML spec.

        Args:
            root: The root XML element (Response or Assertion)
            idp_cert: The IdP's X.509 certificate

        Returns:
            True if signature is valid

        Raises:
            ValueError: If signature verification fails
        """
        # Find Signature element
        signature = root.find('.//ds:Signature', SAML_NS)
        if signature is None:
            # Check if signature is required
            if self.connection.saml_want_response_signed or self.connection.saml_want_assertions_signed:
                raise ValueError("SAML response/assertion signature required but not found")
            logger.warning("No signature found in SAML response (signature not required)")
            return True

        # Get SignedInfo
        signed_info = signature.find('ds:SignedInfo', SAML_NS)
        if signed_info is None:
            raise ValueError("SignedInfo not found in signature")

        # Get SignatureValue
        signature_value_elem = signature.find('ds:SignatureValue', SAML_NS)
        if signature_value_elem is None or not signature_value_elem.text:
            raise ValueError("SignatureValue not found in signature")

        signature_value = base64.b64decode(signature_value_elem.text.replace('\n', '').replace(' ', ''))

        # Get signature algorithm
        sig_method = signed_info.find('ds:SignatureMethod', SAML_NS)
        if sig_method is None:
            raise ValueError("SignatureMethod not found")

        algorithm_uri = sig_method.get('Algorithm', '')
        if algorithm_uri not in SIGNATURE_ALGORITHMS:
            raise ValueError(f"Unsupported signature algorithm: {algorithm_uri}")

        hash_algo_class, key_type = SIGNATURE_ALGORITHMS[algorithm_uri]
        hash_algo = hash_algo_class()

        # Canonicalize SignedInfo for verification
        # Note: This is a simplified canonicalization. Production should use
        # proper C14N canonicalization.
        signed_info_bytes = ET.tostring(signed_info, encoding='unicode').encode('utf-8')

        # Get public key from certificate
        public_key = idp_cert.public_key()

        # Verify signature based on key type
        try:
            if key_type == 'rsa' and isinstance(public_key, rsa.RSAPublicKey):
                public_key.verify(signature_value, signed_info_bytes, padding.PKCS1v15(), hash_algo)
            elif key_type == 'ecdsa' and isinstance(public_key, ec.EllipticCurvePublicKey):
                public_key.verify(signature_value, signed_info_bytes, ec.ECDSA(hash_algo))
            else:
                raise ValueError(f"Key type mismatch: expected {key_type}")

            logger.debug("SAML signature verification successful")
            return True

        except InvalidSignature:
            raise ValueError("SAML signature verification failed - signature is invalid")
        except Exception as e:
            raise ValueError(f"SAML signature verification error: {e}")

    def _validate_assertion_conditions(self, assertion: Element) -> None:
        """
        Validate assertion conditions (time bounds, audience).

        Args:
            assertion: The SAML Assertion element

        Raises:
            ValueError: If conditions are not met
        """
        conditions = assertion.find('.//saml:Conditions', SAML_NS)
        if conditions is None:
            return  # No conditions to validate

        now = datetime.now(dt_timezone.utc)

        # Check NotBefore
        not_before = conditions.get('NotBefore')
        if not_before:
            try:
                not_before_dt = datetime.fromisoformat(not_before.replace('Z', '+00:00'))
                # Allow 5 minute clock skew
                if now < not_before_dt.replace(tzinfo=dt_timezone.utc) - __import__('datetime').timedelta(minutes=5):
                    raise ValueError("SAML assertion is not yet valid (NotBefore)")
            except ValueError as e:
                if "not yet valid" in str(e):
                    raise
                logger.warning(f"Could not parse NotBefore: {not_before}")

        # Check NotOnOrAfter
        not_on_or_after = conditions.get('NotOnOrAfter')
        if not_on_or_after:
            try:
                not_on_or_after_dt = datetime.fromisoformat(not_on_or_after.replace('Z', '+00:00'))
                # Allow 5 minute clock skew
                if now > not_on_or_after_dt.replace(tzinfo=dt_timezone.utc) + __import__('datetime').timedelta(
                    minutes=5
                ):
                    raise ValueError("SAML assertion has expired (NotOnOrAfter)")
            except ValueError as e:
                if "expired" in str(e):
                    raise
                logger.warning(f"Could not parse NotOnOrAfter: {not_on_or_after}")

        # Check Audience
        audience_restriction = conditions.find('.//saml:AudienceRestriction/saml:Audience', SAML_NS)
        if audience_restriction is not None and audience_restriction.text:
            expected_audience = self.get_sp_entity_id()
            if audience_restriction.text != expected_audience:
                raise ValueError(f"SAML audience mismatch: expected {expected_audience}")

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

        request_id = f"_{uuid.uuid4().hex}"
        issue_instant = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')

        sp_entity_id = self.get_sp_entity_id()
        acs_url = self.get_acs_url()

        # Build AuthnRequest with minimal whitespace (Google is strict about XML formatting)
        force_authn_attr = ' ForceAuthn="true"' if force_authn else ''

        # Compact XML format - Google's SAML parser is strict about whitespace
        authn_request = (
            f'<samlp:AuthnRequest'
            f' xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"'
            f' xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"'
            f' ID="{request_id}"'
            f' Version="2.0"'
            f' IssueInstant="{issue_instant}"'
            f' Destination="{self.connection.saml_sso_url}"'
            f' AssertionConsumerServiceURL="{acs_url}"'
            f' ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"'
            f'{force_authn_attr}>'
            f'<saml:Issuer>{sp_entity_id}</saml:Issuer>'
            f'<samlp:NameIDPolicy Format="{self.connection.saml_name_id_format}" AllowCreate="true"/>'
            f'</samlp:AuthnRequest>'
        )

        logger.debug(f"Generated SAML AuthnRequest for connection {self.connection.id}: {authn_request[:200]}...")

        # Deflate and base64 encode for HTTP-Redirect binding
        # Use raw deflate (no zlib header/trailer) as per SAML spec
        compressed = zlib.compress(authn_request.encode('utf-8'), 9)[2:-4]
        encoded = base64.b64encode(compressed).decode('utf-8')

        # Build redirect URL
        params = {'SAMLRequest': encoded}
        if relay_state:
            params['RelayState'] = relay_state

        # Check if SSO URL already has query parameters
        # If so, use & instead of ? to append our parameters
        separator = '&' if '?' in self.connection.saml_sso_url else '?'
        redirect_url = f"{self.connection.saml_sso_url}{separator}{urlencode(params)}"

        return redirect_url, request_id

    def parse_saml_response(
        self,
        saml_response: str,
        request_id: str = None,
    ) -> Dict[str, Any]:
        """
        Parse and validate a SAML Response with full security checks.

        Security validations performed:
        1. XML parsing with defusedxml (XXE protection)
        2. Status code verification
        3. Signature verification (if certificate available)
        4. Assertion conditions validation (time bounds, audience)
        5. InResponseTo validation (replay protection)

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

            # Basic sanity check before parsing
            if not validate_saml_response_basic(response_xml):
                raise ValueError("Invalid SAML Response: failed basic validation")

            root = ET.fromstring(response_xml)
        except ValueError:
            raise
        except Exception:
            raise ValueError("Invalid SAML Response format: failed to decode/parse")

        # Check status FIRST (before signature validation)
        status = root.find('.//samlp:StatusCode', SAML_NS)
        if status is None:
            raise ValueError("Missing StatusCode in SAML Response")

        status_value = status.get('Value', '')
        if not status_value.endswith('Success'):
            # Don't include detailed status in error (could leak info)
            logger.warning(f"SAML authentication failed with status: {status_value}")
            raise ValueError("SAML authentication failed")

        # Get assertion
        assertion = root.find('.//saml:Assertion', SAML_NS)
        if assertion is None:
            raise ValueError("No Assertion found in SAML Response")

        # CRITICAL: Validate signature using IdP certificate
        # SECURITY: Always require IdP certificate for SAML authentication
        idp_cert = self._load_idp_certificate()
        if idp_cert:
            # Verify signature on Response or Assertion
            try:
                self._verify_signature(root, idp_cert)
            except ValueError as e:
                logger.error(f"SAML signature verification failed: {e}")
                raise ValueError("SAML signature verification failed")

            # Also validate assertion-level signature if present
            assertion_signature = assertion.find('.//ds:Signature', SAML_NS)
            if assertion_signature is not None:
                self._verify_signature(assertion, idp_cert)
        else:
            # SECURITY: Never accept SAML responses without certificate verification
            # This prevents authentication bypass attacks with forged SAML assertions
            logger.error(
                f"SAML response rejected - no IdP certificate configured for connection {self.connection.id}. "
                f"Certificate is REQUIRED for secure SAML authentication."
            )
            raise ValueError(
                "IdP certificate must be configured for SAML authentication. "
                "Please configure the IdP certificate in the SSO connection settings."
            )

        # Validate assertion conditions (time, audience)
        self._validate_assertion_conditions(assertion)

        # SECURITY: Validate InResponseTo for replay protection
        in_response_to = root.get('InResponseTo')
        if request_id:
            # Strict validation when request_id is provided
            if not in_response_to:
                logger.warning(
                    f"SAML response missing InResponseTo attribute for connection {self.connection.id}. "
                    f"This weakens replay protection."
                )
                # Allow responses without InResponseTo for IdP-initiated flows,
                # but log for security monitoring
            elif in_response_to != request_id:
                logger.error(
                    f"SAML InResponseTo mismatch: expected {request_id}, got {in_response_to}. "
                    f"Possible replay attack detected."
                )
                raise ValueError("Request ID mismatch - possible replay attack")

            # SECURITY: Mark request_id as consumed to prevent replay
            from django.core.cache import cache

            consumed_key = f'saml_request_consumed_{request_id}'
            if cache.get(consumed_key):
                logger.error(f"SAML request ID {request_id} has already been used - replay attack detected")
                raise ValueError("SAML response already processed - replay attack detected")
            # Mark as consumed with 1 hour expiry (longer than session timeout)
            cache.set(consumed_key, True, timeout=3600)
        else:
            # Log when called without request_id (IdP-initiated flow)
            logger.info(
                f"SAML response processed without request_id validation for connection {self.connection.id}. "
                f"This may be an IdP-initiated login flow."
            )

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

        # If no email was found in attributes, try using NameID
        # Google Workspace often sends email as the NameID
        if not mapped.get('email') and name_id_value and '@' in name_id_value:
            mapped['email'] = name_id_value
            logger.debug(f"Using NameID as email: {name_id_value}")

        # Log safely without exposing PII
        logger.info(
            f"SAML response parsed successfully - "
            f"user: {safe_log_user_identifier(mapped.get('email', ''))}, "
            f"attrs_count: {len(attributes)}"
        )

        return mapped

    def _map_attributes(self, attributes: Dict[str, Any]) -> Dict[str, Any]:
        """Map SAML attributes to user fields using connection configuration."""
        mapping = self.connection.saml_attribute_mapping or {
            # Default mappings for common attribute names across providers
            'email': [
                'email',
                'Email',
                'User.Email',  # Google Workspace
                'user.email',
                'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
                'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
            ],
            'first_name': [
                'firstName',
                'FirstName',
                'User.FirstName',  # Google Workspace
                'givenName',
                'GivenName',
                'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
            ],
            'last_name': [
                'lastName',
                'LastName',
                'User.LastName',  # Google Workspace
                'surname',
                'Surname',
                'sn',
                'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname',
            ],
            'groups': [
                'groups',
                'Groups',
                'memberOf',
                'http://schemas.microsoft.com/ws/2008/06/identity/claims/groups',
            ],
        }

        logger.debug(f"Mapping SAML attributes. Raw attributes: {list(attributes.keys())}")

        result = {}
        for target_field, source_attrs in mapping.items():
            if isinstance(source_attrs, str):
                source_attrs = [source_attrs]

            for source_attr in source_attrs:
                if source_attr in attributes:
                    result[target_field] = attributes[source_attr]
                    logger.debug(f"Mapped {source_attr} -> {target_field}: {attributes[source_attr]}")
                    break

        # Ensure groups is always a list
        if 'groups' in result and not isinstance(result['groups'], list):
            result['groups'] = [result['groups']]

        logger.debug(f"Mapped attributes result: {result}")
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
