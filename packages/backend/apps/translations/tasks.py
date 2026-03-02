"""
Celery tasks for async translation operations.

Handles batch AI translation processing with progress tracking.
"""

import logging

from celery import shared_task
from django.db import transaction
from django.utils import timezone

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def process_ai_translation_job(self, job_id: int):
    """
    Process an AI translation job in batches.

    This task:
    1. Loads the job configuration
    2. Fetches untranslated keys in batches
    3. Translates each batch using OpenAI
    4. Saves translations to the database
    5. Updates progress after each batch

    Args:
        job_id: ID of the AITranslationJob to process
    """
    from .models import AITranslationJob, TranslationKey, Translation
    from .ai_service import AITranslationService, is_openai_configured

    # Load the job
    try:
        job = AITranslationJob.objects.get(pk=job_id)
    except AITranslationJob.DoesNotExist:
        logger.error(f"AI Translation job {job_id} not found")
        return {"error": "Job not found"}

    # Check if already processed
    if job.status in [AITranslationJob.Status.COMPLETED, AITranslationJob.Status.CANCELLED]:
        logger.info(f"Job {job_id} already {job.status}, skipping")
        return {"status": job.status}

    # Check OpenAI configuration
    if not is_openai_configured():
        job.status = AITranslationJob.Status.FAILED
        job.error_message = "OpenAI API key is not configured"
        job.save()
        return {"error": job.error_message}

    # Mark as in progress
    job.status = AITranslationJob.Status.IN_PROGRESS
    job.started_at = timezone.now()
    job.celery_task_id = self.request.id or ""
    job.save()

    try:
        # Get keys to translate
        keys_query = TranslationKey.objects.filter(is_deprecated=False)

        # If not overwriting, exclude keys that already have translations
        if not job.overwrite_existing:
            existing_translation_keys = Translation.objects.filter(locale=job.target_locale).values_list(
                "key_id", flat=True
            )
            keys_query = keys_query.exclude(pk__in=existing_translation_keys)

        all_keys = list(keys_query.values("id", "key", "default_message", "description"))
        job.total_keys = len(all_keys)
        job.save(update_fields=["total_keys"])

        if not all_keys:
            job.status = AITranslationJob.Status.COMPLETED
            job.completed_at = timezone.now()
            job.save()
            logger.info(f"Job {job_id}: No keys to translate")
            return {"status": "completed", "message": "No keys to translate"}

        # Get source translations
        source_translations = {}
        if job.source_locale.code != "en":
            # Get existing translations from source locale
            source_trans = Translation.objects.filter(
                locale=job.source_locale, status=Translation.Status.PUBLISHED
            ).select_related("key")
            source_translations = {t.key_id: t.value for t in source_trans}

        # Initialize service
        service = AITranslationService()

        # Process in batches
        batch_size = job.batch_size
        failed_key_ids = []

        for i in range(0, len(all_keys), batch_size):
            batch = all_keys[i : i + batch_size]

            # Check if job was cancelled
            job.refresh_from_db()
            if job.status == AITranslationJob.Status.CANCELLED:
                logger.info(f"Job {job_id} was cancelled, stopping")
                return {"status": "cancelled"}

            # Prepare batch for translation
            keys_with_text = []
            for key_data in batch:
                # Get source text: from source translations or default message
                if key_data["id"] in source_translations:
                    source_text = source_translations[key_data["id"]]
                else:
                    source_text = key_data["default_message"]

                keys_with_text.append(
                    {
                        "key": key_data["key"],
                        "text": source_text,
                        "description": key_data.get("description", ""),
                        "_id": key_data["id"],  # For internal tracking
                    }
                )

            # Translate batch
            try:
                results = service.translate_batch(
                    keys_with_text=keys_with_text,
                    source_locale=job.source_locale.code,
                    target_locale=job.target_locale.code,
                )

                # Save translations
                with transaction.atomic():
                    for idx, result in enumerate(results):
                        key_id = keys_with_text[idx]["_id"]

                        if result.success and result.translated_text:
                            Translation.objects.update_or_create(
                                key_id=key_id,
                                locale=job.target_locale,
                                defaults={
                                    "value": result.translated_text,
                                    "status": (
                                        Translation.Status.PUBLISHED if job.auto_publish else Translation.Status.DRAFT
                                    ),
                                    "translated_by": job.created_by,
                                },
                            )
                        else:
                            job.failed_keys += 1
                            failed_key_ids.append(key_id)
                            logger.warning(f"Failed to translate key {result.key}: {result.error}")

                        job.processed_keys += 1

            except Exception as e:
                logger.error(f"Batch translation failed: {e}")
                # Mark all keys in batch as failed
                for key_data in batch:
                    job.failed_keys += 1
                    job.processed_keys += 1
                    failed_key_ids.append(key_data["id"])

            # Update progress
            job.failed_key_ids = failed_key_ids
            job.save(update_fields=["processed_keys", "failed_keys", "failed_key_ids"])

            logger.info(
                f"Job {job_id}: Processed {job.processed_keys}/{job.total_keys} keys ({job.failed_keys} failed)"
            )

        # Mark as completed
        job.status = AITranslationJob.Status.COMPLETED
        job.completed_at = timezone.now()
        job.save()

        logger.info(f"Job {job_id} completed: {job.successful_translations} translations, {job.failed_keys} failures")

        return {
            "status": "completed",
            "total": job.total_keys,
            "successful": job.successful_translations,
            "failed": job.failed_keys,
        }

    except Exception as e:
        logger.exception(f"AI Translation job {job_id} failed: {e}")
        job.status = AITranslationJob.Status.FAILED
        job.error_message = str(e)
        job.completed_at = timezone.now()
        job.save()

        # Retry on transient errors
        if self.request.retries < self.max_retries:
            raise self.retry(exc=e)

        return {"error": str(e)}


@shared_task
def translate_single_key_async(key_id: int, source_locale_code: str, target_locale_code: str, user_id: int = None):
    """
    Translate a single key asynchronously.

    Useful for on-demand translation of individual keys.
    """
    from .models import TranslationKey, Translation, Locale
    from .ai_service import AITranslationService, is_openai_configured
    from django.contrib.auth import get_user_model

    User = get_user_model()

    if not is_openai_configured():
        return {"error": "OpenAI not configured"}

    try:
        key = TranslationKey.objects.get(pk=key_id)
        source_locale = Locale.objects.get(code=source_locale_code)
        target_locale = Locale.objects.get(code=target_locale_code)
        user = User.objects.get(pk=user_id) if user_id else None
    except (TranslationKey.DoesNotExist, Locale.DoesNotExist, User.DoesNotExist) as e:
        return {"error": str(e)}

    # Get source text
    source_text = key.default_message
    if source_locale.code != "en":
        try:
            source_trans = Translation.objects.get(key=key, locale=source_locale, status=Translation.Status.PUBLISHED)
            source_text = source_trans.value
        except Translation.DoesNotExist:
            pass

    # Translate
    service = AITranslationService()
    result = service.translate_single(
        key=key.key,
        text=source_text,
        source_locale=source_locale.code,
        target_locale=target_locale.code,
        description=key.description,
    )

    if result.success:
        Translation.objects.update_or_create(
            key=key,
            locale=target_locale,
            defaults={"value": result.translated_text, "status": Translation.Status.DRAFT, "translated_by": user},
        )
        return {"success": True, "key": key.key, "translation": result.translated_text}
    else:
        return {"success": False, "key": key.key, "error": result.error}
