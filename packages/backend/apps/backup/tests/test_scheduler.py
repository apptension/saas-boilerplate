"""
Tests for backup scheduler functionality.
"""

import pytest
from datetime import timedelta
from unittest.mock import ANY, Mock, patch, call
from django.utils import timezone

from apps.backup.models import BackupConfig, BackupRecord
from apps.backup.scheduler import check_and_trigger_backups, _should_run_backup


pytestmark = pytest.mark.django_db


def _create_backup_with_created_at(tenant, **kwargs):
    """Helper to create a backup and set created_at (since auto_now_add ignores it)."""
    created_at = kwargs.pop('created_at', None)
    backup = BackupRecord.objects.create(tenant=tenant, **kwargs)
    if created_at:
        BackupRecord.objects.filter(id=backup.id).update(created_at=created_at)
        backup.refresh_from_db()
    return backup


class TestBackupScheduler:
    """Tests for backup scheduling logic."""

    def test_should_run_backup_no_existing_backup(self, tenant):
        """Test that backup should run when no backup exists."""
        config = BackupConfig.objects.create(
            tenant=tenant,
            enabled=True,
            backup_interval_hours=24,
        )
        
        assert _should_run_backup(config) is True

    def test_should_run_backup_interval_elapsed(self, tenant):
        """Test that backup should run when interval has elapsed."""
        config = BackupConfig.objects.create(
            tenant=tenant,
            enabled=True,
            backup_interval_hours=24,
        )
        
        # Create a backup from 25 hours ago
        _create_backup_with_created_at(
            tenant=tenant,
            status=BackupRecord.Status.COMPLETED,
            file_path="test/backup.xml",
            file_size=1000,
            created_at=timezone.now() - timedelta(hours=25),
        )

        assert _should_run_backup(config) is True

    def test_should_run_backup_interval_not_elapsed(self, tenant):
        """Test that backup should not run when interval has not elapsed."""
        config = BackupConfig.objects.create(
            tenant=tenant,
            enabled=True,
            backup_interval_hours=24,
        )
        
        # Create a backup from 1 hour ago
        _create_backup_with_created_at(
            tenant=tenant,
            status=BackupRecord.Status.COMPLETED,
            file_path="test/backup.xml",
            file_size=1000,
            created_at=timezone.now() - timedelta(hours=1),
        )

        assert _should_run_backup(config) is False

    def test_should_run_backup_recent_failed_blocks_new_backup(self, tenant):
        """Test that a recent failed backup prevents a new backup (respects interval)."""
        config = BackupConfig.objects.create(
            tenant=tenant,
            enabled=True,
            backup_interval_hours=24,
        )

        # Create a failed backup from 1 hour ago
        _create_backup_with_created_at(
            tenant=tenant,
            status=BackupRecord.Status.FAILED,
            error_message="Test error",
            created_at=timezone.now() - timedelta(hours=1),
        )

        # Should NOT run — the failed backup is recent, interval hasn't elapsed
        assert _should_run_backup(config) is False

    def test_should_run_backup_old_failed_allows_new_backup(self, tenant):
        """Test that an old failed backup (past interval) allows a new attempt."""
        config = BackupConfig.objects.create(
            tenant=tenant,
            enabled=True,
            backup_interval_hours=24,
        )

        # Create a failed backup from 25 hours ago
        _create_backup_with_created_at(
            tenant=tenant,
            status=BackupRecord.Status.FAILED,
            error_message="Test error",
            created_at=timezone.now() - timedelta(hours=25),
        )

        # Should run — interval has elapsed since the last attempt
        assert _should_run_backup(config) is True

    def test_should_run_backup_processing_blocks_new_backup(self, tenant):
        """Test that a PROCESSING backup blocks new backups regardless of interval."""
        config = BackupConfig.objects.create(
            tenant=tenant,
            enabled=True,
            backup_interval_hours=24,
        )

        # Create a processing backup from 25 hours ago (interval elapsed, but still running)
        _create_backup_with_created_at(
            tenant=tenant,
            status=BackupRecord.Status.PROCESSING,
            created_at=timezone.now() - timedelta(hours=25),
        )

        # Should NOT run — a backup is still in progress
        assert _should_run_backup(config) is False

    def test_should_run_backup_uses_most_recent_of_any_status(self, tenant):
        """Test that the most recent backup of any status is considered."""
        config = BackupConfig.objects.create(
            tenant=tenant,
            enabled=True,
            backup_interval_hours=24,
        )
        
        # Create old completed backup
        _create_backup_with_created_at(
            tenant=tenant,
            status=BackupRecord.Status.COMPLETED,
            file_path="test/old_backup.xml",
            file_size=1000,
            created_at=timezone.now() - timedelta(hours=30),
        )
        
        # Create recent completed backup
        _create_backup_with_created_at(
            tenant=tenant,
            status=BackupRecord.Status.COMPLETED,
            file_path="test/recent_backup.xml",
            file_size=1000,
            created_at=timezone.now() - timedelta(hours=1),
        )
        
        # Should not run because recent backup is within interval
        assert _should_run_backup(config) is False

    @patch('apps.backup.tasks.create_backup')
    def test_check_and_trigger_backups_triggers_when_due(self, mock_create_backup, tenant):
        """Test that check_and_trigger_backups triggers backup when due."""
        config = BackupConfig.objects.create(
            tenant=tenant,
            enabled=True,
            backup_interval_hours=24,
        )
        
        # No existing backup, so should trigger
        result = check_and_trigger_backups()
        
        assert result['triggered'] == 1
        assert result['skipped'] == 0
        assert result['errors'] == 0
        mock_create_backup.delay.assert_called_once_with(
            tenant_id=str(tenant.id),
            config_id=str(config.id),
            scheduled_at=ANY,
        )

    @patch('apps.backup.tasks.create_backup')
    def test_check_and_trigger_backups_skips_when_not_due(self, mock_create_backup, tenant):
        """Test that check_and_trigger_backups skips when interval not elapsed."""
        config = BackupConfig.objects.create(
            tenant=tenant,
            enabled=True,
            backup_interval_hours=24,
        )
        
        # Create recent backup
        _create_backup_with_created_at(
            tenant=tenant,
            status=BackupRecord.Status.COMPLETED,
            file_path="test/backup.xml",
            file_size=1000,
            created_at=timezone.now() - timedelta(hours=1),
        )
        
        result = check_and_trigger_backups()
        
        assert result['triggered'] == 0
        assert result['skipped'] == 1
        assert result['errors'] == 0
        mock_create_backup.delay.assert_not_called()

    @patch('apps.backup.tasks.create_backup')
    def test_check_and_trigger_backups_ignores_disabled_configs(self, mock_create_backup, tenant):
        """Test that disabled configs are not checked."""
        BackupConfig.objects.create(
            tenant=tenant,
            enabled=False,  # Disabled
            backup_interval_hours=24,
        )
        
        result = check_and_trigger_backups()
        
        assert result['triggered'] == 0
        assert result['skipped'] == 0
        assert result['errors'] == 0
        mock_create_backup.delay.assert_not_called()

    @patch('apps.backup.tasks.create_backup')
    def test_check_and_trigger_backups_handles_multiple_tenants(self, mock_create_backup, tenant_factory):
        """Test that scheduler handles multiple tenants correctly."""
        tenant1 = tenant_factory()
        tenant2 = tenant_factory()
        
        config1 = BackupConfig.objects.create(
            tenant=tenant1,
            enabled=True,
            backup_interval_hours=24,
        )
        
        config2 = BackupConfig.objects.create(
            tenant=tenant2,
            enabled=True,
            backup_interval_hours=12,
        )
        
        # Tenant1: no backup, should trigger
        # Tenant2: create recent backup, should skip
        _create_backup_with_created_at(
            tenant=tenant2,
            status=BackupRecord.Status.COMPLETED,
            file_path="test/backup.xml",
            file_size=1000,
            created_at=timezone.now() - timedelta(hours=1),
        )
        
        result = check_and_trigger_backups()
        
        assert result['triggered'] == 1
        assert result['skipped'] == 1
        assert result['errors'] == 0
        assert mock_create_backup.delay.call_count == 1
        mock_create_backup.delay.assert_any_call(
            tenant_id=str(tenant1.id),
            config_id=str(config1.id),
            scheduled_at=ANY,
        )

    @patch('apps.backup.tasks.create_backup')
    def test_check_and_trigger_backups_handles_errors(self, mock_create_backup, tenant):
        """Test that scheduler handles errors gracefully."""
        config = BackupConfig.objects.create(
            tenant=tenant,
            enabled=True,
            backup_interval_hours=24,
        )
        
        # Make create_backup.delay raise an exception
        mock_create_backup.delay.side_effect = Exception("Task queue error")
        
        result = check_and_trigger_backups()
        
        assert result['triggered'] == 0
        assert result['skipped'] == 0
        assert result['errors'] == 1

    def test_should_run_backup_exact_interval_boundary(self, tenant):
        """Test backup scheduling at exact interval boundary."""
        config = BackupConfig.objects.create(
            tenant=tenant,
            enabled=True,
            backup_interval_hours=24,
        )
        
        # Create backup exactly 24 hours ago
        _create_backup_with_created_at(
            tenant=tenant,
            status=BackupRecord.Status.COMPLETED,
            file_path="test/backup.xml",
            file_size=1000,
            created_at=timezone.now() - timedelta(hours=24),
        )
        
        # Should run because interval has elapsed (>=)
        assert _should_run_backup(config) is True

    def test_should_run_backup_just_before_interval(self, tenant):
        """Test backup scheduling just before interval."""
        config = BackupConfig.objects.create(
            tenant=tenant,
            enabled=True,
            backup_interval_hours=24,
        )
        
        # Create backup 23 hours and 59 minutes ago
        _create_backup_with_created_at(
            tenant=tenant,
            status=BackupRecord.Status.COMPLETED,
            file_path="test/backup.xml",
            file_size=1000,
            created_at=timezone.now() - timedelta(hours=23, minutes=59),
        )
        
        # Should not run because interval has not elapsed
        assert _should_run_backup(config) is False
