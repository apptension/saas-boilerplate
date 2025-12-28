"""
Translation management models.

This module provides models for managing dynamic translations that can be
updated through the admin panel without requiring code changes or redeployment.
"""

from django.db import models
from django.conf import settings
from django.core.validators import RegexValidator


class TranslationKey(models.Model):
    """
    Represents a unique translation key extracted from the codebase.
    Keys are automatically synced during the build process using formatjs extract.
    """
    
    key = models.CharField(
        max_length=512,
        unique=True,
        db_index=True,
        help_text="The unique message ID from the codebase (e.g., 'Home / dashboard link')"
    )
    default_message = models.TextField(
        help_text="The English default message from the code"
    )
    description = models.TextField(
        blank=True,
        help_text="Context or description to help translators understand the message"
    )
    
    # Source tracking
    source_file = models.CharField(
        max_length=512,
        blank=True,
        help_text="File where this key was found (for reference)"
    )
    
    # Lifecycle management
    is_deprecated = models.BooleanField(
        default=False,
        db_index=True,
        help_text="Whether this key is no longer in use in the codebase"
    )
    
    # Timestamps
    first_seen_at = models.DateTimeField(auto_now_add=True)
    last_seen_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['key']
        verbose_name = 'Translation Key'
        verbose_name_plural = 'Translation Keys'
        indexes = [
            models.Index(fields=['is_deprecated', 'key']),
        ]

    def __str__(self):
        return self.key

    @property
    def translation_count(self):
        """Returns the count of translations for this key."""
        return self.translations.filter(status=Translation.Status.PUBLISHED).count()


class Locale(models.Model):
    """
    Represents a supported locale/language for the application.
    """
    
    code_validator = RegexValidator(
        regex=r'^[a-z]{2}(-[A-Z]{2})?$',
        message="Locale code must be in format 'xx' or 'xx-XX' (e.g., 'en', 'en-US', 'pl')"
    )
    
    code = models.CharField(
        max_length=10,
        unique=True,
        validators=[code_validator],
        help_text="Locale code (e.g., 'en', 'pl', 'de', 'en-US')"
    )
    name = models.CharField(
        max_length=100,
        help_text="Language name in English (e.g., 'English', 'Polish')"
    )
    native_name = models.CharField(
        max_length=100,
        help_text="Language name in native language (e.g., 'English', 'Polski')"
    )
    is_default = models.BooleanField(
        default=False,
        help_text="Whether this is the default/fallback locale"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this locale is available to users"
    )
    rtl = models.BooleanField(
        default=False,
        help_text="Right-to-left language (e.g., Arabic, Hebrew)"
    )
    
    # Ordering for language selector
    sort_order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['-is_default', 'sort_order', 'name']
        verbose_name = 'Locale'
        verbose_name_plural = 'Locales'

    def __str__(self):
        return f"{self.name} ({self.code})"

    def save(self, *args, **kwargs):
        # Ensure only one default locale
        if self.is_default:
            Locale.objects.filter(is_default=True).exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)

    @property
    def translation_progress(self):
        """Returns the translation progress as a percentage."""
        total_keys = TranslationKey.objects.filter(is_deprecated=False).count()
        if total_keys == 0:
            return 100
        translated = Translation.objects.filter(
            locale=self,
            status=Translation.Status.PUBLISHED,
            key__is_deprecated=False
        ).count()
        return round((translated / total_keys) * 100, 1)


class Translation(models.Model):
    """
    Represents a translation of a key in a specific locale.
    """
    
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        REVIEW = 'review', 'Needs Review'
        APPROVED = 'approved', 'Approved'
        PUBLISHED = 'published', 'Published'
    
    key = models.ForeignKey(
        TranslationKey,
        on_delete=models.CASCADE,
        related_name='translations'
    )
    locale = models.ForeignKey(
        Locale,
        on_delete=models.CASCADE,
        related_name='translations'
    )
    value = models.TextField(
        help_text="The translated text"
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
        db_index=True
    )
    
    # Audit fields
    translated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='translations_created'
    )
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='translations_reviewed'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['key', 'locale']
        ordering = ['key__key', 'locale__code']
        verbose_name = 'Translation'
        verbose_name_plural = 'Translations'
        indexes = [
            models.Index(fields=['locale', 'status']),
        ]

    def __str__(self):
        return f"{self.key.key} [{self.locale.code}]"


class TranslationVersion(models.Model):
    """
    Represents a published version of translations for a locale.
    Enables version history and rollback functionality.
    """
    
    locale = models.ForeignKey(
        Locale,
        on_delete=models.CASCADE,
        related_name='versions'
    )
    version = models.CharField(
        max_length=50,
        help_text="Version identifier (e.g., 'v20231215120000-abc123')"
    )
    s3_key = models.CharField(
        max_length=512,
        help_text="S3 object key for the versioned JSON file"
    )
    
    # Stats
    translation_count = models.PositiveIntegerField(default=0)
    
    # State
    is_active = models.BooleanField(
        default=False,
        help_text="Whether this is the currently active version"
    )
    
    # Audit
    published_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        on_delete=models.SET_NULL
    )
    published_at = models.DateTimeField(auto_now_add=True)
    
    # Store a snapshot of the translations for quick rollback
    content_hash = models.CharField(max_length=64, blank=True)
    
    class Meta:
        ordering = ['-published_at']
        unique_together = ['locale', 'version']
        verbose_name = 'Translation Version'
        verbose_name_plural = 'Translation Versions'

    def __str__(self):
        status = "(active)" if self.is_active else ""
        return f"{self.locale.code} - {self.version} {status}"


class AITranslationJob(models.Model):
    """
    Tracks async AI translation jobs for batch processing.
    """
    
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        IN_PROGRESS = 'in_progress', 'In Progress'
        COMPLETED = 'completed', 'Completed'
        FAILED = 'failed', 'Failed'
        CANCELLED = 'cancelled', 'Cancelled'
    
    # Source and target
    source_locale = models.ForeignKey(
        Locale,
        on_delete=models.CASCADE,
        related_name='ai_jobs_as_source',
        help_text="Source locale to translate from"
    )
    target_locale = models.ForeignKey(
        Locale,
        on_delete=models.CASCADE,
        related_name='ai_jobs_as_target',
        help_text="Target locale to translate to"
    )
    
    # Job status
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True
    )
    
    # Progress tracking
    total_keys = models.PositiveIntegerField(default=0)
    processed_keys = models.PositiveIntegerField(default=0)
    failed_keys = models.PositiveIntegerField(default=0)
    skipped_keys = models.PositiveIntegerField(
        default=0,
        help_text="Keys skipped (already translated)"
    )
    
    # Configuration
    overwrite_existing = models.BooleanField(
        default=False,
        help_text="Whether to overwrite existing translations"
    )
    auto_publish = models.BooleanField(
        default=False,
        help_text="Automatically set status to Published after translation"
    )
    batch_size = models.PositiveIntegerField(
        default=20,
        help_text="Number of keys to translate in each batch"
    )
    
    # Error tracking
    error_message = models.TextField(blank=True)
    failed_key_ids = models.JSONField(
        default=list,
        blank=True,
        help_text="List of key IDs that failed to translate"
    )
    
    # Celery task tracking
    celery_task_id = models.CharField(max_length=255, blank=True)
    
    # Audit
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        on_delete=models.SET_NULL,
        related_name='ai_translation_jobs'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'AI Translation Job'
        verbose_name_plural = 'AI Translation Jobs'

    def __str__(self):
        return f"AI Job: {self.source_locale.code} → {self.target_locale.code} ({self.status})"

    @property
    def progress_percent(self):
        """Returns progress as percentage."""
        # If job is completed, show 100% regardless of counts
        if self.status == self.Status.COMPLETED:
            return 100
        # If no keys to process, show 100% (nothing to do = done)
        if self.total_keys == 0:
            return 100 if self.status in [self.Status.COMPLETED, self.Status.CANCELLED] else 0
        return round((self.processed_keys / self.total_keys) * 100, 1)

    @property
    def successful_translations(self):
        """Returns count of successful translations."""
        return self.processed_keys - self.failed_keys

