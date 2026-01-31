"""
WebAuthn/Passkeys implementation for passwordless authentication.
Provides registration and authentication flows for passkeys.

Security Features:
- Proper cryptographic signature verification using COSE keys
- Origin validation (always enforced, explicit override for development)
- Sign count verification with strict enforcement option
- Challenge replay protection
"""

import base64
import hashlib
import json
import logging
from typing import Dict, Any, Tuple, List

from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.backends import default_backend
from cryptography.exceptions import InvalidSignature

from django.conf import settings

from apps.users.models import User
from apps.sso.models import UserPasskey, WebAuthnChallenge, SSOAuditLog
from apps.sso.constants import SSOAuditEventType

logger = logging.getLogger(__name__)


# COSE algorithm identifiers
COSE_ALG_ES256 = -7  # ECDSA with SHA-256
COSE_ALG_RS256 = -257  # RSASSA-PKCS1-v1_5 with SHA-256

# COSE key types
COSE_KTY_EC2 = 2  # Elliptic Curve
COSE_KTY_RSA = 3  # RSA


class WebAuthnService:
    """
    WebAuthn Relying Party implementation.
    Handles passkey registration and authentication.

    Security Configuration (settings.py):
    - WEBAUTHN_ALLOW_ORIGIN_MISMATCH: Allow origin mismatch for local development (default: False)
    - WEBAUTHN_STRICT_SIGN_COUNT: Reject authentications with sign count anomalies (default: True)
    """

    # Challenge TTL in seconds
    CHALLENGE_TTL = 300  # 5 minutes

    def __init__(self, user: User = None):
        """
        Initialize WebAuthn service.

        Args:
            user: The user for passkey operations (optional for discovery)
        """
        self.user = user
        self.rp_id = self._get_rp_id()
        self.rp_name = getattr(settings, 'PROJECT_NAME', 'SaaS Boilerplate')

    def _get_rp_id(self) -> str:
        """Get the Relying Party ID (domain)."""
        # Use the web app URL to determine the RP ID
        web_app_url = getattr(settings, 'WEB_APP_URL', 'http://localhost:3000')
        from urllib.parse import urlparse

        parsed = urlparse(web_app_url)
        return parsed.hostname or 'localhost'

    def _get_origin(self) -> str:
        """Get the expected origin for WebAuthn."""
        return getattr(settings, 'WEB_APP_URL', 'http://localhost:3000')

    def _get_allowed_origins(self) -> List[str]:
        """Get list of allowed origins for WebAuthn."""
        origins = [self._get_origin()]
        # Add any additional allowed origins from settings
        extra_origins = getattr(settings, 'WEBAUTHN_ALLOWED_ORIGINS', [])
        origins.extend(extra_origins)
        return origins

    def _verify_origin(self, actual_origin: str) -> bool:
        """
        Verify the origin from client data.

        SECURITY: This is always enforced unless explicitly overridden via
        WEBAUTHN_ALLOW_ORIGIN_MISMATCH setting (should NEVER be True in production).

        Args:
            actual_origin: The origin from client data JSON

        Returns:
            True if origin is valid

        Raises:
            ValueError: If origin verification fails
        """
        allowed_origins = self._get_allowed_origins()

        if actual_origin in allowed_origins:
            return True

        # Check for explicit development override (NOT based on DEBUG setting)
        allow_mismatch = getattr(settings, 'WEBAUTHN_ALLOW_ORIGIN_MISMATCH', False)

        if allow_mismatch:
            logger.warning(
                f"SECURITY: Origin mismatch allowed (WEBAUTHN_ALLOW_ORIGIN_MISMATCH=True): "
                f"expected one of {allowed_origins}, got {actual_origin}. "
                f"This should NEVER be enabled in production!"
            )
            return True

        logger.error(f"WebAuthn origin verification failed: expected one of {allowed_origins}, got {actual_origin}")
        raise ValueError("Origin verification failed")

    def _parse_cose_key(self, cose_key_bytes: bytes) -> Dict[str, Any]:
        """
        Parse a COSE key into its components.

        Args:
            cose_key_bytes: Raw COSE key bytes

        Returns:
            Dict with key components (kty, alg, crv, x, y for EC; n, e for RSA)
        """
        import cbor2

        try:
            cose_key = cbor2.loads(cose_key_bytes)
        except Exception as e:
            raise ValueError(f"Failed to parse COSE key: {e}")

        return cose_key

    def _verify_signature_ec(
        self,
        public_key_bytes: bytes,
        signature: bytes,
        data: bytes,
        algorithm: int,
    ) -> bool:
        """
        Verify an ECDSA signature.

        Args:
            public_key_bytes: Raw EC public key bytes (COSE format)
            signature: The signature to verify (raw r||s format)
            data: The signed data
            algorithm: COSE algorithm identifier

        Returns:
            True if signature is valid

        Raises:
            ValueError: If verification fails
        """
        try:
            cose_key = self._parse_cose_key(public_key_bytes)

            # Extract EC key components
            # COSE key parameter labels: -2 = x, -3 = y
            x = cose_key.get(-2)
            y = cose_key.get(-3)

            if not x or not y:
                raise ValueError("Missing EC key coordinates")

            # Build the public key from x, y coordinates
            # For P-256 curve (ES256)
            from cryptography.hazmat.primitives.asymmetric.ec import (
                EllipticCurvePublicNumbers,
                SECP256R1,
            )

            x_int = int.from_bytes(x, 'big')
            y_int = int.from_bytes(y, 'big')

            public_numbers = EllipticCurvePublicNumbers(x_int, y_int, SECP256R1())
            public_key = public_numbers.public_key(default_backend())

            # WebAuthn signature is in raw r||s format, need to convert to DER
            if len(signature) == 64:
                r = int.from_bytes(signature[:32], 'big')
                s = int.from_bytes(signature[32:], 'big')

                # Convert to DER format
                from cryptography.hazmat.primitives.asymmetric.utils import encode_dss_signature

                der_signature = encode_dss_signature(r, s)
            else:
                # Assume it's already DER encoded
                der_signature = signature

            # Verify the signature
            public_key.verify(der_signature, data, ec.ECDSA(hashes.SHA256()))

            return True

        except InvalidSignature:
            logger.error("WebAuthn EC signature verification failed: invalid signature")
            raise ValueError("Signature verification failed")
        except Exception as e:
            logger.error(f"WebAuthn EC signature verification error: {e}")
            raise ValueError(f"Signature verification failed: {e}")

    def _verify_webauthn_signature(
        self,
        public_key_cose: bytes,
        authenticator_data: bytes,
        client_data_hash: bytes,
        signature: bytes,
    ) -> bool:
        """
        Verify a WebAuthn authentication signature.

        The signature is computed over: authenticator_data || SHA256(client_data_json)

        Args:
            public_key_cose: The stored public key in COSE format
            authenticator_data: Raw authenticator data bytes
            client_data_hash: SHA256 hash of client data JSON
            signature: The signature bytes

        Returns:
            True if signature is valid

        Raises:
            ValueError: If verification fails
        """
        # Check if signature verification should be skipped (for backwards compatibility)
        # SECURITY: This should be False in production once all passkeys are re-registered
        skip_verification = getattr(settings, 'WEBAUTHN_SKIP_SIGNATURE_VERIFICATION', False)
        if skip_verification:
            logger.warning(
                "SECURITY: Skipping WebAuthn signature verification "
                "(WEBAUTHN_SKIP_SIGNATURE_VERIFICATION=True). "
                "This should be disabled in production!"
            )
            return True

        # The signed data is authenticator_data || client_data_hash
        signed_data = authenticator_data + client_data_hash

        # Parse COSE key to determine algorithm
        try:
            cose_key = self._parse_cose_key(public_key_cose)
        except ValueError as e:
            logger.error(f"Failed to parse COSE key: {e}")
            raise ValueError("Invalid public key format")

        # Verify the parsed key is a dict (COSE keys are CBOR maps)
        if not isinstance(cose_key, dict):
            logger.error(
                f"COSE key parsing returned unexpected type: {type(cose_key).__name__}. "
                "The stored public key may not be in COSE format. "
                "Re-register the passkey to fix this issue."
            )
            raise ValueError("Invalid public key format: expected COSE key map")

        kty = cose_key.get(1)  # Key type
        alg = cose_key.get(3)  # Algorithm

        if kty == COSE_KTY_EC2 and alg == COSE_ALG_ES256:
            return self._verify_signature_ec(public_key_cose, signature, signed_data, alg)
        else:
            # For other algorithms, we'd need additional implementations
            # Currently only ES256 is supported
            raise ValueError(f"Unsupported key type/algorithm: kty={kty}, alg={alg}")

    # ==================
    # Registration Flow
    # ==================

    def create_registration_options(
        self,
        user_verification: str = 'preferred',
        authenticator_attachment: str = None,
        require_resident_key: bool = True,
    ) -> Tuple[Dict[str, Any], str]:
        """
        Create registration options for passkey enrollment.

        Args:
            user_verification: 'required', 'preferred', or 'discouraged'
            authenticator_attachment: 'platform', 'cross-platform', or None (any)
            require_resident_key: Whether to require a discoverable credential

        Returns:
            Tuple of (registration_options, challenge)
        """
        if not self.user:
            raise ValueError("User is required for registration")

        # Create challenge
        challenge_record = WebAuthnChallenge.create_challenge(
            user=self.user,
            challenge_type='registration',
            ttl_seconds=self.CHALLENGE_TTL,
        )

        # Get existing credentials to exclude
        existing_credentials = UserPasskey.objects.filter(
            user=self.user,
            is_active=True,
        ).values_list('credential_id', flat=True)

        exclude_credentials = [
            {
                'id': cred_id,
                'type': 'public-key',
            }
            for cred_id in existing_credentials
        ]

        # Build options
        options = {
            'challenge': challenge_record.challenge,
            'rp': {
                'name': self.rp_name,
                'id': self.rp_id,
            },
            'user': {
                'id': self._encode_user_id(self.user),
                'name': self.user.email,
                'displayName': self._get_user_display_name(),
            },
            'pubKeyCredParams': [
                {'type': 'public-key', 'alg': -7},  # ES256
                {'type': 'public-key', 'alg': -257},  # RS256
            ],
            'timeout': self.CHALLENGE_TTL * 1000,  # milliseconds
            'attestation': 'none',  # We don't need attestation for most use cases
            'authenticatorSelection': {
                'userVerification': user_verification,
                'residentKey': 'required' if require_resident_key else 'preferred',
                'requireResidentKey': require_resident_key,
            },
            'excludeCredentials': exclude_credentials,
        }

        if authenticator_attachment:
            options['authenticatorSelection']['authenticatorAttachment'] = authenticator_attachment

        return options, challenge_record.challenge

    def verify_registration(
        self,
        challenge: str,
        credential_id: str,
        public_key: str,
        attestation_object: str,
        client_data_json: str,
        name: str = 'My Passkey',
        transports: List[str] = None,
        ip_address: str = None,
    ) -> UserPasskey:
        """
        Verify a registration response and create the passkey.

        Args:
            challenge: The original challenge
            credential_id: Base64url-encoded credential ID
            public_key: Base64url-encoded public key (COSE format)
            attestation_object: Base64url-encoded attestation object
            client_data_json: Base64url-encoded client data JSON
            name: User-provided name for the passkey
            transports: List of transports supported by the authenticator
            ip_address: Request IP for audit

        Returns:
            Created UserPasskey instance

        Raises:
            ValueError: If verification fails
        """
        if not self.user:
            raise ValueError("User is required for registration")

        # Find and validate challenge
        challenge_record = WebAuthnChallenge.objects.filter(
            user=self.user,
            challenge=challenge,
            challenge_type='registration',
        ).first()

        if not challenge_record:
            raise ValueError("Challenge not found")

        if not challenge_record.is_valid:
            raise ValueError("Challenge expired or already used")

        # Verify client data
        try:
            client_data_bytes = base64.urlsafe_b64decode(client_data_json + '=' * (-len(client_data_json) % 4))
            client_data = json.loads(client_data_bytes)
        except Exception as e:
            raise ValueError(f"Invalid client data: {e}")

        # Verify challenge in client data
        client_challenge = client_data.get('challenge', '')
        # Client challenge is base64url encoded
        if client_challenge != challenge:
            raise ValueError("Challenge mismatch")

        # SECURITY: Always verify origin (use explicit setting for dev override, NOT DEBUG)
        actual_origin = client_data.get('origin', '')
        self._verify_origin(actual_origin)

        # Verify type
        if client_data.get('type') != 'webauthn.create':
            raise ValueError("Invalid client data type")

        # Parse attestation object to extract AAGUID
        aaguid = ''
        try:
            import cbor2

            attestation_bytes = base64.urlsafe_b64decode(attestation_object + '=' * (-len(attestation_object) % 4))
            attestation = cbor2.loads(attestation_bytes)
            auth_data = attestation.get('authData', b'')

            # Extract AAGUID from authenticator data (bytes 37-52 if flags indicate attested credential)
            if len(auth_data) >= 55:
                flags = auth_data[32]
                # Check if attested credential data is present (bit 6)
                if flags & 0x40:
                    aaguid_bytes = auth_data[37:53]
                    aaguid = aaguid_bytes.hex()
        except Exception as e:
            logger.warning(f"Failed to extract AAGUID from attestation: {e}")

        # Mark challenge as used
        challenge_record.mark_used()

        # Create passkey
        passkey = UserPasskey.objects.create(
            user=self.user,
            credential_id=credential_id,
            name=name,
            public_key=public_key,
            sign_count=0,
            aaguid=aaguid,
            transports=transports or [],
            authenticator_type='platform' if 'internal' in (transports or []) else 'cross-platform',
            registered_from_ip=ip_address,
        )

        # Log event
        SSOAuditLog.log_event(
            event_type=SSOAuditEventType.PASSKEY_REGISTERED,
            user=self.user,
            description=f'Passkey "{name}" registered',
            ip_address=ip_address,
            metadata={'credential_id_prefix': credential_id[:8]},
        )

        return passkey

    # ==================
    # Authentication Flow
    # ==================

    def create_authentication_options(
        self,
        user_verification: str = 'preferred',
    ) -> Tuple[Dict[str, Any], str]:
        """
        Create authentication options for passkey login.

        Args:
            user_verification: 'required', 'preferred', or 'discouraged'

        Returns:
            Tuple of (authentication_options, challenge)
        """
        # Create challenge
        challenge_record = WebAuthnChallenge.create_challenge(
            user=self.user,  # May be None for discoverable credentials
            challenge_type='authentication',
            ttl_seconds=self.CHALLENGE_TTL,
        )

        options = {
            'challenge': challenge_record.challenge,
            'timeout': self.CHALLENGE_TTL * 1000,
            'rpId': self.rp_id,
            'userVerification': user_verification,
        }

        # If user is known, provide allowed credentials
        if self.user:
            credentials = UserPasskey.objects.filter(
                user=self.user,
                is_active=True,
            ).values('credential_id', 'transports')

            options['allowCredentials'] = [
                {
                    'id': cred['credential_id'],
                    'type': 'public-key',
                    'transports': cred['transports'] or [],
                }
                for cred in credentials
            ]

        return options, challenge_record.challenge

    def verify_authentication(
        self,
        challenge: str,
        credential_id: str,
        authenticator_data: str,
        client_data_json: str,
        signature: str,
        user_handle: str = None,
        ip_address: str = None,
    ) -> Tuple[User, UserPasskey]:
        """
        Verify an authentication response with full cryptographic validation.

        Security validations performed:
        1. Challenge validation (replay protection)
        2. Origin verification
        3. Cryptographic signature verification using stored public key
        4. Sign count verification (cloned authenticator detection)

        Args:
            challenge: The original challenge
            credential_id: Base64url-encoded credential ID
            authenticator_data: Base64url-encoded authenticator data
            client_data_json: Base64url-encoded client data JSON
            signature: Base64url-encoded signature
            user_handle: Base64url-encoded user handle (for discoverable credentials)
            ip_address: Request IP for audit

        Returns:
            Tuple of (user, passkey)

        Raises:
            ValueError: If verification fails
        """
        # Find passkey by credential ID
        passkey = (
            UserPasskey.objects.filter(
                credential_id=credential_id,
                is_active=True,
            )
            .select_related('user')
            .first()
        )

        if not passkey:
            raise ValueError("Passkey not found")

        user = passkey.user

        # Find and validate challenge
        challenge_record = WebAuthnChallenge.objects.filter(
            challenge=challenge,
            challenge_type='authentication',
        ).first()

        if not challenge_record:
            raise ValueError("Challenge not found")

        if not challenge_record.is_valid:
            raise ValueError("Challenge expired or already used")

        # Decode client data
        try:
            client_data_bytes = base64.urlsafe_b64decode(client_data_json + '=' * (-len(client_data_json) % 4))
            client_data = json.loads(client_data_bytes)
        except Exception as e:
            raise ValueError(f"Invalid client data: {e}")

        # Verify challenge
        if client_data.get('challenge') != challenge:
            raise ValueError("Challenge mismatch")

        # SECURITY: Verify origin (always enforced)
        actual_origin = client_data.get('origin', '')
        self._verify_origin(actual_origin)

        # Verify type
        if client_data.get('type') != 'webauthn.get':
            raise ValueError("Invalid client data type")

        # Decode authenticator data and signature
        try:
            auth_data_bytes = base64.urlsafe_b64decode(authenticator_data + '=' * (-len(authenticator_data) % 4))
            signature_bytes = base64.urlsafe_b64decode(signature + '=' * (-len(signature) % 4))
        except Exception as e:
            raise ValueError(f"Invalid authenticator data or signature: {e}")

        # SECURITY: Verify the cryptographic signature
        # Signature is over: authenticator_data || SHA256(client_data_json)
        client_data_hash = hashlib.sha256(client_data_bytes).digest()

        try:
            # Decode the stored public key
            public_key_bytes = base64.urlsafe_b64decode(passkey.public_key + '=' * (-len(passkey.public_key) % 4))

            # Verify the signature
            self._verify_webauthn_signature(
                public_key_cose=public_key_bytes,
                authenticator_data=auth_data_bytes,
                client_data_hash=client_data_hash,
                signature=signature_bytes,
            )
            logger.debug(f"WebAuthn signature verification successful for user {user.email}")
        except ValueError:
            # Log the authentication failure
            SSOAuditLog.log_event(
                event_type=SSOAuditEventType.PASSKEY_AUTH_FAILED,
                user=user,
                description='Passkey authentication failed: signature verification failed',
                ip_address=ip_address,
                success=False,
                metadata={'credential_id_prefix': credential_id[:8] if credential_id else 'unknown'},
            )
            raise ValueError("Authentication failed: signature verification failed")

        # Parse sign count from authenticator data (bytes 33-36, big-endian uint32)
        try:
            new_sign_count = int.from_bytes(auth_data_bytes[33:37], 'big')
        except Exception:
            logger.warning("Failed to parse sign count from authenticator data")
            new_sign_count = passkey.sign_count + 1

        # SECURITY: Verify sign count (protection against cloned authenticators)
        strict_sign_count = getattr(settings, 'WEBAUTHN_STRICT_SIGN_COUNT', True)

        if new_sign_count <= passkey.sign_count and passkey.sign_count > 0:
            logger.error(
                f"SECURITY ALERT: Passkey sign count anomaly detected for user {user.email}. "
                f"Expected > {passkey.sign_count}, got {new_sign_count}. "
                f"This may indicate a cloned authenticator!"
            )

            # Log security event
            SSOAuditLog.log_event(
                event_type=SSOAuditEventType.PASSKEY_CLONE_DETECTED,
                user=user,
                description='Sign count anomaly detected - possible cloned authenticator',
                ip_address=ip_address,
                success=False,
                metadata={
                    'expected_sign_count': passkey.sign_count,
                    'received_sign_count': new_sign_count,
                    'passkey_name': passkey.name,
                    'credential_id_prefix': credential_id[:8] if credential_id else 'unknown',
                },
            )

            if strict_sign_count:
                # Deactivate the potentially compromised passkey
                passkey.deactivate()
                raise ValueError(
                    "Authentication rejected: security anomaly detected. "
                    "Please re-register your passkey or contact support."
                )
            else:
                logger.warning(
                    "Sign count anomaly allowed (WEBAUTHN_STRICT_SIGN_COUNT=False). "
                    "This is not recommended for production use."
                )

        # Mark challenge as used (before successful completion)
        challenge_record.mark_used()

        # Update passkey with new sign count
        passkey.record_use(new_sign_count)

        # Log successful authentication
        SSOAuditLog.log_event(
            event_type=SSOAuditEventType.PASSKEY_AUTH_SUCCESS,
            user=user,
            description=f'Authenticated with passkey "{passkey.name}"',
            ip_address=ip_address,
        )

        return user, passkey

    # ==================
    # Management
    # ==================

    def list_passkeys(self) -> List[UserPasskey]:
        """List all passkeys for the current user."""
        if not self.user:
            raise ValueError("User is required")

        return list(
            UserPasskey.objects.filter(
                user=self.user,
                is_active=True,
            ).order_by('-created_at')
        )

    def delete_passkey(self, passkey_id: str, ip_address: str = None) -> bool:
        """
        Delete a passkey.

        Args:
            passkey_id: The passkey ID to delete
            ip_address: Request IP for audit

        Returns:
            True if deleted
        """
        if not self.user:
            raise ValueError("User is required")

        passkey = UserPasskey.objects.filter(
            id=passkey_id,
            user=self.user,
        ).first()

        if not passkey:
            raise ValueError("Passkey not found")

        name = passkey.name
        passkey.deactivate()

        SSOAuditLog.log_event(
            event_type=SSOAuditEventType.PASSKEY_REMOVED,
            user=self.user,
            description=f'Passkey "{name}" removed',
            ip_address=ip_address,
        )

        return True

    def rename_passkey(self, passkey_id: str, new_name: str) -> UserPasskey:
        """
        Rename a passkey.

        Args:
            passkey_id: The passkey ID
            new_name: New name for the passkey

        Returns:
            Updated passkey
        """
        if not self.user:
            raise ValueError("User is required")

        passkey = UserPasskey.objects.filter(
            id=passkey_id,
            user=self.user,
            is_active=True,
        ).first()

        if not passkey:
            raise ValueError("Passkey not found")

        passkey.name = new_name
        passkey.save(update_fields=['name', 'updated_at'])

        return passkey

    # ==================
    # Helpers
    # ==================

    def _encode_user_id(self, user: User) -> str:
        """Encode user ID for WebAuthn."""
        return base64.urlsafe_b64encode(str(user.id).encode('utf-8')).rstrip(b'=').decode('utf-8')

    def _get_user_display_name(self) -> str:
        """Get user display name for WebAuthn."""
        if hasattr(self.user, 'profile') and self.user.profile:
            name = f"{self.user.profile.first_name} {self.user.profile.last_name}".strip()
            if name:
                return name
        return self.user.email
