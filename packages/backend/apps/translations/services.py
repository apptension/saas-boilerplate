"""
Translation publishing and syncing services.

Provides functionality for:
- Publishing translations to cloud storage (S3/R2/B2/MinIO)
- Syncing translation keys from the build process
- Version management and rollback

Storage is agnostic - uses the same STORAGE_BACKEND as the rest of the app.
"""

import json
import hashlib
import logging
import os
from datetime import datetime
from typing import Dict, Any, Optional

from django.db import transaction
from django.core.cache import cache
from django.core.files.base import ContentFile

from common.storages import get_translations_storage
from .models import Locale, Translation, TranslationKey, TranslationVersion
from .constants import TRANSLATIONS_CACHE_TTL

logger = logging.getLogger(__name__)


class TranslationPublisher:
    """
    Handles publishing translations to cloud storage.

    Uses Django's storage framework for agnostic cloud storage support.
    Automatically uses the same backend as STORAGE_BACKEND (s3, r2, b2, minio, local).

    Usage:
        publisher = TranslationPublisher()
        version = publisher.publish(locale, user)
    """

    def __init__(self):
        self._storage = None

    @property
    def storage(self):
        """Lazy-load the storage backend."""
        if self._storage is None:
            self._storage = get_translations_storage()
        return self._storage

    @property
    def is_cloud_storage(self):
        """Check if using cloud storage (not local filesystem)."""
        backend = os.environ.get('STORAGE_BACKEND', 's3')
        return backend != 'local'

    def generate_translation_bundle(self, locale: Locale) -> Dict[str, str]:
        """
        Generate translation JSON for a locale.
        Falls back to default message for missing translations.

        Args:
            locale: The locale to generate translations for

        Returns:
            Dictionary of key -> translated value
        """
        translations = {}

        # Get all active translation keys
        keys = TranslationKey.objects.filter(is_deprecated=False)

        # Get published translations for this locale
        locale_translations = {
            t.key_id: t.value
            for t in Translation.objects.filter(locale=locale, status=Translation.Status.PUBLISHED).select_related(
                'key'
            )
        }

        for key in keys:
            # Use translated value or fall back to default message
            translations[key.key] = locale_translations.get(key.id, key.default_message)

        return translations

    def generate_version_hash(self, translations: Dict[str, str]) -> str:
        """
        Generate a version hash based on content.

        Args:
            translations: The translation dictionary

        Returns:
            12-character hash string
        """
        content = json.dumps(translations, sort_keys=True)
        return hashlib.sha256(content.encode()).hexdigest()[:12]

    @transaction.atomic
    def publish(self, locale: Locale, user) -> TranslationVersion:
        """
        Publish translations for a locale to cloud storage.

        Uses Django's storage framework - automatically works with S3, R2, B2, MinIO, or local.

        Args:
            locale: The locale to publish
            user: The user performing the publish

        Returns:
            The created TranslationVersion instance
        """
        translations = self.generate_translation_bundle(locale)
        version_hash = self.generate_version_hash(translations)
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        version_string = f"v{timestamp}-{version_hash}"

        # Storage paths (relative to storage location which is already 'translations/')
        versioned_path = f"{locale.code}/{version_string}.json"
        current_path = f"{locale.code}.json"

        backend = os.environ.get('STORAGE_BACKEND', 's3')
        logger.info(f"Publishing translations for {locale.code} using {backend} storage backend")

        # Upload versioned file (for history/rollback)
        self._upload_json(versioned_path, translations)
        logger.info(f"  Uploaded versioned file: {versioned_path}")

        # Upload current file (served to clients)
        self._upload_json(current_path, translations)
        logger.info(f"  Uploaded current file: {current_path}")

        logger.info(f"Published {len(translations)} translations for {locale.code}")

        # Create version record (store path for potential rollback)
        version = TranslationVersion.objects.create(
            locale=locale,
            version=version_string,
            s3_key=versioned_path,  # Storage path (relative to translations/ location)
            published_by=user,
            translation_count=len(translations),
            content_hash=version_hash,
        )

        # Activate this version
        self.activate_version(version)

        # Clear local cache
        self._clear_cache(locale)

        return version

    def activate_version(self, version: TranslationVersion):
        """
        Activate a specific version as current.

        Args:
            version: The version to activate
        """
        # Deactivate all other versions for this locale
        TranslationVersion.objects.filter(locale=version.locale).update(is_active=False)

        version.is_active = True
        version.save(update_fields=['is_active'])

        logger.info(f"Activated version {version.version} for {version.locale.code}")

    def rollback_to(self, version: TranslationVersion):
        """
        Rollback to a previous version by copying the versioned file to current.

        Args:
            version: The version to rollback to
        """
        # Read the versioned file content
        try:
            versioned_content = self.storage.open(version.s3_key, 'r').read()
            translations = json.loads(versioned_content)
        except Exception as e:
            logger.error(f"Failed to read versioned file {version.s3_key}: {e}")
            raise

        # Upload as current
        current_path = f"{version.locale.code}.json"
        self._upload_json(current_path, translations)

        self.activate_version(version)
        self._clear_cache(version.locale)

        logger.info(f"Rolled back {version.locale.code} to version {version.version}")

    def _upload_json(self, path: str, data: Dict[str, Any]):
        """Upload JSON to storage."""
        content = json.dumps(data, ensure_ascii=False, indent=2)

        # Delete existing file if it exists (for overwrite)
        if self.storage.exists(path):
            self.storage.delete(path)

        # Save new content
        self.storage.save(path, ContentFile(content.encode('utf-8')))

    def _clear_cache(self, locale: Locale):
        """Clear local cache for a locale."""
        cache_key = f"translations_{locale.code}"
        cache.delete(cache_key)


class TranslationSyncer:
    """
    Syncs translation keys from build output to database.

    Usage:
        syncer = TranslationSyncer()
        stats = syncer.sync_from_json(master_data)
    """

    @transaction.atomic
    def sync_from_json(self, master_json: Dict[str, Any]) -> Dict[str, int]:
        """
        Sync translation keys from extracted master JSON.

        The master JSON format (from formatjs extract):

        ```json
        {
            "key_id": {
                "defaultMessage": "The default text",
                "description": "Optional description"
            }
        }
        ```

        Args:
            master_json: Dictionary of translation keys from formatjs extract

        Returns:
            Stats dictionary with keys: created, updated, deprecated
        """
        stats = {'created': 0, 'updated': 0, 'deprecated': 0, 'unchanged': 0}
        seen_keys = set()

        for key, data in master_json.items():
            seen_keys.add(key)

            # Handle both formats:
            # Simple: { "key": { "defaultMessage": "text" } }
            # Or direct: { "key": "text" } (for simple extracted format)
            if isinstance(data, dict):
                default_message = data.get('defaultMessage', '')
                description = data.get('description', '')
            else:
                default_message = str(data)
                description = ''

            # Get existing object to check if it will be updated
            existing_obj = TranslationKey.objects.filter(key=key).first()
            was_deprecated = existing_obj.is_deprecated if existing_obj else False
            old_default_message = existing_obj.default_message if existing_obj else None
            old_description = existing_obj.description if existing_obj else None

            obj, created = TranslationKey.objects.update_or_create(
                key=key,
                defaults={'default_message': default_message, 'description': description, 'is_deprecated': False},
            )

            if created:
                stats['created'] += 1
                logger.debug(f"Created translation key: {key}")
            # Check if actually updated by comparing old values
            elif old_default_message != default_message or old_description != description or was_deprecated:
                stats['updated'] += 1
                logger.debug(f"Updated translation key: {key}")
            else:
                stats['unchanged'] += 1

        # Mark unseen keys as deprecated (don't delete to preserve translations)
        deprecated_count = (
            TranslationKey.objects.filter(is_deprecated=False).exclude(key__in=seen_keys).update(is_deprecated=True)
        )
        stats['deprecated'] = deprecated_count

        logger.info(
            f"Translation sync complete: {stats['created']} created, "
            f"{stats['updated']} updated, {stats['deprecated']} deprecated"
        )

        return stats

    def get_sync_status(self) -> Dict[str, Any]:
        """
        Get current sync status and statistics.

        Returns:
            Dictionary with sync statistics
        """
        total_keys = TranslationKey.objects.count()
        active_keys = TranslationKey.objects.filter(is_deprecated=False).count()
        deprecated_keys = total_keys - active_keys

        locales = []
        for locale in Locale.objects.filter(is_active=True):
            published_count = Translation.objects.filter(
                locale=locale, status=Translation.Status.PUBLISHED, key__is_deprecated=False
            ).count()

            locales.append(
                {
                    'code': locale.code,
                    'name': locale.name,
                    'published_translations': published_count,
                    'progress': round((published_count / active_keys * 100) if active_keys else 100, 1),
                }
            )

        return {
            'total_keys': total_keys,
            'active_keys': active_keys,
            'deprecated_keys': deprecated_keys,
            'locales': locales,
        }


def get_translations_for_locale(locale_code: str) -> Optional[Dict[str, str]]:
    """
    Get translations for a locale, using cache when available.

    Args:
        locale_code: The locale code (e.g., 'en', 'pl')

    Returns:
        Dictionary of translations or None if locale not found
    """
    cache_key = f"translations_{locale_code}"

    # Try cache first
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    try:
        locale = Locale.objects.get(code=locale_code, is_active=True)
    except Locale.DoesNotExist:
        return None

    publisher = TranslationPublisher()
    translations = publisher.generate_translation_bundle(locale)

    # Cache for configured TTL
    cache.set(cache_key, translations, TRANSLATIONS_CACHE_TTL)

    return translations
