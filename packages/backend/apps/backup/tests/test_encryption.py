"""
Unit tests for backup encryption service.
"""

import base64
import pytest
from unittest.mock import Mock, patch, MagicMock

from apps.backup.encryption import BackupEncryptionService, KEY_SIZE, NONCE_SIZE
from common.secrets.service import SecretsService


pytestmark = pytest.mark.django_db


# Test keys - must be exactly 32 bytes (256 bits) for AES-256-GCM
TEST_KEY_32_BYTES = b"test_key_32_bytes_long_exactly!!"  # Exactly 32 bytes
TENANT1_KEY_32_BYTES = b"tenant1_key_32_bytes_long_exact!"  # Exactly 32 bytes
TENANT2_KEY_32_BYTES = b"tenant2_key_32_bytes_long_exact!"  # Exactly 32 bytes


class TestBackupEncryptionService:
    """Tests for BackupEncryptionService."""

    @pytest.fixture
    def mock_secrets_service(self):
        """Mock SecretsService for testing."""
        # Clear the secrets service cache to ensure fresh mocks
        from common.secrets.service import _secrets_services

        _secrets_services.clear()

        with patch('apps.backup.encryption.get_secrets_service') as mock_get_service:
            # Create a mock service - don't pre-create methods, let Mock handle them dynamically
            mock_service = Mock()
            mock_get_service.return_value = mock_service
            # Clear the encryption service singleton to ensure fresh instance
            import apps.backup.encryption

            apps.backup.encryption._encryption_service = None
            yield mock_service
            # Clean up: clear cache after test
            _secrets_services.clear()

    @pytest.fixture
    def encryption_service(self, mock_secrets_service):
        """Create BackupEncryptionService instance."""
        # Clear singleton first
        import apps.backup.encryption

        apps.backup.encryption._encryption_service = None

        # Create service - it will use the mocked get_secrets_service from the fixture
        service = BackupEncryptionService()

        # CRITICAL: The service's __init__ calls get_secrets_service('backup')
        # which should return our mock. But let's explicitly set it to be sure
        service.secrets_service = mock_secrets_service

        # Force AWS path: if BACKUP_MASTER_KEY is set in env, the service would use DB
        # first and never hit Secrets Manager. These tests mock AWS, so ensure we use it.
        service._get_fernet = lambda: None

        # Mock client so "if self.secrets_service.client" is truthy and we use AWS branch
        if not getattr(mock_secrets_service, 'client', None):
            mock_secrets_service.client = MagicMock()

        return service

    def test_generate_key(self, encryption_service):
        """Test key generation produces correct size."""
        key = encryption_service._generate_key()

        assert isinstance(key, bytes)
        assert len(key) == KEY_SIZE
        assert len(key) == 32  # 256 bits

    def test_get_or_create_tenant_key_retrieves_existing(self, encryption_service, mock_secrets_service):
        """Test retrieving existing key from Secrets Manager."""
        tenant_id = "test_tenant_123"
        existing_key_bytes = TEST_KEY_32_BYTES
        existing_key_base64 = base64.b64encode(existing_key_bytes).decode('utf-8')

        mock_secrets_service.get_secret_by_name.return_value = existing_key_base64

        key = encryption_service.get_or_create_tenant_key(tenant_id)

        assert key == existing_key_bytes
        mock_secrets_service.get_secret_by_name.assert_called_once_with(tenant_id, 'encryption_key')
        mock_secrets_service.store_secret.assert_not_called()

    def test_get_or_create_tenant_key_creates_new(self, encryption_service, mock_secrets_service):
        """Test creating new key when none exists."""
        tenant_id = "test_tenant_123"

        mock_secrets_service.get_secret_by_name.return_value = None
        mock_secrets_service.store_secret.return_value = "arn:aws:secretsmanager:region:account:secret:name"

        key = encryption_service.get_or_create_tenant_key(tenant_id)

        assert isinstance(key, bytes)
        assert len(key) == KEY_SIZE
        mock_secrets_service.get_secret_by_name.assert_called_once_with(tenant_id, 'encryption_key')
        mock_secrets_service.store_secret.assert_called_once()

        # Verify the stored key is base64 encoded
        call_args = mock_secrets_service.store_secret.call_args
        stored_value = call_args[1]['secret_value']
        decoded = base64.b64decode(stored_value)
        assert decoded == key

    def test_get_or_create_tenant_key_handles_invalid_existing_key(self, encryption_service, mock_secrets_service):
        """Test that a corrupt key in Secrets Manager returns None (refuses to replace)."""
        tenant_id = "test_tenant_123"

        # Force AWS path (avoid DB path when BACKUP_MASTER_KEY is set in env)
        encryption_service._get_fernet = lambda: None
        mock_secrets_service.client = MagicMock()
        mock_secrets_service.get_secret_by_name.return_value = "invalid_base64!!!"

        key = encryption_service.get_or_create_tenant_key(tenant_id)

        # Must return None — never silently replace a corrupt key (old backups would be lost)
        assert key is None
        mock_secrets_service.store_secret.assert_not_called()

    def test_get_or_create_tenant_key_returns_none_on_storage_failure(self, encryption_service, mock_secrets_service):
        """Test returning None when Secrets Manager storage fails."""
        tenant_id = "test_tenant_123"

        mock_secrets_service.get_secret_by_name.return_value = None
        mock_secrets_service.store_secret.return_value = None

        key = encryption_service.get_or_create_tenant_key(tenant_id)

        assert key is None

    def test_encrypt_backup_success(self, encryption_service, mock_secrets_service):
        """Test successful backup encryption."""
        tenant_id = "test_tenant_123"
        plaintext = b"Test backup content"

        # Mock key retrieval - return existing key
        test_key = TEST_KEY_32_BYTES
        key_base64 = base64.b64encode(test_key).decode('utf-8')
        mock_secrets_service.get_secret_by_name.return_value = key_base64

        # Verify the service is using the mock
        assert encryption_service.secrets_service is mock_secrets_service

        # Debug: Check what get_or_create_tenant_key returns
        key = encryption_service.get_or_create_tenant_key(tenant_id)
        assert (
            key is not None
        ), f"get_or_create_tenant_key returned None. Mock return_value: {mock_secrets_service.get_secret_by_name.return_value}, Mock called: {mock_secrets_service.get_secret_by_name.called}"
        assert key == test_key, f"Key mismatch: expected {test_key}, got {key}"

        encrypted = encryption_service.encrypt_backup(plaintext, tenant_id)

        assert encrypted is not None
        assert isinstance(encrypted, bytes)
        assert len(encrypted) > len(plaintext)  # Encrypted should be larger (nonce + ciphertext + tag)
        assert encrypted != plaintext  # Should be different from plaintext

        # Verify format: [nonce (12 bytes)][ciphertext + tag]
        assert len(encrypted) >= NONCE_SIZE + len(plaintext)

    def test_encrypt_backup_creates_new_key(self, encryption_service, mock_secrets_service):
        """Test encryption creates new key if none exists."""
        tenant_id = "test_tenant_123"
        plaintext = b"Test backup content"

        mock_secrets_service.get_secret_by_name.return_value = None
        mock_secrets_service.store_secret.return_value = "arn:aws:secretsmanager:region:account:secret:name"

        encrypted = encryption_service.encrypt_backup(plaintext, tenant_id)

        assert encrypted is not None
        mock_secrets_service.store_secret.assert_called_once()

    def test_encrypt_backup_returns_none_on_key_failure(self, encryption_service, mock_secrets_service):
        """Test encryption returns None when key cannot be obtained."""
        tenant_id = "test_tenant_123"
        plaintext = b"Test backup content"

        mock_secrets_service.get_secret_by_name.return_value = None
        mock_secrets_service.store_secret.return_value = None

        encrypted = encryption_service.encrypt_backup(plaintext, tenant_id)

        assert encrypted is None

    def test_decrypt_backup_success(self, encryption_service, mock_secrets_service):
        """Test successful backup decryption."""
        tenant_id = "test_tenant_123"
        plaintext = b"Test backup content"

        # Mock key retrieval - return existing key
        test_key = TEST_KEY_32_BYTES
        mock_secrets_service.get_secret_by_name.return_value = base64.b64encode(test_key).decode('utf-8')

        # Verify the service is using the mock
        assert encryption_service.secrets_service is mock_secrets_service

        # First encrypt
        encrypted = encryption_service.encrypt_backup(plaintext, tenant_id)
        assert (
            encrypted is not None
        ), f"Encryption failed - key retrieval might have failed. Mock called: {mock_secrets_service.get_secret_by_name.called}"

        # Then decrypt
        decrypted = encryption_service.decrypt_backup(encrypted, tenant_id)

        assert decrypted is not None
        assert decrypted == plaintext

    def test_decrypt_backup_roundtrip(self, encryption_service, mock_secrets_service):
        """Test encrypt-decrypt roundtrip with various content sizes."""
        tenant_id = "test_tenant_123"
        test_cases = [
            b"Short",
            b"Medium length content here",
            b"X" * 1000,  # 1KB
            b"Y" * 10000,  # 10KB
        ]

        test_key = TEST_KEY_32_BYTES
        mock_secrets_service.get_secret_by_name.return_value = base64.b64encode(test_key).decode('utf-8')

        for plaintext in test_cases:
            encrypted = encryption_service.encrypt_backup(plaintext, tenant_id)
            assert encrypted is not None

            decrypted = encryption_service.decrypt_backup(encrypted, tenant_id)
            assert decrypted == plaintext

    def test_decrypt_backup_returns_none_on_key_failure(self, encryption_service, mock_secrets_service):
        """Test decryption returns None when key cannot be obtained."""
        tenant_id = "test_tenant_123"
        encrypted_content = b"fake_encrypted_content" * 10

        mock_secrets_service.get_secret_by_name.return_value = None
        mock_secrets_service.store_secret.return_value = None

        decrypted = encryption_service.decrypt_backup(encrypted_content, tenant_id)

        assert decrypted is None

    def test_decrypt_backup_returns_none_on_short_content(self, encryption_service, mock_secrets_service):
        """Test decryption returns None for content too short."""
        tenant_id = "test_tenant_123"
        short_content = b"too_short"  # Less than NONCE_SIZE + 16

        test_key = TEST_KEY_32_BYTES
        mock_secrets_service.get_secret_by_name.return_value = base64.b64encode(test_key).decode('utf-8')

        decrypted = encryption_service.decrypt_backup(short_content, tenant_id)

        assert decrypted is None

    def test_decrypt_backup_returns_none_on_invalid_content(self, encryption_service, mock_secrets_service):
        """Test decryption returns None for invalid encrypted content."""
        tenant_id = "test_tenant_123"
        # Create content with correct length but invalid format
        invalid_content = b"X" * (NONCE_SIZE + 20)  # Has minimum size but invalid format

        test_key = TEST_KEY_32_BYTES
        mock_secrets_service.get_secret_by_name.return_value = base64.b64encode(test_key).decode('utf-8')

        decrypted = encryption_service.decrypt_backup(invalid_content, tenant_id)

        # Should fail to decrypt invalid content
        assert decrypted is None

    def test_encrypt_backup_different_tenants_different_keys(self, encryption_service, mock_secrets_service):
        """Test that different tenants use different encryption keys."""
        tenant1_id = "tenant_1"
        tenant2_id = "tenant_2"
        plaintext = b"Same content for both tenants"

        # Mock different keys for different tenants
        key1 = TENANT1_KEY_32_BYTES
        key2 = TENANT2_KEY_32_BYTES

        def get_secret_side_effect(tenant_id, secret_type):
            if tenant_id == tenant1_id:
                return base64.b64encode(key1).decode('utf-8')
            elif tenant_id == tenant2_id:
                return base64.b64encode(key2).decode('utf-8')
            return None

        mock_secrets_service.get_secret_by_name.side_effect = get_secret_side_effect

        # Verify the service is using the mock
        assert encryption_service.secrets_service is mock_secrets_service

        encrypted1 = encryption_service.encrypt_backup(plaintext, tenant1_id)
        assert encrypted1 is not None, f"Encryption failed for tenant1"
        encrypted2 = encryption_service.encrypt_backup(plaintext, tenant2_id)
        assert encrypted2 is not None, f"Encryption failed for tenant2"

        # Encrypted content should be different (different keys, different nonces)
        assert encrypted1 != encrypted2

        # But both should decrypt to same plaintext
        decrypted1 = encryption_service.decrypt_backup(encrypted1, tenant1_id)
        decrypted2 = encryption_service.decrypt_backup(encrypted2, tenant2_id)

        assert decrypted1 == plaintext
        assert decrypted2 == plaintext

        # Cross-decryption should fail (wrong key)
        cross_decrypt1 = encryption_service.decrypt_backup(encrypted1, tenant2_id)
        cross_decrypt2 = encryption_service.decrypt_backup(encrypted2, tenant1_id)

        # Should either fail or produce garbage (not the original plaintext)
        assert cross_decrypt1 != plaintext
        assert cross_decrypt2 != plaintext

    def test_encrypt_backup_different_nonces(self, encryption_service, mock_secrets_service):
        """Test that encrypting same content twice produces different ciphertext."""
        tenant_id = "test_tenant_123"
        plaintext = b"Same content encrypted twice"

        # Mock key retrieval - return existing key
        test_key = TEST_KEY_32_BYTES
        mock_secrets_service.get_secret_by_name.return_value = base64.b64encode(test_key).decode('utf-8')

        # Verify the service is using the mock
        assert encryption_service.secrets_service is mock_secrets_service

        encrypted1 = encryption_service.encrypt_backup(plaintext, tenant_id)
        assert encrypted1 is not None, f"First encryption failed"
        encrypted2 = encryption_service.encrypt_backup(plaintext, tenant_id)
        assert encrypted2 is not None, f"Second encryption failed"

        # Should produce different ciphertext due to different nonces
        assert encrypted1 != encrypted2

        # But both should decrypt to same plaintext
        decrypted1 = encryption_service.decrypt_backup(encrypted1, tenant_id)
        decrypted2 = encryption_service.decrypt_backup(encrypted2, tenant_id)

        assert decrypted1 == plaintext
        assert decrypted2 == plaintext

    def test_get_backup_encryption_service_singleton(self, mock_secrets_service):
        """Test that get_backup_encryption_service returns singleton."""
        from apps.backup.encryption import get_backup_encryption_service

        # Reset singleton
        import apps.backup.encryption as encryption_module

        encryption_module._encryption_service = None

        service1 = get_backup_encryption_service()
        service1.secrets_service = mock_secrets_service
        service2 = get_backup_encryption_service()

        assert service1 is service2
        # Verify it's the same instance (singleton)
        import apps.backup.encryption as encryption_module

        assert service1 is encryption_module._encryption_service
