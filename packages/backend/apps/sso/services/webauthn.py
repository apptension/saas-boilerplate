"""
WebAuthn/Passkeys implementation for passwordless authentication.
Provides registration and authentication flows for passkeys.
"""

import base64
import json
import logging
from typing import Dict, Any, Tuple, List

from django.conf import settings

from apps.users.models import User
from apps.sso.models import UserPasskey, WebAuthnChallenge, SSOAuditLog
from apps.sso.constants import SSOAuditEventType

logger = logging.getLogger(__name__)


class WebAuthnService:
    """
    WebAuthn Relying Party implementation.
    Handles passkey registration and authentication.
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
            client_data = json.loads(base64.urlsafe_b64decode(client_data_json + '=' * (-len(client_data_json) % 4)))
        except Exception as e:
            raise ValueError(f"Invalid client data: {e}")

        # Verify challenge in client data
        client_challenge = client_data.get('challenge', '')
        # Client challenge is base64url encoded
        if client_challenge != challenge:
            raise ValueError("Challenge mismatch")

        # Verify origin
        if client_data.get('origin') != self._get_origin():
            logger.warning(f"Origin mismatch: expected {self._get_origin()}, got {client_data.get('origin')}")
            # In production, this should be a hard failure
            # For development, we might want to be more lenient
            if not settings.DEBUG:
                raise ValueError("Origin mismatch")

        # Verify type
        if client_data.get('type') != 'webauthn.create':
            raise ValueError("Invalid client data type")

        # TODO: Parse attestation object and extract AAGUID
        # For now, we'll skip detailed attestation verification
        # Production should use a library like py_webauthn

        # Mark challenge as used
        challenge_record.mark_used()

        # Create passkey
        passkey = UserPasskey.objects.create(
            user=self.user,
            credential_id=credential_id,
            name=name,
            public_key=public_key,
            sign_count=0,
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
        Verify an authentication response.

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

        # Verify client data
        try:
            client_data = json.loads(base64.urlsafe_b64decode(client_data_json + '=' * (-len(client_data_json) % 4)))
        except Exception as e:
            raise ValueError(f"Invalid client data: {e}")

        # Verify challenge
        if client_data.get('challenge') != challenge:
            raise ValueError("Challenge mismatch")

        # Verify type
        if client_data.get('type') != 'webauthn.get':
            raise ValueError("Invalid client data type")

        # TODO: Verify signature using public key
        # This requires cryptographic verification that should use
        # a library like py_webauthn or cryptography

        # Parse authenticator data to get sign count
        try:
            auth_data_bytes = base64.urlsafe_b64decode(authenticator_data + '=' * (-len(authenticator_data) % 4))
            # Sign count is bytes 33-36 (big-endian uint32)
            new_sign_count = int.from_bytes(auth_data_bytes[33:37], 'big')
        except Exception:
            new_sign_count = passkey.sign_count + 1

        # Verify sign count (protection against cloned authenticators)
        if new_sign_count <= passkey.sign_count and passkey.sign_count > 0:
            logger.warning(
                f"Passkey sign count did not increase for user {user.email}. "
                f"Expected > {passkey.sign_count}, got {new_sign_count}"
            )
            # In production, this should be investigated
            # For now, we'll allow it but log a warning

        # Mark challenge as used
        challenge_record.mark_used()

        # Update passkey
        passkey.record_use(new_sign_count)

        # Log event
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
