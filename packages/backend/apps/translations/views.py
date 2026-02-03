"""
REST API views for translations.

Provides endpoints for:
- Getting translations JSON for a locale (public, cached)
- Syncing translation keys (admin/system only)
- Publishing translations (admin only)
- AI translation with browser polling (admin only)
"""

import logging

from django.http import JsonResponse
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
from django.utils import timezone
from django.db import transaction
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from common.acl import policies
from .models import Locale, AITranslationJob, TranslationKey, Translation
from .serializers import (
    LocaleSerializer,
    SyncTranslationsSerializer,
    PublishTranslationsSerializer,
    AITranslationJobSerializer,
    CreateAITranslationJobSerializer,
)
from .services import TranslationPublisher, TranslationSyncer, get_translations_for_locale
from .ai_service import AITranslationService, is_openai_configured

logger = logging.getLogger(__name__)


class AvailableLocalesView(generics.ListAPIView):
    """
    GET /api/translations/locales/

    Returns list of available locales.
    Public endpoint.
    """

    permission_classes = (policies.AnyoneFullAccess,)
    serializer_class = LocaleSerializer
    queryset = Locale.objects.filter(is_active=True)


class TranslationsJsonView(APIView):
    """
    GET /api/translations/{locale_code}.json

    Returns translations JSON for a specific locale.
    Public endpoint, cached.
    """

    permission_classes = (policies.AnyoneFullAccess,)

    @method_decorator(cache_page(60 * 5))  # Cache for 5 minutes
    def get(self, request, locale_code):
        translations = get_translations_for_locale(locale_code)

        if translations is None:
            return JsonResponse({"error": f"Locale '{locale_code}' not found"}, status=404)

        response = JsonResponse(translations)
        response["Cache-Control"] = "public, max-age=300"
        return response


class SyncTranslationsView(APIView):
    """
    POST /api/translations/sync/

    Sync translation keys from build process.
    Requires admin authentication or API key.
    """

    permission_classes = (policies.IsAdminUser,)

    def post(self, request):
        serializer = SyncTranslationsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        syncer = TranslationSyncer()
        stats = syncer.sync_from_json(serializer.validated_data["translations"])

        return Response(
            {
                "success": True,
                "stats": stats,
                "message": (
                    f"Sync complete: {stats['created']} created, "
                    f"{stats['updated']} updated, {stats['deprecated']} deprecated"
                ),
            }
        )


class PublishTranslationsView(APIView):
    """
    POST /api/translations/publish/

    Publish translations for a locale to S3/CDN.
    Requires admin authentication.
    """

    permission_classes = (policies.IsAdminUser,)

    def post(self, request):
        serializer = PublishTranslationsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        locale_code = serializer.validated_data["locale_code"]
        locale = Locale.objects.get(code=locale_code)

        publisher = TranslationPublisher()
        version = publisher.publish(locale, request.user)

        return Response(
            {
                "success": True,
                "version": version.version,
                "translation_count": version.translation_count,
                "message": f"Published {version.translation_count} translations for {locale.name}",
            }
        )


class TranslationStatusView(APIView):
    """
    GET /api/translations/status/

    Get translation sync status and progress.
    Requires admin authentication.
    """

    permission_classes = (policies.IsAdminUser,)

    def get(self, request):
        syncer = TranslationSyncer()
        status_data = syncer.get_sync_status()

        return Response(status_data)


class AITranslationJobListView(APIView):
    """
    GET /api/translations/ai-jobs/
    POST /api/translations/ai-jobs/

    List AI translation jobs or create a new one.
    Requires admin authentication.
    """

    permission_classes = (policies.IsAdminUser,)

    def get(self, request):
        jobs = AITranslationJob.objects.all().order_by("-created_at")[:20]
        serializer = AITranslationJobSerializer(jobs, many=True)
        return Response({"jobs": serializer.data, "openai_configured": is_openai_configured()})

    def post(self, request):
        if not is_openai_configured():
            return Response({"error": "OpenAI API key is not configured"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = CreateAITranslationJobSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        source_locale = Locale.objects.get(pk=serializer.validated_data["source_locale_id"])
        target_locale = Locale.objects.get(pk=serializer.validated_data["target_locale_id"])

        if source_locale == target_locale:
            return Response(
                {"error": "Source and target locales must be different"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Create the job
        job = AITranslationJob.objects.create(
            source_locale=source_locale,
            target_locale=target_locale,
            overwrite_existing=serializer.validated_data.get("overwrite_existing", False),
            auto_publish=serializer.validated_data.get("auto_publish", False),
            batch_size=serializer.validated_data.get("batch_size", 20),
            created_by=request.user,
        )

        return Response(AITranslationJobSerializer(job).data, status=status.HTTP_201_CREATED)


class AITranslationJobDetailView(APIView):
    """
    GET /api/translations/ai-jobs/{job_id}/
    DELETE /api/translations/ai-jobs/{job_id}/

    Get job details or cancel a job.
    Requires admin authentication.
    """

    permission_classes = (policies.IsAdminUser,)

    def get(self, request, job_id):
        try:
            job = AITranslationJob.objects.get(pk=job_id)
            return Response(AITranslationJobSerializer(job).data)
        except AITranslationJob.DoesNotExist:
            return Response({"error": "Job not found"}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, job_id):
        """Cancel a job."""
        try:
            job = AITranslationJob.objects.get(pk=job_id)
            if job.status in [AITranslationJob.Status.PENDING, AITranslationJob.Status.IN_PROGRESS]:
                job.status = AITranslationJob.Status.CANCELLED
                job.save()
                return Response({"status": "cancelled"})
            else:
                return Response(
                    {"error": f"Cannot cancel job in {job.status} status"}, status=status.HTTP_400_BAD_REQUEST
                )
        except AITranslationJob.DoesNotExist:
            return Response({"error": "Job not found"}, status=status.HTTP_404_NOT_FOUND)


class AITranslationProcessBatchView(APIView):
    """
    POST /api/translations/ai-jobs/{job_id}/process-batch/

    Process the next batch of translations for a job.
    This is designed for browser polling - each request processes one batch.

    Returns the job status and whether more batches remain.
    """

    permission_classes = (policies.IsAdminUser,)

    def post(self, request, job_id):
        try:
            job = AITranslationJob.objects.get(pk=job_id)
        except AITranslationJob.DoesNotExist:
            return Response({"error": "Job not found"}, status=status.HTTP_404_NOT_FOUND)

        # Check job status - only block if cancelled or completed
        if job.status == AITranslationJob.Status.CANCELLED:
            return Response({"job": AITranslationJobSerializer(job).data, "done": True, "message": "Job was cancelled"})

        if job.status == AITranslationJob.Status.COMPLETED:
            return Response(
                {"job": AITranslationJobSerializer(job).data, "done": True, "message": "Job already completed"}
            )

        # For failed jobs, allow resume by resetting status
        if job.status == AITranslationJob.Status.FAILED:
            job.status = AITranslationJob.Status.IN_PROGRESS
            job.error_message = ""
            job.save(update_fields=["status", "error_message"])

        # Initialize job if pending
        if job.status == AITranslationJob.Status.PENDING:
            job.status = AITranslationJob.Status.IN_PROGRESS
            job.started_at = timezone.now()

            # Count keys to translate
            keys_query = TranslationKey.objects.filter(is_deprecated=False)
            if not job.overwrite_existing:
                existing = Translation.objects.filter(locale=job.target_locale).values_list("key_id", flat=True)
                keys_query = keys_query.exclude(pk__in=existing)

            job.total_keys = keys_query.count()
            job.save()

            if job.total_keys == 0:
                job.status = AITranslationJob.Status.COMPLETED
                job.completed_at = timezone.now()
                job.save()
                return Response(
                    {"job": AITranslationJobSerializer(job).data, "done": True, "message": "No keys to translate"}
                )

        # Get keys that haven't been processed yet
        keys_query = TranslationKey.objects.filter(is_deprecated=False)
        if not job.overwrite_existing:
            existing = Translation.objects.filter(locale=job.target_locale).values_list("key_id", flat=True)
            keys_query = keys_query.exclude(pk__in=existing)

        # Skip already processed keys for this job (tracked by job.processed_keys)
        keys_list = list(keys_query.values("id", "key", "default_message", "description")[: job.batch_size])

        if not keys_list:
            # No more keys to process
            job.status = AITranslationJob.Status.COMPLETED
            job.completed_at = timezone.now()
            job.save()
            return Response(
                {"job": AITranslationJobSerializer(job).data, "done": True, "message": "Translation completed"}
            )

        # Get source translations if needed
        source_translations = {}
        if job.source_locale.code != "en":
            source_trans = Translation.objects.filter(
                locale=job.source_locale, key_id__in=[k["id"] for k in keys_list], status=Translation.Status.PUBLISHED
            ).select_related("key")
            source_translations = {t.key_id: t.value for t in source_trans}

        # Prepare batch for translation
        keys_with_text = []
        for key_data in keys_list:
            source_text = source_translations.get(key_data["id"], key_data["default_message"])
            keys_with_text.append(
                {
                    "key": key_data["key"],
                    "text": source_text,
                    "description": key_data.get("description", ""),
                    "_id": key_data["id"],
                }
            )

        # Translate batch
        try:
            service = AITranslationService()
            results = service.translate_batch(
                keys_with_text=keys_with_text,
                source_locale=job.source_locale.code,
                target_locale=job.target_locale.code,
            )

            batch_success = 0
            batch_failed = 0

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
                        batch_success += 1
                    else:
                        batch_failed += 1
                        failed_ids = job.failed_key_ids or []
                        failed_ids.append(key_id)
                        job.failed_key_ids = failed_ids

                    job.processed_keys += 1

                job.failed_keys += batch_failed
                job.save()

            # Check if more keys remain
            remaining = TranslationKey.objects.filter(is_deprecated=False)
            if not job.overwrite_existing:
                existing = Translation.objects.filter(locale=job.target_locale).values_list("key_id", flat=True)
                remaining = remaining.exclude(pk__in=existing)

            has_more = remaining.exists()

            if not has_more:
                job.status = AITranslationJob.Status.COMPLETED
                job.completed_at = timezone.now()
                job.save()

            return Response(
                {
                    "job": AITranslationJobSerializer(job).data,
                    "done": not has_more,
                    "batch_processed": len(results),
                    "batch_success": batch_success,
                    "batch_failed": batch_failed,
                    "message": f"Processed {len(results)} translations",
                }
            )

        except Exception as e:
            logger.exception(f"AI Translation batch failed for job {job_id}: {e}")
            job.status = AITranslationJob.Status.FAILED
            job.error_message = str(e)
            job.save()
            return Response(
                {"job": AITranslationJobSerializer(job).data, "done": True, "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
