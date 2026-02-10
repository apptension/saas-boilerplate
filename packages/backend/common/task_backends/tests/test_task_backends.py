import json
from datetime import datetime
from unittest.mock import MagicMock, patch

import pytest

from common.task_backends import (
    CeleryTaskBackend,
    LambdaTaskBackend,
    get_task_backend,
)

pytestmark = pytest.mark.django_db


@pytest.fixture
def mock_boto_client():
    with patch("boto3.client") as mock_client_factory:
        mock_client = MagicMock()
        mock_client_factory.return_value = mock_client
        yield mock_client


class TestGetTaskBackend:
    def test_returns_lambda_backend_by_default(self):
        with patch("boto3.client") as mock_client_factory:
            mock_client_factory.return_value = MagicMock()
            with patch("common.task_backends.settings") as mock_settings:
                mock_settings.TASK_BACKEND = "lambda"
                mock_settings.AWS_ENDPOINT_URL = "http://localhost:4566"
                mock_settings.WORKERS_EVENT_BUS_NAME = "test-bus"
                backend = get_task_backend()
                assert isinstance(backend, LambdaTaskBackend)

    def test_returns_celery_backend_when_configured(self):
        with patch("common.task_backends.settings") as mock_settings:
            mock_settings.TASK_BACKEND = "celery"
            backend = get_task_backend()
            assert isinstance(backend, CeleryTaskBackend)

    def test_returns_lambda_backend_when_missing_uses_default(self):
        with patch("boto3.client") as mock_client_factory:
            mock_client_factory.return_value = MagicMock()
            with patch("common.task_backends.settings") as mock_settings:
                mock_settings.TASK_BACKEND = "lambda"
                mock_settings.AWS_ENDPOINT_URL = "http://localhost:4566"
                mock_settings.WORKERS_EVENT_BUS_NAME = "test-bus"
                backend = get_task_backend()
                assert isinstance(backend, LambdaTaskBackend)


class TestLambdaTaskBackend:
    def test_send_task_puts_event(self, mock_boto_client):
        with patch("common.task_backends.settings") as mock_settings:
            mock_settings.AWS_ENDPOINT_URL = "http://localhost:4566"
            mock_settings.WORKERS_EVENT_BUS_NAME = "test-bus"
            backend = LambdaTaskBackend()
            backend.send_task("test_task", {"user_id": "123", "tenant_id": "456"})

            mock_boto_client.put_events.assert_called_once()
            call_args = mock_boto_client.put_events.call_args
            entries = call_args.kwargs["Entries"]
            assert len(entries) == 1
            entry = entries[0]
            assert entry["Source"] == "backend.test_task"
            assert entry["DetailType"] == "test_task"
            assert entry["EventBusName"] == "test-bus"

            detail = json.loads(entry["Detail"])
            assert detail["type"] == "test_task"
            assert detail["user_id"] == "123"
            assert detail["tenant_id"] == "456"
            assert "id" in detail

    def test_send_task_with_due_date_wraps_in_scheduler(self, mock_boto_client):
        with patch("common.task_backends.settings") as mock_settings:
            mock_settings.AWS_ENDPOINT_URL = "http://localhost:4566"
            mock_settings.WORKERS_EVENT_BUS_NAME = "test-bus"
            backend = LambdaTaskBackend()
            due_date = datetime(2025, 2, 10, 12, 0, 0)

            backend.send_task("test_task", {"key": "value"}, due_date=due_date)

            mock_boto_client.put_events.assert_called_once()
            entry = mock_boto_client.put_events.call_args.kwargs["Entries"][0]
            assert entry["Source"] == "backend.scheduler"
            assert entry["DetailType"] == "backend.scheduler"

            detail = json.loads(entry["Detail"])
            assert detail["type"] == "backend.scheduler"
            assert detail["due_date"] == due_date.isoformat()
            assert "entry" in detail


class TestCeleryTaskBackend:
    def test_send_task_dispatches_registered_task(self):
        with patch("celery.current_app") as mock_app:
            backend = CeleryTaskBackend()
            backend.send_task("export_user_data", {"user_ids": ["1"], "admin_email": "admin@test.com"})

            mock_app.send_task.assert_called_once_with(
                "common.task_backends.celery_tasks.export_user_data",
                kwargs={"user_ids": ["1"], "admin_email": "admin@test.com"},
            )

    def test_send_task_raises_for_unknown_task(self):
        backend = CeleryTaskBackend()
        with pytest.raises(ValueError, match="Unknown task: unknown_task"):
            backend.send_task("unknown_task", {})

    def test_send_task_with_eta_schedules_task(self):
        with patch("celery.current_app") as mock_app:
            backend = CeleryTaskBackend()
            due_date = datetime(2025, 2, 10, 12, 0, 0)

            backend.send_task("export_user_data", {"user_ids": []}, due_date=due_date)

            mock_app.send_task.assert_called_once_with(
                "common.task_backends.celery_tasks.export_user_data",
                kwargs={"user_ids": []},
                eta=due_date,
            )
