"""
Dynamic scheduling for tenant backups.

Uses a single periodic task that checks all enabled backup configs
and triggers backups for tenants whose interval has elapsed.
"""

import logging
from datetime import timedelta

from django.utils import timezone

from .models import BackupConfig, BackupRecord

logger = logging.getLogger(__name__)


def check_and_trigger_backups():
    """
    Check all enabled backup configs and trigger backups if interval has elapsed.

    This function is called by a periodic Celery Beat task (e.g., every hour).
    It checks each enabled backup config and determines if a backup should run
    based on the last backup time and configured interval.

    Returns:
        Dict with summary of triggered backups
    """
    from .tasks import create_backup

    enabled_configs = BackupConfig.objects.filter(enabled=True).select_related('tenant')

    triggered_count = 0
    skipped_count = 0
    error_count = 0

    for config in enabled_configs:
        try:
            # Check if backup is due
            if _should_run_backup(config):
                # Trigger backup task. Pass scheduled_at so the BackupRecord uses this timestamp
                # for created_at, avoiding ~25h drift from worker queue delay (check runs hourly).
                create_backup.delay(
                    tenant_id=str(config.tenant_id),
                    config_id=str(config.id),
                    scheduled_at=timezone.now().isoformat(),
                )
                triggered_count += 1
                logger.info(
                    f"Triggered backup for tenant {config.tenant_id} " f"(interval: {config.backup_interval_hours}h)"
                )
            else:
                skipped_count += 1
        except Exception as e:
            logger.error(f"Error checking backup config {config.id}: {e}", exc_info=True)
            error_count += 1

    logger.info(
        f"Backup check completed: {triggered_count} triggered, " f"{skipped_count} skipped, {error_count} errors"
    )

    return {
        "triggered": triggered_count,
        "skipped": skipped_count,
        "errors": error_count,
    }


def _should_run_backup(config: BackupConfig) -> bool:
    """
    Determine if a backup should run for a given config.

    A backup should run if:
    1. No backup has ever been created for this tenant, OR
    2. The last backup (any status) was created more than backup_interval_hours ago,
       AND there is no backup currently in PROCESSING state.

    We check all statuses (not just COMPLETED) to prevent:
    - Repeatedly triggering backups while one is still PROCESSING
    - Flooding the queue with new backups when previous ones keep failing

    Args:
        config: BackupConfig to check

    Returns:
        True if backup should run, False otherwise
    """
    # Never trigger a new backup while one is still processing
    has_processing = BackupRecord.objects.filter(
        tenant=config.tenant,
        status=BackupRecord.Status.PROCESSING,
    ).exists()
    if has_processing:
        return False

    # Get the most recent backup of any status for this tenant
    last_backup = (
        BackupRecord.objects.filter(
            tenant=config.tenant,
        )
        .order_by('-created_at')
        .first()
    )

    # If no backup exists at all, we should create one
    if not last_backup:
        return True

    # Check if interval has elapsed since the last backup attempt
    interval = timedelta(hours=config.backup_interval_hours)
    time_since_last_backup = timezone.now() - last_backup.created_at

    return time_since_last_backup >= interval
