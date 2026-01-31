"""
Celery Task Equivalents for Lambda Workers

This module contains Celery task implementations that mirror the functionality
of the AWS Lambda workers. Used when TASK_BACKEND='celery'.

These tasks are automatically scheduled via Celery Beat when using the Celery backend.
"""

import logging

from celery import shared_task

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def export_user_data(self, user_ids: list[str] = None, admin_email: str = None, **kwargs):
    """
    Celery equivalent of ExportUserData Lambda task.

    Exports user data for the given user IDs and sends to admin email.

    Args:
        user_ids: List of user IDs to export
        admin_email: Email address to send the export to
    """
    try:
        from apps.users.services.export.services import user as user_services

        logger.info(f"Starting user data export for {len(user_ids or [])} users")
        user_services.process_user_data_export(user_ids=user_ids, admin_email=admin_email)
        logger.info("User data export completed successfully")
    except Exception as exc:
        logger.exception(f"User data export failed: {exc}")
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=300, ignore_result=True)
def synchronize_contentful_content(self, **kwargs):
    """
    Celery equivalent of SynchronizeContentfulContent Lambda task.

    Synchronizes content from Contentful CMS.
    This task is scheduled to run every 5 minutes via Celery Beat (if Contentful is configured).

    Note: ignore_result=True prevents storing task results in the database,
    reducing database writes and connection usage.
    """
    from django.conf import settings

    # Skip if Contentful is not configured
    contentful_space = getattr(settings, 'CONTENTFUL_SPACE_ID', None)
    if not contentful_space:
        # Don't log anything - this task shouldn't be scheduled if Contentful isn't configured
        return

    try:
        from apps.content.services import sync_content

        logger.info("Starting Contentful content synchronization")
        sync_content()
        logger.info("Contentful content synchronization completed")
    except ImportError:
        # Content app may not have the sync_content service
        logger.warning("Contentful sync skipped: sync_content service not available")
    except Exception as exc:
        logger.exception(f"Contentful sync failed: {exc}")
        raise self.retry(exc=exc)


@shared_task(bind=True)
def execute_scheduled_task(self, entry: dict = None, due_date: str = None, **kwargs):
    """
    Celery equivalent of ExecuteScheduledTask Lambda.

    Executes a previously scheduled task entry.
    This is used for delayed/scheduled task execution.

    Args:
        entry: The original task entry to execute
        due_date: ISO format datetime when the task was scheduled
    """
    if not entry:
        logger.warning("execute_scheduled_task called without entry")
        return

    task_name = entry.get('DetailType')
    logger.info(f"Executing scheduled task: {task_name} (scheduled for {due_date})")

    # Re-dispatch to the appropriate task
    from common.task_backends import get_task_backend

    backend = get_task_backend()
    import json

    data = json.loads(entry.get('Detail', '{}'))
    backend.send_task(task_name, data)
