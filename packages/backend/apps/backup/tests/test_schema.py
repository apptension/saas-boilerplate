"""
Integration tests for backup GraphQL schema with encryption/decryption.
"""

import base64
import pytest
from unittest.mock import Mock, patch, MagicMock, PropertyMock

from apps.backup.models import BackupConfig, BackupRecord
from apps.backup.schema import DownloadBackupDecryptedMutation
from apps.multitenancy.models import Tenant


pytestmark = pytest.mark.django_db


class TestDownloadBackupDecryptedMutation:
    """Tests for DownloadBackupDecryptedMutation with decryption."""

    @pytest.fixture
    def mock_secrets_service(self):
        """Mock SecretsService for testing."""
        with patch('apps.backup.encryption.get_secrets_service') as mock_get_service:
            mock_service = Mock()
            mock_get_service.return_value = mock_service
            yield mock_service

    @pytest.fixture
    def mock_storage(self):
        """Mock storage backend."""
        with patch('common.storages.get_exports_storage') as mock_get_storage:
            mock_storage = Mock()
            mock_get_storage.return_value = mock_storage
            yield mock_storage

    @pytest.fixture
    def encrypted_backup_content(self, mock_secrets_service):
        """Create encrypted backup content for testing."""
        from apps.backup.encryption import BackupEncryptionService
        import apps.backup.encryption

        # Clear singleton
        apps.backup.encryption._encryption_service = None

        # Create encryption service
        encryption_service = BackupEncryptionService()
        # Ensure it uses the mocked secrets service
        encryption_service.secrets_service = mock_secrets_service

        # Mock key - use TEST_KEY_32_BYTES from test_encryption
        from apps.backup.tests.test_encryption import TEST_KEY_32_BYTES

        mock_secrets_service.get_secret_by_name.return_value = base64.b64encode(TEST_KEY_32_BYTES).decode('utf-8')

        # Encrypt test content
        plaintext = b'<?xml version="1.0"?><backup><data>test content</data></backup>'
        encrypted = encryption_service.encrypt_backup(plaintext, "test_tenant")

        # Ensure encryption succeeded
        assert encrypted is not None, "Encryption failed - check mock setup"

        return encrypted, plaintext

    def test_download_backup_decrypted_success(
        self, tenant, user, mock_secrets_service, mock_storage, encrypted_backup_content
    ):
        """Test successful download and decryption of backup."""
        from graphene.test import Client
        from config.schema import schema
        from graphql import GraphQLError

        # Create backup record
        backup_record = BackupRecord.objects.create(
            tenant=tenant,
            status=BackupRecord.Status.COMPLETED,
            file_path="exports/tenant_backups/test/backup.xml",
            file_size=1000,
            is_encrypted=True,
        )

        encrypted_content, expected_plaintext = encrypted_backup_content

        # Ensure encrypted_content is not None
        assert (
            encrypted_content is not None
        ), "encrypted_backup_content fixture returned None - check encryption service mock"

        # Mock storage
        mock_file = MagicMock()
        mock_file.read.return_value = encrypted_content
        mock_storage.exists.return_value = True
        # Set up context manager properly
        mock_context = MagicMock()
        mock_context.__enter__.return_value = mock_file
        mock_context.__exit__.return_value = False
        mock_storage.open.return_value = mock_context

        # Mock key retrieval - use TEST_KEY_32_BYTES from test_encryption
        from apps.backup.tests.test_encryption import TEST_KEY_32_BYTES

        mock_secrets_service.get_secret_by_name.return_value = base64.b64encode(TEST_KEY_32_BYTES).decode('utf-8')

        # Create GraphQL context
        # Ensure user is authenticated (mock the property)
        with patch.object(type(user), 'is_authenticated', new_callable=PropertyMock, return_value=True):

            class MockContext:
                def __init__(self, user):
                    self.user = user

            info = MagicMock()
            info.context = MockContext(user)

            # Execute mutation (need to use global ID)
            from graphql_relay import to_global_id

            backup_global_id = to_global_id('BackupRecordType', str(backup_record.id))
            result = DownloadBackupDecryptedMutation.mutate(None, info, backup_id=backup_global_id)

            # Verify result
            assert result.ok is True
            assert result.content is not None
            assert result.content == expected_plaintext.decode('utf-8')
            assert '<?xml' in result.content
            assert 'test content' in result.content

    def test_download_backup_decrypted_unencrypted(self, tenant, user, mock_storage):
        """Test downloading unencrypted backup."""
        # Create unencrypted backup record
        backup_record = BackupRecord.objects.create(
            tenant=tenant,
            status=BackupRecord.Status.COMPLETED,
            file_path="exports/tenant_backups/test/backup.xml",
            file_size=1000,
            is_encrypted=False,
        )

        plaintext_content = b'<?xml version="1.0"?><backup><data>unencrypted</data></backup>'

        # Mock storage
        mock_file = MagicMock()
        mock_file.read.return_value = plaintext_content
        mock_storage.exists.return_value = True
        # Set up context manager properly
        mock_context = MagicMock()
        mock_context.__enter__.return_value = mock_file
        mock_context.__exit__.return_value = False
        mock_storage.open.return_value = mock_context

        # Create GraphQL context
        # Ensure user is authenticated (mock the property)
        with patch.object(type(user), 'is_authenticated', new_callable=PropertyMock, return_value=True):

            class MockContext:
                def __init__(self, user):
                    self.user = user

            info = MagicMock()
            info.context = MockContext(user)

            # Execute mutation (need to use global ID)
            from graphql_relay import to_global_id

            backup_global_id = to_global_id('BackupRecordType', str(backup_record.id))
            result = DownloadBackupDecryptedMutation.mutate(None, info, backup_id=backup_global_id)

            # Verify result (should return as-is for unencrypted)
            assert result.ok is True
            assert result.content == plaintext_content.decode('utf-8')

    def test_download_backup_decrypted_file_not_found(self, tenant, user, mock_storage):
        """Test downloading backup when file doesn't exist."""
        # Create backup record
        backup_record = BackupRecord.objects.create(
            tenant=tenant,
            status=BackupRecord.Status.COMPLETED,
            file_path="exports/tenant_backups/test/backup.xml",
            file_size=1000,
            is_encrypted=True,
        )

        # Mock storage - file doesn't exist
        mock_storage.exists.return_value = False

        # Create GraphQL context
        # Ensure user is authenticated (mock the property)
        with patch.object(type(user), 'is_authenticated', new_callable=PropertyMock, return_value=True):

            class MockContext:
                def __init__(self, user):
                    self.user = user

            info = MagicMock()
            info.context = MockContext(user)

        # Execute mutation (need to use global ID)
        from graphql_relay import to_global_id

        backup_global_id = to_global_id('BackupRecordType', str(backup_record.id))
        result = DownloadBackupDecryptedMutation.mutate(None, info, backup_id=backup_global_id)

        # Verify error
        assert result.ok is False
        assert "not found" in result.error.lower()

    def test_download_backup_decrypted_decryption_failure(self, tenant, user, mock_secrets_service, mock_storage):
        """Test downloading backup when decryption fails."""
        # Create backup record
        backup_record = BackupRecord.objects.create(
            tenant=tenant,
            status=BackupRecord.Status.COMPLETED,
            file_path="exports/tenant_backups/test/backup.xml",
            file_size=1000,
            is_encrypted=True,
        )

        # Mock invalid encrypted content
        invalid_encrypted = b"invalid_encrypted_content" * 10

        # Mock storage
        mock_file = MagicMock()
        mock_file.read.return_value = invalid_encrypted
        mock_storage.exists.return_value = True
        # Set up context manager properly
        mock_context = MagicMock()
        mock_context.__enter__.return_value = mock_file
        mock_context.__exit__.return_value = False
        mock_storage.open.return_value = mock_context

        # Mock key retrieval failure
        mock_secrets_service.get_secret_by_name.return_value = None
        mock_secrets_service.store_secret.return_value = None

        # Create GraphQL context
        # Ensure user is authenticated (mock the property)
        with patch.object(type(user), 'is_authenticated', new_callable=PropertyMock, return_value=True):

            class MockContext:
                def __init__(self, user):
                    self.user = user

            info = MagicMock()
            info.context = MockContext(user)

        # Execute mutation (need to use global ID)
        from graphql_relay import to_global_id

        backup_global_id = to_global_id('BackupRecordType', str(backup_record.id))
        result = DownloadBackupDecryptedMutation.mutate(None, info, backup_id=backup_global_id)

        # Verify error
        assert result.ok is False
        assert "decrypt" in result.error.lower() or "key" in result.error.lower()

    def test_download_backup_decrypted_unauthorized(self, tenant, mock_storage):
        """Test downloading backup without authentication."""
        # Create backup record
        backup_record = BackupRecord.objects.create(
            tenant=tenant,
            status=BackupRecord.Status.COMPLETED,
            file_path="exports/tenant_backups/test/backup.xml",
            file_size=1000,
            is_encrypted=True,
        )

        # Create GraphQL context without user
        class MockContext:
            user = None

        info = MagicMock()
        info.context = MockContext()

        # Execute mutation - it catches GraphQLError and returns error result
        from apps.backup.schema import DownloadBackupDecryptedMutation
        from graphql_relay import to_global_id

        backup_id = to_global_id('BackupRecordType', str(backup_record.id))
        # The mutation catches GraphQLError and returns it as an error result
        result = DownloadBackupDecryptedMutation.mutate(None, info, backup_id=backup_id)

        # Verify error result
        assert result.ok is False
        assert "Authentication" in result.error or "required" in result.error.lower()

    def test_download_backup_decrypted_backup_not_found(self, user, mock_storage):
        """Test downloading non-existent backup."""

        # Create GraphQL context
        # Ensure user is authenticated (mock the property)
        with patch.object(type(user), 'is_authenticated', new_callable=PropertyMock, return_value=True):

            class MockContext:
                def __init__(self, user):
                    self.user = user

            info = MagicMock()
            info.context = MockContext(user)

        # Execute mutation with invalid ID (use global ID format)
        from graphql_relay import to_global_id

        invalid_global_id = to_global_id('BackupRecordType', '999999')
        result = DownloadBackupDecryptedMutation.mutate(None, info, backup_id=invalid_global_id)

        # Verify error
        assert result.ok is False
        assert "not found" in result.error.lower()
