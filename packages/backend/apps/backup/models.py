"""
Models for backup configuration, records, and restore tracking.
"""

import hashid_field
from django.core.validators import MinValueValidator
from django.db import models

from common.models import TimestampedMixin, TenantDependentModelMixin


class BackupConfig(TimestampedMixin, TenantDependentModelMixin):
    """
    Configuration for periodic backups of tenant data.
    One configuration per tenant.
    """

    id = hashid_field.HashidAutoField(primary_key=True)

    enabled = models.BooleanField(
        default=False,
        help_text="Whether periodic backups are enabled for this tenant",
    )

    backup_interval_hours = models.PositiveIntegerField(
        default=24,
        validators=[MinValueValidator(1)],
        help_text="Interval between backups in hours (minimum 1 hour)",
    )

    retention_days = models.PositiveIntegerField(
        default=30,
        validators=[MinValueValidator(1)],
        help_text="Number of days to retain backup files (minimum 1 day)",
    )

    email_recipients = models.JSONField(
        default=list,
        help_text="List of user IDs to receive email notifications when backups are ready",
    )

    selected_modules = models.JSONField(
        default=list,
        help_text="List of module IDs to include in backups (e.g., ['financial_data', 'user_management'])",
    )

    selected_models = models.JSONField(
        default=list,
        help_text=(
            "Optional: Specific models to include (format: 'app_label.ModelName'). "
            "If empty, all models in selected_modules are included."
        ),
    )

    excluded_models = models.JSONField(
        default=list,
        help_text="Optional: Specific models to exclude from backup (format: 'app_label.ModelName')",
    )

    class Meta:
        verbose_name = "Backup Configuration"
        verbose_name_plural = "Backup Configurations"
        constraints = [models.UniqueConstraint(fields=['tenant'], name='unique_backup_config_per_tenant')]

    def __str__(self):
        status = "enabled" if self.enabled else "disabled"
        return f"Backup config for {self.tenant.name} ({status})"


class BackupRecord(TimestampedMixin, TenantDependentModelMixin):
    """
    Record of a backup execution for tenant data.
    """

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        PROCESSING = "PROCESSING", "Processing"
        COMPLETED = "COMPLETED", "Completed"
        FAILED = "FAILED", "Failed"

    id = hashid_field.HashidAutoField(primary_key=True)

    backup_config = models.ForeignKey(
        BackupConfig,
        on_delete=models.CASCADE,
        related_name='backup_records',
        null=True,
        blank=True,
        help_text="The backup configuration that triggered this backup",
    )

    file_path = models.CharField(
        max_length=500,
        blank=True,
        help_text="Storage path to the backup file",
    )

    file_size = models.PositiveBigIntegerField(
        null=True,
        blank=True,
        help_text="Size of the backup file in bytes",
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        help_text="Current status of the backup",
    )

    error_message = models.TextField(
        blank=True,
        help_text="Error message if backup failed",
    )

    model_counts = models.JSONField(
        default=dict,
        help_text="Count of records per model type in this backup",
    )

    is_encrypted = models.BooleanField(
        default=True,
        help_text="Whether this backup file is encrypted at rest",
    )

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Backup Record"
        verbose_name_plural = "Backup Records"

    def __str__(self):
        return f"Backup {self.id} for {self.tenant.name} ({self.status})"

    def get_download_url(self, expiration=86400):
        """
        Generate a presigned download URL for the backup file.

        Uses the exports storage backend which properly handles signed URLs
        with SigV4 for Cloudflare R2 and other S3-compatible services.

        Args:
            expiration: URL expiration time in seconds (default: 24 hours)

        Returns:
            Signed URL string or None if file_path is not set
        """
        if not self.file_path:
            return None

        from common.storages import get_exports_storage

        try:
            # Uses exports-specific storage backend with proper SigV4 signing for R2
            storage = get_exports_storage()
            return storage.url(self.file_path)
        except Exception:
            return None


class RestoreRecord(TimestampedMixin, TenantDependentModelMixin):
    """
    Record of a backup restoration attempt for tenant data.
    """

    _backup_excluded = True  # Exclude from backup to avoid circular references

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        PROCESSING = "PROCESSING", "Processing"
        COMPLETED = "COMPLETED", "Completed"
        PARTIALLY_COMPLETED = "PARTIALLY_COMPLETED", "Partially Completed"
        FAILED = "FAILED", "Failed"

    class ConflictStrategy(models.TextChoices):
        SKIP = "SKIP", "Skip existing records"
        UPDATE = "UPDATE", "Update existing records"
        FAIL = "FAIL", "Fail on conflicts"

    id = hashid_field.HashidAutoField(primary_key=True)

    backup_record = models.ForeignKey(
        BackupRecord,
        on_delete=models.CASCADE,
        related_name='restore_records',
        help_text="The backup record that was restored",
    )

    status = models.CharField(
        max_length=30,
        choices=Status.choices,
        default=Status.PENDING,
        help_text="Current status of the restoration",
    )

    conflict_strategy = models.CharField(
        max_length=20,
        choices=ConflictStrategy.choices,
        help_text="Strategy used for handling conflicting records during restore",
    )

    model_counts = models.JSONField(
        default=dict,
        help_text="Detailed counts per model: {ModelName: {created: N, updated: N, skipped: N, failed: N}}",
    )

    error_message = models.TextField(
        blank=True,
        help_text="Error message if restoration failed",
    )

    started_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the restoration started processing",
    )

    completed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the restoration completed or failed",
    )

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Restore Record"
        verbose_name_plural = "Restore Records"

    def __str__(self):
        return f"Restore {self.id} from backup {self.backup_record_id} ({self.status})"

    @property
    def total_created(self):
        """Total number of records created across all models."""
        return sum(counts.get('created', 0) for counts in self.model_counts.values())

    @property
    def total_updated(self):
        """Total number of records updated across all models."""
        return sum(counts.get('updated', 0) for counts in self.model_counts.values())

    @property
    def total_skipped(self):
        """Total number of records skipped across all models."""
        return sum(counts.get('skipped', 0) for counts in self.model_counts.values())

    @property
    def total_failed(self):
        """Total number of records that failed across all models."""
        return sum(counts.get('failed', 0) for counts in self.model_counts.values())


class BackupTenantEncryptionKey(models.Model):
    """
    Per-tenant backup encryption key when using DB fallback (no AWS Secrets Manager).

    The key is stored encrypted with BACKUP_MASTER_KEY (Fernet). One row per tenant.
    """

    tenant = models.OneToOneField(
        'multitenancy.Tenant',
        on_delete=models.CASCADE,
        related_name='backup_encryption_key',
        primary_key=True,
        help_text="Tenant this encryption key belongs to",
    )
    encrypted_key = models.TextField(
        help_text="Fernet-encrypted 32-byte AES key (base64). Encrypted with BACKUP_MASTER_KEY.",
    )
    updated_at = models.DateTimeField(auto_now=True, help_text="When the key was last created or rotated")

    class Meta:
        verbose_name = "Backup tenant encryption key"
        verbose_name_plural = "Backup tenant encryption keys"

    def __str__(self):
        return f"Backup key for tenant {self.pk}"
