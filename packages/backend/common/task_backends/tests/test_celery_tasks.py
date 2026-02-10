import sys
from types import ModuleType
from unittest.mock import MagicMock, patch

import pytest
from django.test import override_settings

from common.task_backends.celery_tasks import (
    execute_scheduled_task,
    export_user_data,
    synchronize_contentful_content,
)

pytestmark = pytest.mark.django_db


class TestExportUserData:
    def test_calls_user_services_and_completes(self):
        with patch("apps.users.services.export.services.user.process_user_data_export") as mock_process:
            export_user_data(user_ids=["1"], admin_email="admin@test.com")

            mock_process.assert_called_once_with(user_ids=["1"], admin_email="admin@test.com")

    def test_retries_on_exception(self):
        with patch("apps.users.services.export.services.user.process_user_data_export") as mock_process:
            mock_process.side_effect = ValueError("Export failed")

            with pytest.raises(ValueError):
                export_user_data(user_ids=[], admin_email="test@test.com")


class TestSynchronizeContentfulContent:
    @override_settings(CONTENTFUL_SPACE_ID=None)
    def test_returns_early_when_contentful_not_configured(self):
        result = synchronize_contentful_content()
        assert result is None

    @override_settings(CONTENTFUL_SPACE_ID="test-space")
    def test_calls_sync_content_when_configured(self):
        mock_sync = MagicMock()
        fake_services = ModuleType("apps.content.services")
        fake_services.sync_content = mock_sync
        with patch.dict(sys.modules, {"apps.content.services": fake_services}):
            synchronize_contentful_content()
            mock_sync.assert_called_once()


class TestExecuteScheduledTask:
    def test_returns_early_when_entry_empty(self):
        result = execute_scheduled_task(entry=None)
        assert result is None

    def test_dispatches_to_backend(self):
        with patch("common.task_backends.get_task_backend") as mock_get_backend:
            mock_backend = MagicMock()
            mock_get_backend.return_value = mock_backend

            entry = {
                "Source": "backend.test",
                "DetailType": "export_user_data",
                "Detail": '{"user_ids": ["1"], "admin_email": "a@b.com"}',
            }

            execute_scheduled_task(entry=entry, due_date="2025-02-10T12:00:00")

            mock_backend.send_task.assert_called_once_with(
                "export_user_data",
                {"user_ids": ["1"], "admin_email": "a@b.com"},
            )
