"""
Backup encryption service for encrypting/decrypting backup files at rest.

Uses AES-256-GCM for authenticated encryption with per-tenant encryption keys.
Keys are stored in AWS Secrets Manager when configured; otherwise a DB fallback
is used with BACKUP_MASTER_KEY (Fernet-encrypted keys in BackupTenantEncryptionKey).
"""

import base64
import logging
import secrets
from typing import Optional

from cryptography.fernet import Fernet, InvalidToken
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from django.conf import settings

from common.secrets.service import get_secrets_service

logger = logging.getLogger(__name__)

# AES-256-GCM requires a 32-byte (256-bit) key
KEY_SIZE = 32
# GCM nonce is 12 bytes (96 bits) - recommended size
NONCE_SIZE = 12


class BackupEncryptionService:
    """
    Service for encrypting and decrypting backup files.

    Uses AES-256-GCM for authenticated encryption. Per-tenant keys are obtained from:
    1. AWS Secrets Manager (if configured), or
    2. Database fallback: keys stored encrypted with BACKUP_MASTER_KEY (Fernet).
    """

    def __init__(self):
        self.secrets_service = get_secrets_service('backup')
        self._fernet: Optional[Fernet] = None

    def _get_fernet(self) -> Optional[Fernet]:
        """Return Fernet instance from BACKUP_MASTER_KEY if set."""
        if self._fernet is not None:
            return self._fernet
        master_key = getattr(settings, 'BACKUP_MASTER_KEY', None)
        if not master_key or not isinstance(master_key, str):
            return None
        try:
            key_bytes = master_key.encode('utf-8') if isinstance(master_key, str) else master_key
            self._fernet = Fernet(key_bytes)
            return self._fernet
        except Exception as e:
            logger.warning(f"Invalid BACKUP_MASTER_KEY: {e}")
            return None

    def _generate_key(self) -> bytes:
        """
        Generate a new 256-bit encryption key.

        Returns:
            32-byte random key suitable for AES-256
        """
        return secrets.token_bytes(KEY_SIZE)

    def _get_or_create_tenant_key_via_db(self, tenant_id: str) -> Optional[bytes]:
        """
        Get or create tenant encryption key using DB storage (BACKUP_MASTER_KEY).

        Returns:
            Encryption key as bytes, or None if master key is unset or DB fails
        """
        from apps.multitenancy.models import Tenant

        fernet = self._get_fernet()
        if not fernet:
            return None
        try:
            tenant = Tenant.objects.get(pk=tenant_id)
        except Tenant.DoesNotExist:
            logger.error(f"Tenant {tenant_id} not found for backup key lookup")
            return None
        from .models import BackupTenantEncryptionKey

        try:
            record = BackupTenantEncryptionKey.objects.get(tenant=tenant)
            decrypted = fernet.decrypt(record.encrypted_key.encode('utf-8'))
            if len(decrypted) != KEY_SIZE:
                logger.warning(f"Stored key for tenant {tenant_id} has wrong size")
                return None
            return decrypted
        except BackupTenantEncryptionKey.DoesNotExist:
            pass
        except InvalidToken as e:
            logger.warning(f"Failed to decrypt backup key for tenant {tenant_id}: {e}")
            return None
        # Create new key
        new_key = self._generate_key()
        try:
            encrypted_b64 = fernet.encrypt(new_key).decode('utf-8')
            BackupTenantEncryptionKey.objects.create(tenant=tenant, encrypted_key=encrypted_b64)
            logger.info(f"Created DB-stored encryption key for tenant {tenant_id}")
            return new_key
        except Exception as e:
            logger.error(f"Failed to store backup key for tenant {tenant_id}: {e}", exc_info=True)
            return None

    def get_or_create_tenant_key(self, tenant_id: str) -> Optional[bytes]:
        """
        Retrieve or generate a tenant encryption key.

        When BACKUP_MASTER_KEY is set, the DB store is preferred (keys in BackupTenantEncryptionKey).
        Otherwise tries AWS Secrets Manager first, then falls back to DB if AWS is unavailable.
        """
        # Prefer DB when BACKUP_MASTER_KEY is set (no AWS usage for backup keys)
        if self._get_fernet() is not None:
            key = self._get_or_create_tenant_key_via_db(tenant_id)
            if key is not None:
                return key
            # Fernet exists but DB failed (e.g. tenant not found); don't fall through to AWS
            return None

        # No BACKUP_MASTER_KEY: try AWS first, then DB fallback
        secret_type = 'encryption_key'
        if self.secrets_service.client:
            existing_key = self.secrets_service.get_secret_by_name(tenant_id, secret_type)
            if existing_key:
                try:
                    return base64.b64decode(existing_key)
                except Exception as e:
                    logger.error(
                        f"Corrupt encryption key for tenant"
                    )
                    return None
            else:
                new_key = self._generate_key()
                key_base64 = base64.b64encode(new_key).decode('utf-8')
                arn = self.secrets_service.store_secret(
                    tenant_id=tenant_id,
                    secret_type=secret_type,
                    secret_value=key_base64,
                    description=f"Backup encryption key for tenant {tenant_id}",
                )
                if arn:
                    logger.info(f"Stored encryption key for tenant {tenant_id} at {arn}")
                    return new_key

        return self._get_or_create_tenant_key_via_db(tenant_id)

    def encrypt_backup(self, content: bytes, tenant_id: str) -> Optional[bytes]:
        """
        Encrypt backup content using AES-256-GCM.

        The encrypted output format is: [nonce (12 bytes)][ciphertext][tag (16 bytes)]
        GCM mode automatically includes authentication tag.

        Args:
            content: Plaintext backup content to encrypt
            tenant_id: The tenant identifier

        Returns:
            Encrypted content as bytes, or None if encryption fails
        """
        # Get or create encryption key
        key = self.get_or_create_tenant_key(tenant_id)
        if not key:
            logger.error(f"Cannot encrypt backup for tenant {tenant_id}: no encryption key available")
            return None

        try:
            # Generate random nonce
            nonce = secrets.token_bytes(NONCE_SIZE)

            # Create cipher
            aesgcm = AESGCM(key)

            # Encrypt (GCM mode includes authentication tag automatically)
            ciphertext = aesgcm.encrypt(nonce, content, None)

            # Prepend nonce to ciphertext
            # Format: [nonce (12 bytes)][ciphertext + tag (variable)]
            encrypted = nonce + ciphertext

            logger.debug(f"Encrypted backup for tenant {tenant_id}: {len(content)} bytes -> {len(encrypted)} bytes")
            return encrypted

        except Exception as e:
            logger.error(f"Failed to encrypt backup for tenant {tenant_id}: {e}", exc_info=True)
            return None

    def decrypt_backup(self, encrypted_content: bytes, tenant_id: str) -> Optional[bytes]:
        """
        Decrypt backup content using AES-256-GCM.

        Args:
            encrypted_content: Encrypted content (format: [nonce][ciphertext+tag])
            tenant_id: The tenant identifier

        Returns:
            Decrypted content as bytes, or None if decryption fails
        """
        # Get encryption key
        key = self.get_or_create_tenant_key(tenant_id)
        if not key:
            logger.error(f"Cannot decrypt backup for tenant {tenant_id}: no encryption key available")
            return None

        # Check minimum size (nonce + at least some ciphertext)
        if len(encrypted_content) < NONCE_SIZE + 16:  # 16 bytes is minimum GCM tag size
            logger.error(f"Encrypted content too short for tenant {tenant_id}")
            return None

        try:
            # Extract nonce and ciphertext
            nonce = encrypted_content[:NONCE_SIZE]
            ciphertext = encrypted_content[NONCE_SIZE:]

            # Create cipher
            aesgcm = AESGCM(key)

            # Decrypt (GCM mode verifies authentication tag automatically)
            plaintext = aesgcm.decrypt(nonce, ciphertext, None)

            logger.debug(
                f"Decrypted backup for tenant {tenant_id}: {len(encrypted_content)} bytes -> {len(plaintext)} bytes"
            )
            return plaintext

        except Exception as e:
            logger.error(f"Failed to decrypt backup for tenant {tenant_id}: {e}", exc_info=True)
            return None


# Singleton instance
_encryption_service: Optional[BackupEncryptionService] = None


def get_backup_encryption_service() -> BackupEncryptionService:
    """Get the singleton BackupEncryptionService instance."""
    global _encryption_service
    if _encryption_service is None:
        _encryption_service = BackupEncryptionService()
    return _encryption_service
