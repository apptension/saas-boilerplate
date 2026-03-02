"""
Tests for multitenancy Celery tasks.
"""

import pytest
from unittest.mock import patch, MagicMock

from apps.multitenancy.tasks import export_action_logs
from apps.multitenancy.models import ActionLogExport, ActionLog
from apps.multitenancy.constants import ActionType
from apps.notifications.models import Notification


@pytest.mark.django_db
class TestExportActionLogsTask:
    """Tests for export_action_logs task."""

    def test_returns_error_when_export_not_found(self):
        result = export_action_logs.run("nonexistent-id")
        assert "error" in result
        assert "not found" in result["error"].lower()

    def test_skips_already_completed_export(self, tenant, user_factory, tenant_membership_factory):
        user = user_factory()
        tenant_membership_factory(user=user, tenant=tenant, is_accepted=True)
        export_job = ActionLogExport.objects.create(
            tenant=tenant,
            requested_by=user,
            status=ActionLogExport.Status.COMPLETED,
        )

        result = export_action_logs.run(str(export_job.id))
        assert result["status"] == ActionLogExport.Status.COMPLETED

    def test_skips_already_failed_export(self, tenant, user_factory, tenant_membership_factory):
        user = user_factory()
        tenant_membership_factory(user=user, tenant=tenant, is_accepted=True)
        export_job = ActionLogExport.objects.create(
            tenant=tenant,
            requested_by=user,
            status=ActionLogExport.Status.FAILED,
        )

        result = export_action_logs.run(str(export_job.id))
        assert result["status"] == ActionLogExport.Status.FAILED

    @patch("apps.multitenancy.tasks.get_exports_storage")
    def test_exports_logs_successfully(self, mock_get_storage, tenant, user_factory, tenant_membership_factory):
        user = user_factory()
        tenant_membership_factory(user=user, tenant=tenant, is_accepted=True)
        ActionLog.objects.create(
            tenant=tenant,
            action_type=ActionType.CREATE,
            entity_type="project",
            entity_id="proj-1",
            entity_name="Test Project",
            actor_email=user.email,
            changes={},
            metadata={},
        )
        export_job = ActionLogExport.objects.create(
            tenant=tenant,
            requested_by=user,
            status=ActionLogExport.Status.PENDING,
        )

        mock_storage = MagicMock()
        mock_storage.save.return_value = "action_logs/tenant/20250101_120000_abc123.zip"
        mock_get_storage.return_value = mock_storage

        result = export_action_logs.run(str(export_job.id))

        assert result["status"] == "completed"
        assert result["log_count"] == 1
        assert "file_path" in result
        assert mock_storage.save.called

        export_job.refresh_from_db()
        assert export_job.status == ActionLogExport.Status.COMPLETED

        notification = Notification.objects.filter(user=user).first()
        assert notification is not None
        assert notification.type == "ACTION_LOG_EXPORT_READY"
