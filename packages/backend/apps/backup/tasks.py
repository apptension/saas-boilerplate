"""
Celery tasks for backup operations.
"""

import hashlib
import io
import logging

from celery import shared_task
from django.core.files.base import ContentFile
from django.utils import timezone
from datetime import timedelta

from apps.multitenancy.models import Tenant
from common.storages import get_exports_storage

from .models import BackupConfig, BackupRecord, RestoreRecord
from .service import BackupService
from .emails import BackupReadyEmail
from .encryption import get_backup_encryption_service

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=300, ignore_result=True)
def create_backup(self, tenant_id: str, config_id: str = None, scheduled_at: str = None):
    """
    Create a backup of tenant data.

    Args:
        tenant_id: ID of the tenant to backup
        config_id: Optional ID of the BackupConfig that triggered this backup
        scheduled_at: Optional ISO datetime string when the backup was scheduled (from scheduler).
            Used as created_at to avoid interval drift from worker queue delay. When None (e.g.
            manual trigger), created_at uses the current time.

    Returns:
        Dict with backup status and details
    """
    from datetime import datetime

    from apps.notifications.models import Notification

    logger.info(f"Starting backup for tenant {tenant_id}")

    try:
        tenant = Tenant.objects.get(pk=tenant_id)
    except Tenant.DoesNotExist:
        logger.error(f"Tenant {tenant_id} not found")
        return {"error": "Tenant not found", "success": False}

    # Load backup config if provided
    backup_config = None
    if config_id:
        try:
            backup_config = BackupConfig.objects.get(pk=config_id, tenant=tenant)
        except BackupConfig.DoesNotExist:
            logger.warning(f"BackupConfig {config_id} not found, proceeding without config")

    # Use scheduled_at for created_at when provided (scheduler trigger) to avoid ~25h drift
    # from worker queue delay. For manual triggers, scheduled_at is None so we use current time.
    record_created_at = timezone.now()
    if scheduled_at:
        try:
            dt = datetime.fromisoformat(scheduled_at.replace("Z", "+00:00"))
            record_created_at = timezone.make_aware(dt) if timezone.is_naive(dt) else dt
        except (ValueError, TypeError):
            pass

    # Create backup record
    backup_record = BackupRecord.objects.create(
        tenant=tenant,
        backup_config=backup_config,
        status=BackupRecord.Status.PROCESSING,
    )
    # Django's auto_now_add overrides explicit create(created_at=...), so use update() when
    # we need a specific timestamp (scheduler's scheduled_at) for correct 24h interval.
    if scheduled_at:
        BackupRecord.objects.filter(pk=backup_record.pk).update(created_at=record_created_at)
        backup_record.refresh_from_db()

    try:
        # Get module/model selection from config
        selected_modules = backup_config.selected_modules if backup_config else []
        selected_models = backup_config.selected_models if backup_config else []
        excluded_models = backup_config.excluded_models if backup_config else []

        # Generate XML backup
        backup_service = BackupService(
            tenant_id=str(tenant_id),
            selected_modules=selected_modules,
            selected_models=selected_models,
            excluded_models=excluded_models,
        )
        xml_content = backup_service.generate_xml()
        xml_bytes = xml_content.encode('utf-8')

        # Encrypt backup content
        encryption_service = get_backup_encryption_service()
        encrypted_bytes = encryption_service.encrypt_backup(xml_bytes, str(tenant_id))

        if encrypted_bytes is None:
            raise Exception("Failed to encrypt backup content")

        file_size = len(encrypted_bytes)
        is_encrypted = True

        # Generate filename with timestamp and hash
        timestamp = timezone.now().strftime('%Y%m%d_%H%M%S')
        content_hash = hashlib.sha256(encrypted_bytes).hexdigest()[:12]
        filename = f"tenant_backups/{tenant_id}/{timestamp}_{content_hash}.xml"

        # Save to storage
        storage = get_exports_storage()
        saved_path = storage.save(filename, ContentFile(encrypted_bytes))
        logger.info(f"Saved encrypted backup to {saved_path}")

        # Verify file was actually saved
        if not storage.exists(saved_path):
            raise Exception(f"Backup file was not saved successfully to {saved_path}")

        # Update backup record
        backup_record.status = BackupRecord.Status.COMPLETED
        backup_record.file_path = saved_path
        backup_record.file_size = file_size
        backup_record.is_encrypted = is_encrypted
        backup_record.model_counts = backup_service.model_counts
        backup_record.save()

        # Build link to the backup settings page in the web app (where the user can decrypt & download)
        import os
        web_app_url = os.environ.get('VITE_WEB_APP_URL', 'http://localhost:3000')
        backup_settings_url = f"{web_app_url}/en/tenant/{tenant_id}/settings/backup"

        # Send email notifications if config exists and has recipients
        # Filter out empty strings and None values
        valid_recipient_ids = [rid for rid in (backup_config.email_recipients or []) if rid] if backup_config else []
        logger.info(
            f"Backup email check: config={backup_config is not None}, valid_recipient_ids={valid_recipient_ids}, count={len(valid_recipient_ids)}"
        )

        if backup_config and valid_recipient_ids:
            from apps.users.models import User

            recipients = User.objects.filter(id__in=valid_recipient_ids)
            logger.info(f"Found {recipients.count()} user(s) for backup email notifications")

            for recipient in recipients:
                try:
                    logger.info(f"Preparing to send backup email to {recipient.email}")
                    email = BackupReadyEmail(
                        to=recipient.email,
                        data={
                            'tenant_name': tenant.name,
                            'backup_date': timezone.now().isoformat(),
                            'file_size': file_size,
                            'backup_settings_url': backup_settings_url,
                            'model_counts': backup_service.model_counts,
                        },
                    )
                    email.send()
                    logger.info(f"Sent backup email to {recipient.email}")
                except Exception as e:
                    logger.error(f"Failed to send backup email to {recipient.email}: {e}", exc_info=True)
        else:
            logger.info(
                f"Skipping email notifications: config={backup_config is not None}, valid_recipient_ids={valid_recipient_ids}"
            )

        # Create in-app notification for all tenant members with backup view permission
        # We'll notify the tenant owner or first admin user
        try:
            from apps.multitenancy.models import TenantMembership
            from apps.multitenancy.constants import TenantUserRole

            # Get tenant owner or admin
            admin_membership = TenantMembership.objects.filter(
                tenant=tenant, role__in=[TenantUserRole.OWNER, TenantUserRole.ADMIN]
            ).first()

            if admin_membership:
                Notification.objects.create(
                    user=admin_membership.user,
                    type='BACKUP_READY',
                    data={
                        'backup_id': str(backup_record.id),
                        'tenant_name': tenant.name,
                        'backup_date': timezone.now().isoformat(),
                        'file_size': file_size,
                        'backup_settings_url': backup_settings_url,
                        'model_counts': backup_service.model_counts,
                    },
                )
        except Exception as e:
            logger.warning(f"Failed to create backup notification: {e}")

        logger.info(f"Backup completed successfully for tenant {tenant_id}")
        return {
            "success": True,
            "tenant_id": tenant_id,
            "backup_id": str(backup_record.id),
            "file_path": saved_path,
            "file_size": file_size,
        }

    except Exception as exc:
        logger.exception(f"Backup failed for tenant {tenant_id}: {exc}")
        backup_record.status = BackupRecord.Status.FAILED
        backup_record.error_message = str(exc)
        backup_record.save()

        # Notify user of failure
        try:
            if backup_config and backup_config.email_recipients:
                from apps.users.models import User

                recipients = User.objects.filter(id__in=backup_config.email_recipients)
                for recipient in recipients:
                    Notification.objects.create(
                        user=recipient,
                        type='BACKUP_FAILED',
                        data={
                            'tenant_name': tenant.name,
                            'error': str(exc),
                        },
                    )
        except Exception as e:
            logger.error(f"Failed to send failure notification: {e}")

        if self.request.retries < self.max_retries:
            raise self.retry(exc=exc)
        return {"error": str(exc), "success": False}


@shared_task(bind=True, max_retries=3, default_retry_delay=300, ignore_result=True)
def cleanup_old_backups(self):
    """
    Clean up backup files older than the retention period.

    Runs periodically to delete old backup files and records.
    """
    logger.info("Starting cleanup of old backups")

    try:
        # Get all enabled backup configs
        configs = BackupConfig.objects.filter(enabled=True)

        deleted_count = 0
        error_count = 0

        for config in configs:
            retention_date = timezone.now() - timedelta(days=config.retention_days)

            # Find backup records older than retention period
            old_backups = BackupRecord.objects.filter(
                tenant=config.tenant,
                status=BackupRecord.Status.COMPLETED,
                created_at__lt=retention_date,
            )

            storage = get_exports_storage()

            for backup in old_backups:
                try:
                    # Delete file from storage
                    if backup.file_path:
                        try:
                            storage.delete(backup.file_path)
                            logger.debug(f"Deleted backup file: {backup.file_path}")
                        except Exception as e:
                            logger.warning(f"Failed to delete backup file {backup.file_path}: {e}")

                    # Delete backup record
                    backup.delete()
                    deleted_count += 1
                except Exception as e:
                    logger.error(f"Error cleaning up backup {backup.id}: {e}")
                    error_count += 1

        logger.info(f"Backup cleanup completed: {deleted_count} deleted, {error_count} errors")
        return {"deleted": deleted_count, "errors": error_count}

    except Exception as exc:
        logger.exception(f"Backup cleanup failed: {exc}")
        if self.request.retries < self.max_retries:
            raise self.retry(exc=exc)
        return {"error": str(exc)}


@shared_task(bind=True, max_retries=1, default_retry_delay=60, ignore_result=True)
def restore_backup(self, backup_record_id: str, restore_record_id: str, conflict_strategy: str):
    """
    Restore tenant data from a backup record.

    Reads the encrypted backup from storage, decrypts it, parses the XML,
    and imports the data using the RestoreService.

    Args:
        backup_record_id: ID of the BackupRecord to restore from
        restore_record_id: ID of the RestoreRecord tracking this restore
        conflict_strategy: One of SKIP, UPDATE, or FAIL
    """
    from apps.notifications.models import Notification
    from .restore import RestoreService, RestoreConflictError, RestoreValidationError

    logger.info(f"Starting restore from backup {backup_record_id} with strategy {conflict_strategy}")

    try:
        restore_record = RestoreRecord.objects.get(pk=restore_record_id)
    except RestoreRecord.DoesNotExist:
        logger.error(f"RestoreRecord {restore_record_id} not found")
        return {"error": "Restore record not found", "success": False}

    try:
        backup_record = BackupRecord.objects.get(pk=backup_record_id)
    except BackupRecord.DoesNotExist:
        logger.error(f"BackupRecord {backup_record_id} not found")
        restore_record.status = RestoreRecord.Status.FAILED
        restore_record.error_message = "Backup record not found"
        restore_record.completed_at = timezone.now()
        restore_record.save()
        return {"error": "Backup record not found", "success": False}

    tenant = backup_record.tenant

    # Update restore record to processing
    restore_record.status = RestoreRecord.Status.PROCESSING
    restore_record.started_at = timezone.now()
    restore_record.save()

    try:
        # Read backup file from storage
        if not backup_record.file_path:
            raise Exception("Backup file path is empty")

        storage = get_exports_storage()

        if not storage.exists(backup_record.file_path):
            raise Exception(f"Backup file not found at {backup_record.file_path}")

        with storage.open(backup_record.file_path, 'rb') as f:
            file_content = f.read()

        # Decrypt if encrypted
        if backup_record.is_encrypted:
            encryption_service = get_backup_encryption_service()
            decrypted_content = encryption_service.decrypt_backup(file_content, str(tenant.id))
            if decrypted_content is None:
                raise Exception("Failed to decrypt backup content")
            xml_bytes = decrypted_content
        else:
            xml_bytes = file_content

        # Decode to string
        xml_content = xml_bytes.decode('utf-8')

        # Run restore
        restore_service = RestoreService(
            tenant_id=str(tenant.id),
            conflict_strategy=conflict_strategy,
        )
        model_counts = restore_service.restore_from_xml(xml_content)

        # Check if there were any failures
        total_failed = sum(counts.get('failed', 0) for counts in model_counts.values())
        has_errors = total_failed > 0 or len(restore_service.errors) > 0

        # Update restore record
        restore_record.model_counts = model_counts
        if has_errors:
            restore_record.status = RestoreRecord.Status.PARTIALLY_COMPLETED
            restore_record.error_message = '; '.join(restore_service.errors[:10])  # Limit error messages
        else:
            restore_record.status = RestoreRecord.Status.COMPLETED
        restore_record.completed_at = timezone.now()
        restore_record.save()

        # Create notification
        try:
            from apps.multitenancy.models import TenantMembership
            from apps.multitenancy.constants import TenantUserRole

            admin_membership = TenantMembership.objects.filter(
                tenant=tenant, role__in=[TenantUserRole.OWNER, TenantUserRole.ADMIN]
            ).first()

            if admin_membership:
                total_created = sum(c.get('created', 0) for c in model_counts.values())
                total_updated = sum(c.get('updated', 0) for c in model_counts.values())
                total_skipped = sum(c.get('skipped', 0) for c in model_counts.values())

                Notification.objects.create(
                    user=admin_membership.user,
                    type='RESTORE_COMPLETED',
                    data={
                        'restore_id': str(restore_record.id),
                        'backup_id': str(backup_record.id),
                        'tenant_name': tenant.name,
                        'status': restore_record.status,
                        'total_created': total_created,
                        'total_updated': total_updated,
                        'total_skipped': total_skipped,
                        'total_failed': total_failed,
                    },
                )
        except Exception as e:
            logger.warning(f"Failed to create restore notification: {e}")

        logger.info(f"Restore completed for backup {backup_record_id}")
        return {
            "success": True,
            "restore_id": str(restore_record.id),
            "model_counts": model_counts,
        }

    except RestoreConflictError as e:
        logger.warning(f"Restore conflict for backup {backup_record_id}: {e}")
        restore_record.status = RestoreRecord.Status.FAILED
        restore_record.error_message = f"Conflict detected: {str(e)}"
        restore_record.completed_at = timezone.now()
        restore_record.save()
        return {"error": str(e), "success": False}

    except RestoreValidationError as e:
        logger.error(f"Restore validation error for backup {backup_record_id}: {e}")
        restore_record.status = RestoreRecord.Status.FAILED
        restore_record.error_message = f"Validation error: {str(e)}"
        restore_record.completed_at = timezone.now()
        restore_record.save()
        return {"error": str(e), "success": False}

    except Exception as exc:
        logger.exception(f"Restore failed for backup {backup_record_id}: {exc}")
        restore_record.status = RestoreRecord.Status.FAILED
        restore_record.error_message = str(exc)
        restore_record.completed_at = timezone.now()
        restore_record.save()

        # Create failure notification
        try:
            from apps.multitenancy.models import TenantMembership
            from apps.multitenancy.constants import TenantUserRole

            admin_membership = TenantMembership.objects.filter(
                tenant=tenant, role__in=[TenantUserRole.OWNER, TenantUserRole.ADMIN]
            ).first()

            if admin_membership:
                Notification.objects.create(
                    user=admin_membership.user,
                    type='RESTORE_FAILED',
                    data={
                        'restore_id': str(restore_record.id),
                        'backup_id': str(backup_record.id),
                        'tenant_name': tenant.name,
                        'error': str(exc),
                    },
                )
        except Exception as e:
            logger.warning(f"Failed to create restore failure notification: {e}")

        if self.request.retries < self.max_retries:
            raise self.retry(exc=exc)
        return {"error": str(exc), "success": False}


@shared_task(bind=True, max_retries=3, default_retry_delay=300, ignore_result=True)
def check_and_trigger_backups(self):
    """
    Periodic task to check all enabled backup configs and trigger backups.

    This task runs every hour (configured in CELERY_BEAT_SCHEDULE) and checks
    all enabled backup configs to see if backups are due based on their intervals.
    """
    from .scheduler import check_and_trigger_backups as scheduler_check

    try:
        return scheduler_check()
    except Exception as exc:
        logger.exception(f"Failed to check and trigger backups: {exc}")
        if self.request.retries < self.max_retries:
            raise self.retry(exc=exc)
        return {"error": str(exc)}
