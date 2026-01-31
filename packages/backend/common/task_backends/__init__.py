"""
Task Backend Abstraction Layer

This module provides a platform-agnostic interface for executing background tasks.
Supports both AWS Lambda (via EventBridge) and Celery backends.

Configuration:
    Set TASK_BACKEND environment variable:
    - 'lambda': AWS Lambda + EventBridge (default, for AWS deployments)
    - 'celery': Celery (for Render, VPS, Railway, Fly.io, etc.)

Usage:
    from common.task_backends import get_task_backend

    backend = get_task_backend()
    backend.send_task('export_user_data', {'user_id': '123', 'tenant_id': '456'})
"""

import logging
from abc import ABC, abstractmethod
from datetime import datetime
from typing import Any, Optional

from django.conf import settings

logger = logging.getLogger(__name__)


class BaseTaskBackend(ABC):
    """Abstract base class for task execution backends."""

    @abstractmethod
    def send_task(
        self,
        task_name: str,
        data: dict[str, Any],
        due_date: Optional[datetime] = None,
    ) -> None:
        """
        Send a task for execution.

        Args:
            task_name: Name of the task to execute
            data: Dictionary of task parameters
            due_date: Optional datetime for scheduled execution
        """


class LambdaTaskBackend(BaseTaskBackend):
    """
    AWS Lambda + EventBridge backend for task execution.

    This backend sends tasks to AWS EventBridge, which triggers Lambda functions.
    Used for AWS-based deployments with the serverless workers.
    """

    def __init__(self):
        import boto3

        self.client = boto3.client('events', endpoint_url=settings.AWS_ENDPOINT_URL)
        self.event_bus_name = getattr(settings, 'WORKERS_EVENT_BUS_NAME', None)

    def send_task(
        self,
        task_name: str,
        data: dict[str, Any],
        due_date: Optional[datetime] = None,
    ) -> None:
        import json
        import uuid

        # Build the event entry
        entry = {
            'Source': f'backend.{task_name}',
            'DetailType': task_name,
            'Detail': json.dumps(
                {
                    "id": uuid.uuid4().hex,
                    "type": task_name,
                    **data,
                }
            ),
            'EventBusName': self.event_bus_name,
        }

        # If scheduled, wrap in scheduler event
        if due_date is not None:
            entry = {
                'Source': 'backend.scheduler',
                'DetailType': 'backend.scheduler',
                'Detail': json.dumps(
                    {
                        "id": uuid.uuid4().hex,
                        "type": 'backend.scheduler',
                        'entry': entry,
                        'due_date': due_date.isoformat(),
                    }
                ),
                'EventBusName': self.event_bus_name,
            }

        self.client.put_events(Entries=[entry])
        logger.info(f"Sent task {task_name} to Lambda via EventBridge")


class CeleryTaskBackend(BaseTaskBackend):
    """
    Celery backend for task execution.

    This backend uses Celery to execute tasks asynchronously.
    Used for non-AWS deployments (Render, VPS, Railway, Fly.io, etc.)
    """

    # Map task names to Celery task paths
    TASK_REGISTRY = {
        'export_user_data': 'common.task_backends.celery_tasks.export_user_data',
        'synchronize_contentful_content': 'common.task_backends.celery_tasks.synchronize_contentful_content',
        'EXPORT_USER_DATA': 'common.task_backends.celery_tasks.export_user_data',
    }

    def send_task(
        self,
        task_name: str,
        data: dict[str, Any],
        due_date: Optional[datetime] = None,
    ) -> None:
        from celery import current_app

        task_path = self.TASK_REGISTRY.get(task_name)
        if not task_path:
            raise ValueError(f"Unknown task: {task_name}. Register it in CeleryTaskBackend.TASK_REGISTRY")

        if due_date:
            current_app.send_task(task_path, kwargs=data, eta=due_date)
            logger.info(f"Scheduled Celery task {task_name} for {due_date.isoformat()}")
        else:
            current_app.send_task(task_path, kwargs=data)
            logger.info(f"Sent Celery task {task_name}")


def get_task_backend() -> BaseTaskBackend:
    """
    Factory function to get the configured task backend.

    Returns:
        BaseTaskBackend: The configured task backend instance

    Configuration:
        Set TASK_BACKEND environment variable:
        - 'lambda': AWS Lambda + EventBridge (default)
        - 'celery': Celery
    """
    backend_name = getattr(settings, 'TASK_BACKEND', 'lambda')

    if backend_name == 'celery':
        return CeleryTaskBackend()
    else:
        return LambdaTaskBackend()
