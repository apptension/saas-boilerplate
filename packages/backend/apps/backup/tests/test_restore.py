"""
Tests for backup restoration functionality.
"""

import base64
import pytest
from unittest.mock import Mock, patch, MagicMock, PropertyMock

from apps.backup.models import BackupConfig, BackupRecord, RestoreRecord
from apps.backup.restore import RestoreService, RestoreConflictError, RestoreValidationError
from apps.backup.schema import RestoreBackupMutation
from apps.multitenancy.models import Tenant


pytestmark = pytest.mark.django_db


# ============ Sample XML for testing ============

SAMPLE_BACKUP_XML = """<?xml version='1.0' encoding='utf-8'?>
<tenant_backup tenant_id="{tenant_id}" backup_timestamp="2025-01-01T12:00:00+00:00" version="1.0">
  <metadata>
    <backup_date>2025-01-01T12:00:00+00:00</backup_date>
  </metadata>
  <data>
    <model name="BackupConfig" count="1">
      <item>
        <id>{config_id}</id>
        <enabled>true</enabled>
        <backup_interval_hours>24</backup_interval_hours>
        <retention_days>30</retention_days>
        <email_recipients>[]</email_recipients>
        <selected_modules>[]</selected_modules>
        <selected_models>[]</selected_models>
        <excluded_models>[]</excluded_models>
      </item>
    </model>
  </data>
  <summary>
    <model name="BackupConfig" count="1" />
  </summary>
</tenant_backup>
"""

EMPTY_BACKUP_XML = """<?xml version='1.0' encoding='utf-8'?>
<tenant_backup tenant_id="{tenant_id}" backup_timestamp="2025-01-01T12:00:00+00:00" version="1.0">
  <metadata>
    <backup_date>2025-01-01T12:00:00+00:00</backup_date>
  </metadata>
  <data>
  </data>
  <summary>
  </summary>
</tenant_backup>
"""

INVALID_XML = "this is not valid xml <><>"

WRONG_ROOT_XML = """<?xml version='1.0' encoding='utf-8'?>
<wrong_root>
  <data></data>
</wrong_root>
"""

NO_DATA_XML = """<?xml version='1.0' encoding='utf-8'?>
<tenant_backup tenant_id="123" backup_timestamp="2025-01-01T12:00:00+00:00" version="1.0">
  <metadata>
    <backup_date>2025-01-01T12:00:00+00:00</backup_date>
  </metadata>
</tenant_backup>
"""


class TestRestoreServiceValidation:
    """Tests for RestoreService XML validation."""

    def test_invalid_xml_raises_validation_error(self, tenant):
        """Test that invalid XML raises RestoreValidationError."""
        service = RestoreService(tenant_id=str(tenant.id), conflict_strategy="SKIP")
        with pytest.raises(RestoreValidationError, match="Invalid XML content"):
            service.restore_from_xml(INVALID_XML)

    def test_wrong_root_element_raises_validation_error(self, tenant):
        """Test that wrong root element raises RestoreValidationError."""
        service = RestoreService(tenant_id=str(tenant.id), conflict_strategy="SKIP")
        with pytest.raises(RestoreValidationError, match="Invalid backup format"):
            service.restore_from_xml(WRONG_ROOT_XML)

    def test_missing_data_section_raises_validation_error(self, tenant):
        """Test that missing data section raises RestoreValidationError."""
        service = RestoreService(tenant_id=str(tenant.id), conflict_strategy="SKIP")
        with pytest.raises(RestoreValidationError, match="No 'data' section found"):
            service.restore_from_xml(NO_DATA_XML)

    def test_empty_data_returns_empty_counts(self, tenant):
        """Test that empty data section returns empty counts."""
        service = RestoreService(tenant_id=str(tenant.id), conflict_strategy="SKIP")
        xml = EMPTY_BACKUP_XML.format(tenant_id=str(tenant.id))
        result = service.restore_from_xml(xml)
        assert result == {}

    def test_invalid_conflict_strategy_raises_error(self, tenant):
        """Test that invalid conflict strategy raises ValueError."""
        with pytest.raises(ValueError, match="Invalid conflict strategy"):
            RestoreService(tenant_id=str(tenant.id), conflict_strategy="INVALID")


class TestRestoreServiceSkipStrategy:
    """Tests for RestoreService with SKIP conflict strategy."""

    def test_skip_existing_records(self, tenant):
        """Test that SKIP strategy skips existing records."""
        # Create existing record
        existing_config = BackupConfig.objects.create(
            tenant=tenant,
            enabled=True,
            backup_interval_hours=24,
            retention_days=30,
        )

        xml = SAMPLE_BACKUP_XML.format(
            tenant_id=str(tenant.id),
            config_id=str(existing_config.id),
        )

        service = RestoreService(tenant_id=str(tenant.id), conflict_strategy="SKIP")
        result = service.restore_from_xml(xml)

        # Verify existing record was not modified
        existing_config.refresh_from_db()
        assert existing_config.enabled is True  # unchanged

        # Verify counts show skipped
        assert 'BackupConfig' in result
        assert result['BackupConfig']['skipped'] == 1
        assert result['BackupConfig']['created'] == 0

    def test_skip_creates_new_records(self, tenant):
        """Test that SKIP strategy creates records that don't exist."""
        # Use a non-existing ID to test creation
        xml = """<?xml version='1.0' encoding='utf-8'?>
<tenant_backup tenant_id="{tenant_id}" backup_timestamp="2025-01-01T12:00:00+00:00" version="1.0">
  <metadata>
    <backup_date>2025-01-01T12:00:00+00:00</backup_date>
  </metadata>
  <data>
    <model name="BackupConfig" count="1">
      <item>
        <enabled>true</enabled>
        <backup_interval_hours>48</backup_interval_hours>
        <retention_days>60</retention_days>
        <email_recipients>[]</email_recipients>
        <selected_modules>[]</selected_modules>
        <selected_models>[]</selected_models>
        <excluded_models>[]</excluded_models>
      </item>
    </model>
  </data>
  <summary>
    <model name="BackupConfig" count="1" />
  </summary>
</tenant_backup>
""".format(tenant_id=str(tenant.id))

        service = RestoreService(tenant_id=str(tenant.id), conflict_strategy="SKIP")
        result = service.restore_from_xml(xml)

        # Verify new record was created
        assert 'BackupConfig' in result
        assert result['BackupConfig']['created'] == 1


class TestRestoreServiceUpdateStrategy:
    """Tests for RestoreService with UPDATE conflict strategy."""

    def test_update_existing_records(self, tenant):
        """Test that UPDATE strategy updates existing records."""
        # Create existing record
        existing_config = BackupConfig.objects.create(
            tenant=tenant,
            enabled=False,
            backup_interval_hours=12,
            retention_days=7,
        )

        xml = SAMPLE_BACKUP_XML.format(
            tenant_id=str(tenant.id),
            config_id=str(existing_config.id),
        )

        service = RestoreService(tenant_id=str(tenant.id), conflict_strategy="UPDATE")
        result = service.restore_from_xml(xml)

        # Verify record was updated
        existing_config.refresh_from_db()
        assert existing_config.enabled is True  # updated from False to True
        assert existing_config.backup_interval_hours == 24
        assert existing_config.retention_days == 30

        # Verify counts
        assert 'BackupConfig' in result
        assert result['BackupConfig']['updated'] == 1


class TestRestoreServiceFailStrategy:
    """Tests for RestoreService with FAIL conflict strategy."""

    def test_fail_on_conflict(self, tenant):
        """Test that FAIL strategy raises error on conflict."""
        # Create existing record
        existing_config = BackupConfig.objects.create(
            tenant=tenant,
            enabled=True,
            backup_interval_hours=24,
            retention_days=30,
        )

        xml = SAMPLE_BACKUP_XML.format(
            tenant_id=str(tenant.id),
            config_id=str(existing_config.id),
        )

        service = RestoreService(tenant_id=str(tenant.id), conflict_strategy="FAIL")
        with pytest.raises(RestoreConflictError, match="already exists"):
            service.restore_from_xml(xml)

    def test_fail_creates_new_records_without_conflict(self, tenant):
        """Test that FAIL strategy creates records when no conflict exists."""
        xml = """<?xml version='1.0' encoding='utf-8'?>
<tenant_backup tenant_id="{tenant_id}" backup_timestamp="2025-01-01T12:00:00+00:00" version="1.0">
  <metadata>
    <backup_date>2025-01-01T12:00:00+00:00</backup_date>
  </metadata>
  <data>
    <model name="BackupConfig" count="1">
      <item>
        <enabled>true</enabled>
        <backup_interval_hours>24</backup_interval_hours>
        <retention_days>30</retention_days>
        <email_recipients>[]</email_recipients>
        <selected_modules>[]</selected_modules>
        <selected_models>[]</selected_models>
        <excluded_models>[]</excluded_models>
      </item>
    </model>
  </data>
  <summary>
    <model name="BackupConfig" count="1" />
  </summary>
</tenant_backup>
""".format(tenant_id=str(tenant.id))

        service = RestoreService(tenant_id=str(tenant.id), conflict_strategy="FAIL")
        result = service.restore_from_xml(xml)

        assert 'BackupConfig' in result
        assert result['BackupConfig']['created'] == 1


class TestRestoreServiceModelOrdering:
    """Tests for RestoreService topological sorting."""

    def test_topological_sort_parent_before_child(self, tenant):
        """Test that FK parent models are sorted before children."""
        service = RestoreService(tenant_id=str(tenant.id), conflict_strategy="SKIP")

        # BackupRecord depends on BackupConfig via FK
        model_data = {
            BackupRecord: [],
            BackupConfig: [],
        }

        sorted_models = service._topological_sort(model_data)

        # BackupConfig should come before BackupRecord
        config_idx = sorted_models.index(BackupConfig)
        record_idx = sorted_models.index(BackupRecord)
        assert config_idx < record_idx, "BackupConfig should be sorted before BackupRecord"


class TestRestoreRecordModel:
    """Tests for the RestoreRecord model."""

    def test_create_restore_record(self, tenant):
        """Test creating a RestoreRecord."""
        backup_record = BackupRecord.objects.create(
            tenant=tenant,
            status=BackupRecord.Status.COMPLETED,
            file_path="test/path.xml",
            file_size=1000,
        )

        restore_record = RestoreRecord.objects.create(
            tenant=tenant,
            backup_record=backup_record,
            status=RestoreRecord.Status.PENDING,
            conflict_strategy=RestoreRecord.ConflictStrategy.SKIP,
        )

        assert restore_record.id is not None
        assert restore_record.backup_record == backup_record
        assert restore_record.status == RestoreRecord.Status.PENDING
        assert restore_record.conflict_strategy == "SKIP"
        assert restore_record.model_counts == {}

    def test_restore_record_totals(self, tenant):
        """Test RestoreRecord total properties."""
        backup_record = BackupRecord.objects.create(
            tenant=tenant,
            status=BackupRecord.Status.COMPLETED,
            file_path="test/path.xml",
            file_size=1000,
        )

        restore_record = RestoreRecord.objects.create(
            tenant=tenant,
            backup_record=backup_record,
            status=RestoreRecord.Status.COMPLETED,
            conflict_strategy=RestoreRecord.ConflictStrategy.UPDATE,
            model_counts={
                'ModelA': {'created': 5, 'updated': 3, 'skipped': 1, 'failed': 0},
                'ModelB': {'created': 2, 'updated': 0, 'skipped': 4, 'failed': 1},
            },
        )

        assert restore_record.total_created == 7
        assert restore_record.total_updated == 3
        assert restore_record.total_skipped == 5
        assert restore_record.total_failed == 1

    def test_restore_record_str(self, tenant):
        """Test RestoreRecord __str__."""
        backup_record = BackupRecord.objects.create(
            tenant=tenant,
            status=BackupRecord.Status.COMPLETED,
            file_path="test/path.xml",
            file_size=1000,
        )

        restore_record = RestoreRecord.objects.create(
            tenant=tenant,
            backup_record=backup_record,
            status=RestoreRecord.Status.PROCESSING,
            conflict_strategy=RestoreRecord.ConflictStrategy.SKIP,
        )

        result = str(restore_record)
        assert "Restore" in result
        assert "PROCESSING" in result


class TestRestoreBackupMutation:
    """Tests for RestoreBackupMutation GraphQL mutation."""

    @pytest.fixture
    def mock_storage(self):
        """Mock storage backend."""
        with patch('apps.backup.tasks.get_exports_storage') as mock_get_storage:
            mock_storage = Mock()
            mock_get_storage.return_value = mock_storage
            yield mock_storage

    def test_restore_mutation_creates_restore_record(self, tenant, user):
        """Test that mutation creates a RestoreRecord and triggers task."""
        # Create completed backup
        backup_record = BackupRecord.objects.create(
            tenant=tenant,
            status=BackupRecord.Status.COMPLETED,
            file_path="test/backup.xml",
            file_size=1000,
            is_encrypted=True,
        )

        with patch.object(type(user), 'is_authenticated', new_callable=PropertyMock, return_value=True):

            class MockContext:
                def __init__(self, user):
                    self.user = user

            info = MagicMock()
            info.context = MockContext(user)

            from graphql_relay import to_global_id

            backup_global_id = to_global_id('BackupRecordType', str(backup_record.id))

            with patch('apps.backup.tasks.restore_backup') as mock_task:
                mock_task.delay = MagicMock()

                result = RestoreBackupMutation.mutate(
                    None, info, backup_id=backup_global_id, conflict_strategy="SKIP"
                )

                assert result.ok is True
                assert result.restore_id is not None

                # Verify RestoreRecord was created
                assert RestoreRecord.objects.filter(tenant=tenant).exists()
                restore_record = RestoreRecord.objects.filter(tenant=tenant).first()
                assert restore_record.backup_record == backup_record
                assert restore_record.conflict_strategy == "SKIP"
                assert restore_record.status == RestoreRecord.Status.PENDING

                # Verify task was triggered
                mock_task.delay.assert_called_once()

    def test_restore_mutation_rejects_incomplete_backup(self, tenant, user):
        """Test that mutation rejects backups that aren't completed."""
        backup_record = BackupRecord.objects.create(
            tenant=tenant,
            status=BackupRecord.Status.PROCESSING,
            file_path="test/backup.xml",
            file_size=1000,
        )

        with patch.object(type(user), 'is_authenticated', new_callable=PropertyMock, return_value=True):

            class MockContext:
                def __init__(self, user):
                    self.user = user

            info = MagicMock()
            info.context = MockContext(user)

            from graphql_relay import to_global_id

            backup_global_id = to_global_id('BackupRecordType', str(backup_record.id))
            result = RestoreBackupMutation.mutate(
                None, info, backup_id=backup_global_id, conflict_strategy="SKIP"
            )

            assert result.ok is False
            assert "completed" in result.error.lower()

    def test_restore_mutation_rejects_missing_file(self, tenant, user):
        """Test that mutation rejects backups without file path."""
        backup_record = BackupRecord.objects.create(
            tenant=tenant,
            status=BackupRecord.Status.COMPLETED,
            file_path="",
            file_size=0,
        )

        with patch.object(type(user), 'is_authenticated', new_callable=PropertyMock, return_value=True):

            class MockContext:
                def __init__(self, user):
                    self.user = user

            info = MagicMock()
            info.context = MockContext(user)

            from graphql_relay import to_global_id

            backup_global_id = to_global_id('BackupRecordType', str(backup_record.id))
            result = RestoreBackupMutation.mutate(
                None, info, backup_id=backup_global_id, conflict_strategy="SKIP"
            )

            assert result.ok is False
            assert "file" in result.error.lower()

    def test_restore_mutation_rejects_unauthenticated(self, tenant):
        """Test that mutation rejects unauthenticated users."""
        backup_record = BackupRecord.objects.create(
            tenant=tenant,
            status=BackupRecord.Status.COMPLETED,
            file_path="test/backup.xml",
            file_size=1000,
        )

        class MockContext:
            user = None

        info = MagicMock()
        info.context = MockContext()

        from graphql_relay import to_global_id

        backup_global_id = to_global_id('BackupRecordType', str(backup_record.id))
        result = RestoreBackupMutation.mutate(
            None, info, backup_id=backup_global_id, conflict_strategy="SKIP"
        )

        assert result.ok is False
        assert "Authentication" in result.error or "required" in result.error.lower()

    def test_restore_mutation_backup_not_found(self, user):
        """Test that mutation handles non-existent backup."""
        with patch.object(type(user), 'is_authenticated', new_callable=PropertyMock, return_value=True):

            class MockContext:
                def __init__(self, user):
                    self.user = user

            info = MagicMock()
            info.context = MockContext(user)

            from graphql_relay import to_global_id

            invalid_global_id = to_global_id('BackupRecordType', '999999')
            result = RestoreBackupMutation.mutate(
                None, info, backup_id=invalid_global_id, conflict_strategy="SKIP"
            )

            assert result.ok is False
            assert "not found" in result.error.lower()
