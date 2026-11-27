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

import cbor2
from cryptography.exceptions import InvalidSignature
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ec, padding, rsa

from django.conf import settings
from django.utils import timezone

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

# COSE elliptic curves
COSE_CRV_P256 = 1

# Authenticator data layout: rpIdHash (32) | flags (1) | signCount (4) | attested credential data...
AUTH_DATA_MIN_LENGTH = 37
AUTH_DATA_FLAG_USER_PRESENT = 0x01
AUTH_DATA_FLAG_ATTESTED_CREDENTIAL = 0x40
AAGUID_LENGTH = 16


def _b64url_decode(value: str) -> bytes:
    return base64.urlsafe_b64decode(value + "=" * (-len(value) % 4))


def _b64url_encode(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).rstrip(b"=").decode("ascii")


class WebAuthnService:
    """
    WebAuthn Relying Party implementation.
    Handles passkey registration and authentication.

    Security Configuration (settings.py):
    - WEBAUTHN_ALLOW_ORIGIN_MISMATCH: Allow origin mismatch for local development (default: False)
    - WEBAUTHN_STRICT_SIGN_COUNT: Reject authentications with sign count anomalies (default: True)

    The assertion signature is always verified. There is deliberately no setting to turn that off.
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
        self.rp_name = getattr(settings, "PROJECT_NAME", "SaaS Boilerplate")

    def _get_rp_id(self) -> str:
        """Get the Relying Party ID (domain)."""
        # Use the web app URL to determine the RP ID
        web_app_url = getattr(settings, "WEB_APP_URL", "http://localhost:3000")
        from urllib.parse import urlparse

        parsed = urlparse(web_app_url)
        return parsed.hostname or "localhost"

    def _get_origin(self) -> str:
        """Get the expected origin for WebAuthn."""
        return getattr(settings, "WEB_APP_URL", "http://localhost:3000")

    def _get_allowed_origins(self) -> List[str]:
        """Get list of allowed origins for WebAuthn."""
        origins = [self._get_origin()]
        # Add any additional allowed origins from settings
        extra_origins = getattr(settings, "WEBAUTHN_ALLOWED_ORIGINS", [])
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
        allow_mismatch = getattr(settings, "WEBAUTHN_ALLOW_ORIGIN_MISMATCH", False)

        if allow_mismatch:
            logger.warning(
                f"SECURITY: Origin mismatch allowed (WEBAUTHN_ALLOW_ORIGIN_MISMATCH=True): "
                f"expected one of {allowed_origins}, got {actual_origin}. "
                f"This should NEVER be enabled in production!"
            )
            return True

        logger.error(f"WebAuthn origin verification failed: expected one of {allowed_origins}, got {actual_origin}")
        raise ValueError("Origin verification failed")

    def _public_key_from_cose(self, cose_key: Any):
        """
        Build a public key from a decoded COSE_Key map.

        Supports the algorithms offered at registration: ES256 (P-256) and RS256.

        Raises:
            ValueError: If the key is malformed or of an unsupported type
        """
        if not isinstance(cose_key, dict):
            raise ValueError("Invalid public key format: expected COSE key map")

        kty = cose_key.get(1)
        try:
            if kty == COSE_KTY_EC2 and cose_key.get(-1) == COSE_CRV_P256:
                x = int.from_bytes(cose_key[-2], "big")
                y = int.from_bytes(cose_key[-3], "big")
                return ec.EllipticCurvePublicNumbers(x, y, ec.SECP256R1()).public_key()
            if kty == COSE_KTY_RSA:
                n = int.from_bytes(cose_key[-1], "big")
                e = int.from_bytes(cose_key[-2], "big")
                return rsa.RSAPublicNumbers(e, n).public_key()
        except (KeyError, TypeError, ValueError) as e:
            raise ValueError(f"Invalid public key: {e}")

        raise ValueError(f"Unsupported key type: kty={kty}, alg={cose_key.get(3)}")

    def _load_public_key(self, stored_public_key: str):
        """
        Load a passkey's stored public key.

        Two encodings are accepted:
        - COSE_Key, taken from the attestation at registration (current format)
        - SubjectPublicKeyInfo DER, as returned by the browser's `getPublicKey()`
          (passkeys registered before the key was read from the attestation)

        Raises:
            ValueError: If the stored value is not a usable public key
        """
        try:
            key_bytes = _b64url_decode(stored_public_key or "")
        except Exception:
            raise ValueError("Stored public key is not valid base64url")

        if not key_bytes:
            raise ValueError("Passkey has no stored public key")

        try:
            public_key = serialization.load_der_public_key(key_bytes)
        except Exception:
            try:
                cose_key = cbor2.loads(key_bytes)
            except Exception:
                raise ValueError("Stored public key is neither COSE nor SubjectPublicKeyInfo")
            return self._public_key_from_cose(cose_key)

        if isinstance(public_key, ec.EllipticCurvePublicKey) and not isinstance(public_key.curve, ec.SECP256R1):
            raise ValueError(f"Unsupported elliptic curve: {public_key.curve.name}")
        return public_key

    def _verify_webauthn_signature(
        self,
        stored_public_key: str,
        authenticator_data: bytes,
        client_data_hash: bytes,
        signature: bytes,
    ) -> bool:
        """
        Verify a WebAuthn assertion signature.

        The signature is computed over: authenticator_data || SHA256(client_data_json)

        Args:
            stored_public_key: The passkey's public key as stored (base64url)
            authenticator_data: Raw authenticator data bytes
            client_data_hash: SHA256 hash of client data JSON
            signature: The signature bytes (ASN.1 DER for ES256, PKCS#1 v1.5 for RS256)

        Returns:
            True if signature is valid

        Raises:
            ValueError: If the key is unusable or the signature does not verify
        """
        public_key = self._load_public_key(stored_public_key)
        signed_data = authenticator_data + client_data_hash

        try:
            if isinstance(public_key, ec.EllipticCurvePublicKey):
                public_key.verify(signature, signed_data, ec.ECDSA(hashes.SHA256()))
            elif isinstance(public_key, rsa.RSAPublicKey):
                public_key.verify(signature, signed_data, padding.PKCS1v15(), hashes.SHA256())
            else:
                raise ValueError(f"Unsupported public key type: {type(public_key).__name__}")
        except InvalidSignature:
            raise ValueError("Signature verification failed")

        return True

    def _parse_authenticator_data(self, auth_data: bytes) -> Tuple[int, int]:
        """
        Validate authenticator data and return (flags, sign_count).

        Checks that the data was produced for this relying party and that the
        user was present.

        Raises:
            ValueError: If the data is malformed or fails a check
        """
        if not isinstance(auth_data, bytes) or len(auth_data) < AUTH_DATA_MIN_LENGTH:
            raise ValueError("Invalid authenticator data")

        if auth_data[:32] != hashlib.sha256(self.rp_id.encode("utf-8")).digest():
            raise ValueError("Relying party mismatch")

        flags = auth_data[32]
        if not flags & AUTH_DATA_FLAG_USER_PRESENT:
            raise ValueError("User presence was not confirmed")

        return flags, int.from_bytes(auth_data[33:37], "big")

    def _parse_attested_credential(self, attestation_object: str) -> Tuple[bytes, bytes, str]:
        """
        Extract the new credential from an attestation object.

        Returns:
            Tuple of (credential_id, COSE public key bytes, aaguid hex)

        Raises:
            ValueError: If the attestation is malformed or carries no supported credential
        """
        try:
            attestation = cbor2.loads(_b64url_decode(attestation_object or ""))
            auth_data = attestation["authData"]
        except Exception:
            raise ValueError("Invalid attestation object")

        flags, _ = self._parse_authenticator_data(auth_data)
        if not flags & AUTH_DATA_FLAG_ATTESTED_CREDENTIAL:
            raise ValueError("Attestation has no credential data")

        aaguid_end = AUTH_DATA_MIN_LENGTH + AAGUID_LENGTH
        credential_id_start = aaguid_end + 2
        credential_id_end = credential_id_start + int.from_bytes(auth_data[aaguid_end:credential_id_start], "big")
        credential_id = auth_data[credential_id_start:credential_id_end]
        if len(auth_data) <= credential_id_end or not credential_id:
            raise ValueError("Invalid attested credential data")

        try:
            # Extensions may follow the key; only the first CBOR item is the key.
            cose_key = cbor2.loads(auth_data[credential_id_end:])
        except Exception:
            raise ValueError("Invalid credential public key")
        self._public_key_from_cose(cose_key)  # reject keys we could never verify

        return credential_id, cbor2.dumps(cose_key), auth_data[AUTH_DATA_MIN_LENGTH:aaguid_end].hex()

    # ==================
    # Registration Flow
    # ==================

    def create_registration_options(
        self,
        user_verification: str = "preferred",
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
            challenge_type="registration",
            ttl_seconds=self.CHALLENGE_TTL,
        )

        # Get existing credentials to exclude
        existing_credentials = UserPasskey.objects.filter(
            user=self.user,
            is_active=True,
        ).values_list("credential_id", flat=True)

        exclude_credentials = [
            {
                "id": cred_id,
                "type": "public-key",
            }
            for cred_id in existing_credentials
        ]

        # Build options
        options = {
            "challenge": challenge_record.challenge,
            "rp": {
                "name": self.rp_name,
                "id": self.rp_id,
            },
            "user": {
                "id": self._encode_user_id(self.user),
                "name": self.user.email,
                "displayName": self._get_user_display_name(),
            },
            "pubKeyCredParams": [
                {"type": "public-key", "alg": -7},  # ES256
                {"type": "public-key", "alg": -257},  # RS256
            ],
            "timeout": self.CHALLENGE_TTL * 1000,  # milliseconds
            "attestation": "none",  # We don't need attestation for most use cases
            "authenticatorSelection": {
                "userVerification": user_verification,
                "residentKey": "required" if require_resident_key else "preferred",
                "requireResidentKey": require_resident_key,
            },
            "excludeCredentials": exclude_credentials,
        }

        if authenticator_attachment:
            options["authenticatorSelection"]["authenticatorAttachment"] = authenticator_attachment

        return options, challenge_record.challenge

    def verify_registration(
        self,
        challenge: str,
        credential_id: str,
        public_key: str,
        attestation_object: str,
        client_data_json: str,
        name: str = "My Passkey",
        transports: List[str] = None,
        ip_address: str = None,
    ) -> UserPasskey:
        """
        Verify a registration response and create the passkey.

        Args:
            challenge: The original challenge
            credential_id: Base64url-encoded credential ID
            public_key: Ignored. The key is read from the attestation object; the
                argument is kept so existing clients keep working.
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
            challenge_type="registration",
        ).first()

        if not challenge_record:
            raise ValueError("Challenge not found")

        if not challenge_record.is_valid:
            raise ValueError("Challenge expired or already used")

        # Verify client data
        try:
            client_data_bytes = base64.urlsafe_b64decode(client_data_json + "=" * (-len(client_data_json) % 4))
            client_data = json.loads(client_data_bytes)
        except Exception as e:
            raise ValueError(f"Invalid client data: {e}")

        # Verify challenge in client data
        client_challenge = client_data.get("challenge", "")
        # Client challenge is base64url encoded
        if client_challenge != challenge:
            raise ValueError("Challenge mismatch")

        # SECURITY: Always verify origin (use explicit setting for dev override, NOT DEBUG)
        actual_origin = client_data.get("origin", "")
        self._verify_origin(actual_origin)

        # Verify type
        if client_data.get("type") != "webauthn.create":
            raise ValueError("Invalid client data type")

        # The credential ID and public key come from the authenticator's own data,
        # not from the separate fields the client sends alongside it.
        attested_credential_id, cose_public_key, aaguid = self._parse_attested_credential(attestation_object)

        try:
            claimed_credential_id = _b64url_decode(credential_id or "")
        except Exception:
            raise ValueError("Invalid credential ID")
        if claimed_credential_id != attested_credential_id:
            raise ValueError("Credential ID does not match attestation")

        # Mark challenge as used
        challenge_record.mark_used()

        # Create passkey
        passkey = UserPasskey.objects.create(
            user=self.user,
            credential_id=credential_id,
            name=name,
            public_key=_b64url_encode(cose_public_key),
            sign_count=0,
            aaguid=aaguid,
            transports=transports or [],
            authenticator_type="platform" if "internal" in (transports or []) else "cross-platform",
            registered_from_ip=ip_address,
        )

        # Log event
        SSOAuditLog.log_event(
            event_type=SSOAuditEventType.PASSKEY_REGISTERED,
            user=self.user,
            description=f'Passkey "{name}" registered',
            ip_address=ip_address,
            metadata={"credential_id_prefix": credential_id[:8]},
        )

        return passkey

    # ==================
    # Authentication Flow
    # ==================

    def create_authentication_options(
        self,
        user_verification: str = "preferred",
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
            challenge_type="authentication",
            ttl_seconds=self.CHALLENGE_TTL,
        )

        options = {
            "challenge": challenge_record.challenge,
            "timeout": self.CHALLENGE_TTL * 1000,
            "rpId": self.rp_id,
            "userVerification": user_verification,
        }

        # If user is known, provide allowed credentials
        if self.user:
            credentials = UserPasskey.objects.filter(
                user=self.user,
                is_active=True,
            ).values("credential_id", "transports")

            options["allowCredentials"] = [
                {
                    "id": cred["credential_id"],
                    "type": "public-key",
                    "transports": cred["transports"] or [],
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
            .select_related("user")
            .first()
        )

        if not passkey:
            raise ValueError("Passkey not found")

        user = passkey.user

        # Find and validate challenge
        challenge_record = WebAuthnChallenge.objects.filter(
            challenge=challenge,
            challenge_type="authentication",
        ).first()

        if not challenge_record:
            raise ValueError("Challenge not found")

        if not challenge_record.is_valid:
            raise ValueError("Challenge expired or already used")

        # A challenge requested for a known user can only be answered by that
        # user's passkeys. Usernameless requests have no user to bind to.
        if challenge_record.user_id is not None and challenge_record.user_id != user.id:
            raise ValueError("Challenge was not issued for this passkey")

        # Consume the challenge before checking the response, so every challenge
        # buys exactly one attempt. The conditional update makes this race-free.
        consumed = WebAuthnChallenge.objects.filter(pk=challenge_record.pk, used_at__isnull=True).update(
            used_at=timezone.now()
        )
        if not consumed:
            raise ValueError("Challenge expired or already used")

        # Decode client data
        try:
            client_data_bytes = base64.urlsafe_b64decode(client_data_json + "=" * (-len(client_data_json) % 4))
            client_data = json.loads(client_data_bytes)
        except Exception as e:
            raise ValueError(f"Invalid client data: {e}")

        # Verify challenge
        if client_data.get("challenge") != challenge:
            raise ValueError("Challenge mismatch")

        # SECURITY: Verify origin (always enforced)
        actual_origin = client_data.get("origin", "")
        self._verify_origin(actual_origin)

        # Verify type
        if client_data.get("type") != "webauthn.get":
            raise ValueError("Invalid client data type")

        # Decode authenticator data and signature
        try:
            auth_data_bytes = base64.urlsafe_b64decode(authenticator_data + "=" * (-len(authenticator_data) % 4))
            signature_bytes = base64.urlsafe_b64decode(signature + "=" * (-len(signature) % 4))
        except Exception as e:
            raise ValueError(f"Invalid authenticator data or signature: {e}")

        # The authenticator data must be for this relying party, with the user present
        _, new_sign_count = self._parse_authenticator_data(auth_data_bytes)

        # SECURITY: Verify the cryptographic signature
        # Signature is over: authenticator_data || SHA256(client_data_json)
        client_data_hash = hashlib.sha256(client_data_bytes).digest()

        try:
            self._verify_webauthn_signature(
                stored_public_key=passkey.public_key,
                authenticator_data=auth_data_bytes,
                client_data_hash=client_data_hash,
                signature=signature_bytes,
            )
        except ValueError as e:
            logger.warning(f"WebAuthn signature verification failed for passkey {passkey.id}: {e}")
            SSOAuditLog.log_event(
                event_type=SSOAuditEventType.PASSKEY_AUTH_FAILED,
                user=user,
                description="Passkey authentication failed: signature verification failed",
                ip_address=ip_address,
                success=False,
                metadata={"credential_id_prefix": credential_id[:8] if credential_id else "unknown"},
            )
            raise ValueError("Authentication failed: signature verification failed")

        # SECURITY: Verify sign count (protection against cloned authenticators)
        strict_sign_count = getattr(settings, "WEBAUTHN_STRICT_SIGN_COUNT", True)

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
                description="Sign count anomaly detected - possible cloned authenticator",
                ip_address=ip_address,
                success=False,
                metadata={
                    "expected_sign_count": passkey.sign_count,
                    "received_sign_count": new_sign_count,
                    "passkey_name": passkey.name,
                    "credential_id_prefix": credential_id[:8] if credential_id else "unknown",
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
            ).order_by("-created_at")
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
        passkey.save(update_fields=["name", "updated_at"])

        return passkey

    # ==================
    # Helpers
    # ==================

    def _encode_user_id(self, user: User) -> str:
        """Encode user ID for WebAuthn."""
        return base64.urlsafe_b64encode(str(user.id).encode("utf-8")).rstrip(b"=").decode("utf-8")

    def _get_user_display_name(self) -> str:
        """Get user display name for WebAuthn."""
        if hasattr(self.user, "profile") and self.user.profile:
            name = f"{self.user.profile.first_name} {self.user.profile.last_name}".strip()
            if name:
                return name
        return self.user.email
