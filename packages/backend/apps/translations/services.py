"""
Translation publishing and syncing services.

Provides functionality for:
- Publishing translations to S3/CDN
- Syncing translation keys from the build process
- Version management and rollback
"""

import json
import hashlib
import logging
from datetime import datetime
from typing import Dict, Any, Optional

from django.conf import settings
from django.db import transaction
from django.core.cache import cache

from .models import Locale, Translation, TranslationKey, TranslationVersion
from .constants import TRANSLATIONS_S3_PREFIX, TRANSLATIONS_CACHE_TTL

logger = logging.getLogger(__name__)


def get_s3_client():
    """Get boto3 S3 client with proper configuration."""
    import boto3

    return boto3.client(
        's3',
        endpoint_url=getattr(settings, 'AWS_ENDPOINT_URL', None),
        region_name=getattr(settings, 'AWS_REGION', None),
    )


def get_cloudfront_client():
    """Get boto3 CloudFront client."""
    import boto3

    return boto3.client('cloudfront', region_name=getattr(settings, 'AWS_REGION', None))


class TranslationPublisher:
    """
    Handles publishing translations to S3 and CDN cache invalidation.

    Usage:
        publisher = TranslationPublisher()
        version = publisher.publish(locale, user)
    """

    def __init__(self):
        self.bucket_name = getattr(settings, 'TRANSLATIONS_BUCKET_NAME', None)
        self.cloudfront_distribution_id = getattr(settings, 'TRANSLATIONS_CLOUDFRONT_ID', None)
        self._s3_client = None
        self._cloudfront_client = None

    @property
    def s3_client(self):
        if self._s3_client is None:
            self._s3_client = get_s3_client()
        return self._s3_client

    @property
    def cloudfront_client(self):
        if self._cloudfront_client is None:
            self._cloudfront_client = get_cloudfront_client()
        return self._cloudfront_client

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
        Publish translations for a locale to S3.

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

        # S3 keys
        versioned_key = f"{TRANSLATIONS_S3_PREFIX}/{locale.code}/{version_string}.json"
        current_key = f"{TRANSLATIONS_S3_PREFIX}/{locale.code}.json"

        if self.bucket_name:
            # Upload versioned file (for history/rollback)
            self._upload_json(versioned_key, translations)

            # Upload current file (served to clients)
            self._upload_json(current_key, translations)

            logger.info(f"Published translations for {locale.code} to S3: {versioned_key}")
        else:
            logger.warning("TRANSLATIONS_BUCKET_NAME not configured, skipping S3 upload")

        # Create version record
        version = TranslationVersion.objects.create(
            locale=locale,
            version=version_string,
            s3_key=versioned_key,
            published_by=user,
            translation_count=len(translations),
            content_hash=version_hash,
        )

        # Activate this version
        self.activate_version(version)

        # Invalidate CDN cache
        if self.bucket_name:
            self._invalidate_cache(current_key)

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
        Rollback to a previous version.

        Args:
            version: The version to rollback to
        """
        if not self.bucket_name:
            logger.warning("TRANSLATIONS_BUCKET_NAME not configured, skipping S3 rollback")
            self.activate_version(version)
            return

        # Copy versioned file to current
        current_key = f"{TRANSLATIONS_S3_PREFIX}/{version.locale.code}.json"

        self.s3_client.copy_object(
            Bucket=self.bucket_name,
            CopySource={'Bucket': self.bucket_name, 'Key': version.s3_key},
            Key=current_key,
            ContentType='application/json',
            MetadataDirective='REPLACE',
            CacheControl='public, max-age=3600',
        )

        self.activate_version(version)
        self._invalidate_cache(current_key)
        self._clear_cache(version.locale)

        logger.info(f"Rolled back {version.locale.code} to version {version.version}")

    def _upload_json(self, key: str, data: Dict[str, Any]):
        """Upload JSON to S3."""
        self.s3_client.put_object(
            Bucket=self.bucket_name,
            Key=key,
            Body=json.dumps(data, ensure_ascii=False, indent=2),
            ContentType='application/json',
            CacheControl='public, max-age=3600',
        )

    def _invalidate_cache(self, key: str):
        """Invalidate CloudFront cache for a specific path."""
        if not self.cloudfront_distribution_id:
            logger.debug("CloudFront distribution ID not configured, skipping invalidation")
            return

        try:
            self.cloudfront_client.create_invalidation(
                DistributionId=self.cloudfront_distribution_id,
                InvalidationBatch={
                    'Paths': {'Quantity': 1, 'Items': [f'/{key}']},
                    'CallerReference': str(datetime.now().timestamp()),
                },
            )
            logger.info(f"Created CloudFront invalidation for /{key}")
        except Exception as e:
            logger.error(f"Failed to invalidate CloudFront cache: {e}")

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
