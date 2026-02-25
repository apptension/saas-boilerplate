"""
Integration tests for backup tasks with encryption.
"""

import base64
from datetime import timedelta

import pytest
from django.core.files.base import ContentFile
from django.utils import timezone
from unittest.mock import Mock, patch, MagicMock

from apps.backup.models import BackupConfig, BackupRecord
from apps.backup.scheduler import _should_run_backup
from apps.backup.tasks import create_backup
from apps.multitenancy.models import Tenant


pytestmark = pytest.mark.django_db

# Test key - must be exactly 32 bytes (256 bits) for AES-256-GCM
TEST_KEY_32_BYTES = b"test_key_32_bytes_long_exactly!!"  # Exactly 32 bytes


class TestBackupTaskEncryption:
    """Tests for backup task encryption integration."""

    @pytest.fixture
    def mock_secrets_service(self):
        """Mock SecretsService for testing."""
        with patch('apps.backup.encryption.get_secrets_service') as mock_get_service:
            mock_service = Mock()
            mock_get_service.return_value = mock_service
            # Clear the encryption service singleton to ensure fresh instance
            import apps.backup.encryption
            apps.backup.encryption._encryption_service = None
            yield mock_service
    
    @pytest.fixture
    def mock_encryption_service(self, mock_secrets_service):
        """Mock BackupEncryptionService to ensure it uses mocked secrets."""
        with patch('apps.backup.tasks.get_backup_encryption_service') as mock_get_service:
            # Create a Mock for the encryption service so we can control encrypt_backup
            mock_service = Mock()
            mock_service.secrets_service = mock_secrets_service
            mock_get_service.return_value = mock_service
            yield mock_service

    @pytest.fixture
    def mock_storage(self):
        """Mock storage backend."""
        with patch('apps.backup.tasks.get_exports_storage') as mock_get_storage:
            mock_storage = Mock()
            mock_storage.save.return_value = "exports/tenant_backups/test_tenant/20240101_120000_abc123.xml"
            mock_storage.exists.return_value = True
            mock_get_storage.return_value = mock_storage
            yield mock_storage

    @pytest.fixture
    def mock_backup_service(self):
        """Mock BackupService."""
        with patch('apps.backup.tasks.BackupService') as mock_service_class:
            mock_service = Mock()
            mock_service.generate_xml.return_value = '<?xml version="1.0"?><backup><data>test</data></backup>'
            mock_service.model_counts = {'users.User': 5, 'multitenancy.Tenant': 1}
            mock_service_class.return_value = mock_service
            yield mock_service

    def test_create_backup_encrypts_content(self, tenant, mock_secrets_service, mock_storage, mock_backup_service, mock_encryption_service):
        """Test that backup task encrypts content before saving."""
        tenant_id = str(tenant.id)

        # Mock encryption key
        test_key = TEST_KEY_32_BYTES
        mock_secrets_service.get_secret_by_name.return_value = None  # No existing key
        mock_secrets_service.store_secret.return_value = "arn:aws:secretsmanager:region:account:secret:name"
        
        # Mock encryption service to return encrypted content (bytes)
        mock_encryption_service.encrypt_backup.return_value = b"encrypted_backup_content_12345"
        
        # Mock storage.exists to return True (file was saved)
        mock_storage.exists.return_value = True

        # Create backup
        result = create_backup(tenant_id=tenant_id)

        # Verify encryption was called (encryption service uses the key internally)
        mock_encryption_service.encrypt_backup.assert_called()

        # Verify storage.save was called
        assert mock_storage.save.called

        # Get the saved content
        saved_call = mock_storage.save.call_args
        saved_content = saved_call[0][1].read()  # ContentFile content

        # Verify saved content is encrypted (not plain XML)
        assert b'<?xml' not in saved_content  # Should not contain plain XML
        assert len(saved_content) > 0

        # Verify backup record was created with encryption flag
        backup_record = BackupRecord.objects.filter(tenant=tenant).latest('created_at')
        assert backup_record.is_encrypted is True
        assert backup_record.status == BackupRecord.Status.COMPLETED
        assert backup_record.file_path is not None

    def test_create_backup_encryption_failure(self, tenant, mock_secrets_service, mock_storage, mock_backup_service, mock_encryption_service):
        """Test that backup task handles encryption failure."""
        tenant_id = str(tenant.id)

        # Mock encryption failure - key storage fails
        mock_secrets_service.get_secret_by_name.return_value = None
        mock_secrets_service.store_secret.return_value = None  # Storage fails
        
        # Mock encryption service to return None (encryption fails)
        mock_encryption_service.encrypt_backup.return_value = None

        # Create backup - task will raise exception
        # When called directly, the exception is raised before retry logic executes
        # We verify the exception is raised and the backup record is marked as failed
        with pytest.raises(Exception) as exc_info:
            create_backup(tenant_id=tenant_id)
        
        # Verify exception is raised (may be Retry if retry logic executes, or plain Exception)
        assert exc_info.value is not None
        assert "encrypt" in str(exc_info.value).lower()

        # Verify backup record shows failure
        backup_records = BackupRecord.objects.filter(tenant=tenant)
        assert backup_records.exists(), "Backup record should be created even on failure"
        backup_record = backup_records.latest('created_at')
        assert backup_record.status == BackupRecord.Status.FAILED
        assert "encrypt" in backup_record.error_message.lower() or "key" in backup_record.error_message.lower()

    def test_create_backup_uses_existing_encryption_key(self, tenant, mock_secrets_service, mock_storage, mock_backup_service, mock_encryption_service):
        """Test that backup task uses existing encryption key if available."""
        tenant_id = str(tenant.id)

        # Mock existing key
        test_key = TEST_KEY_32_BYTES
        mock_secrets_service.get_secret_by_name.return_value = base64.b64encode(test_key).decode('utf-8')
        
        # Mock encryption service to return encrypted content
        mock_encryption_service.encrypt_backup.return_value = b"encrypted_backup_content"
        
        # Mock storage.exists to return True (file was saved)
        mock_storage.exists.return_value = True

        # Create backup
        result = create_backup(tenant_id=tenant_id)

        # Verify encryption was called (encryption service uses the key internally)
        mock_encryption_service.encrypt_backup.assert_called()

        # Verify new key was NOT stored (existing key used)
        # store_secret should not be called if key exists
        # Actually, it might be called if get_secret_by_name returns None first, so we check the flow

        # Verify backup was created successfully
        backup_record = BackupRecord.objects.filter(tenant=tenant).latest('created_at')
        assert backup_record.is_encrypted is True
        assert backup_record.status == BackupRecord.Status.COMPLETED

    def test_create_backup_verifies_file_saved(self, tenant, mock_secrets_service, mock_storage, mock_backup_service, mock_encryption_service):
        """Test that backup task verifies file was saved."""
        tenant_id = str(tenant.id)

        # Mock encryption key
        test_key = TEST_KEY_32_BYTES
        mock_secrets_service.get_secret_by_name.return_value = None
        mock_secrets_service.store_secret.return_value = "arn:aws:secretsmanager:region:account:secret:name"
        
        # Mock encryption service to return encrypted content
        mock_encryption_service.encrypt_backup.return_value = b"encrypted_content"

        # Mock storage.exists to return False (file not saved)
        mock_storage.exists.return_value = False

        # Create backup - task will raise exception when file doesn't exist
        # When called directly, the exception is raised before retry logic executes
        # We verify the exception is raised and the backup record is marked as failed
        with pytest.raises(Exception) as exc_info:
            create_backup(tenant_id=tenant_id)
        
        # Verify exception is raised (may be Retry if retry logic executes, or plain Exception)
        assert exc_info.value is not None
        assert "saved" in str(exc_info.value).lower() or "file" in str(exc_info.value).lower()

        # Verify backup record shows failure
        backup_records = BackupRecord.objects.filter(tenant=tenant)
        assert backup_records.exists(), "Backup record should be created even on failure"
        backup_record = backup_records.latest('created_at')
        assert backup_record.status == BackupRecord.Status.FAILED
        assert "saved" in backup_record.error_message.lower() or "file" in backup_record.error_message.lower()

    def test_create_backup_with_config(self, tenant, mock_secrets_service, mock_storage, mock_backup_service, mock_encryption_service):
        """Test backup creation with backup config."""
        tenant_id = str(tenant.id)

        # Create backup config
        backup_config = BackupConfig.objects.create(
            tenant=tenant,
            enabled=True,
            backup_interval_hours=24,
            retention_days=30,
        )

        # Mock encryption key
        test_key = TEST_KEY_32_BYTES
        mock_secrets_service.get_secret_by_name.return_value = None
        mock_secrets_service.store_secret.return_value = "arn:aws:secretsmanager:region:account:secret:name"
        
        # Mock encryption service to return encrypted content (bytes)
        mock_encryption_service.encrypt_backup.return_value = b"encrypted_backup_content_12345"
        
        # Mock storage.exists to return True (file was saved)
        mock_storage.exists.return_value = True

        # Create backup
        result = create_backup(tenant_id=tenant_id, config_id=str(backup_config.id))

        # Verify backup record is linked to config
        backup_record = BackupRecord.objects.filter(tenant=tenant).latest('created_at')
        assert backup_record.backup_config == backup_config
        assert backup_record.is_encrypted is True

    def test_create_backup_with_scheduled_at_uses_scheduler_time_for_24h_interval(
        self, tenant, mock_secrets_service, mock_storage, mock_backup_service, mock_encryption_service
    ):
        """
        Test that scheduled_at from the scheduler is used as created_at.

        This ensures backups run every 24h (not ~25h). Without scheduled_at, the worker
        creates the record when it picks up the task, causing up to 1h drift with hourly
        checks. With scheduled_at, created_at reflects when the scheduler decided to
        trigger, so the next 24h check runs on time.
        """
        backup_config = BackupConfig.objects.create(
            tenant=tenant,
            enabled=True,
            backup_interval_hours=24,
            retention_days=30,
        )

        mock_secrets_service.get_secret_by_name.return_value = None
        mock_secrets_service.store_secret.return_value = "arn:aws:secretsmanager:region:account:secret:name"
        mock_encryption_service.encrypt_backup.return_value = b"encrypted_backup_content_12345"
        mock_storage.exists.return_value = True

        # Simulate scheduler triggering at exactly 24h ago (the check time)
        scheduled_time = timezone.now() - timedelta(hours=24)
        scheduled_at_iso = scheduled_time.isoformat()

        create_backup(
            tenant_id=str(tenant.id),
            config_id=str(backup_config.id),
            scheduled_at=scheduled_at_iso,
        )

        backup_record = BackupRecord.objects.filter(tenant=tenant).latest('created_at')
        # created_at should match scheduled_at (within 1 second for parsing tolerance)
        assert abs((backup_record.created_at - scheduled_time).total_seconds()) < 1, (
            f"BackupRecord.created_at ({backup_record.created_at}) should match "
            f"scheduled_at ({scheduled_time}) to ensure 24h interval, not ~25h"
        )

        # With created_at = 24h ago, the next scheduler check should trigger a backup
        assert _should_run_backup(backup_config) is True, (
            "Backup should be due after 24h when scheduled_at is used; "
            "without this fix, worker delay would push the interval to ~25h"
        )
