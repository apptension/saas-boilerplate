"""
Tests for translation Celery tasks.
"""

import pytest
from unittest.mock import patch

from apps.translations.tasks import process_ai_translation_job, translate_single_key_async
from apps.translations.models import AITranslationJob, TranslationKey, Translation, Locale

from .factories import EnglishLocaleFactory, LocaleFactory


@pytest.mark.django_db
class TestProcessAiTranslationJob:
    """Tests for process_ai_translation_job task."""

    def test_returns_error_when_job_not_found(self):
        result = process_ai_translation_job.run(99999)
        assert "error" in result
        assert "not found" in result["error"].lower()

    def test_skips_completed_job(self, english_locale, user_factory):
        polish_locale = LocaleFactory(code="pl", name="Polish", native_name="Polski")
        user = user_factory()
        job = AITranslationJob.objects.create(
            source_locale=english_locale,
            target_locale=polish_locale,
            status=AITranslationJob.Status.COMPLETED,
            created_by=user,
        )
        result = process_ai_translation_job.run(job.id)
        assert result["status"] == AITranslationJob.Status.COMPLETED

    def test_skips_cancelled_job(self, english_locale, user_factory):
        polish_locale = LocaleFactory(code="pl", name="Polish", native_name="Polski")
        user = user_factory()
        job = AITranslationJob.objects.create(
            source_locale=english_locale,
            target_locale=polish_locale,
            status=AITranslationJob.Status.CANCELLED,
            created_by=user,
        )
        result = process_ai_translation_job.run(job.id)
        assert result["status"] == AITranslationJob.Status.CANCELLED

    @patch("apps.translations.ai_service.is_openai_configured", return_value=False)
    def test_fails_when_openai_not_configured(self, mock_openai, english_locale, user_factory):
        polish_locale = LocaleFactory(code="pl", name="Polish", native_name="Polski")
        user = user_factory()
        job = AITranslationJob.objects.create(
            source_locale=english_locale,
            target_locale=polish_locale,
            status=AITranslationJob.Status.PENDING,
            created_by=user,
        )
        result = process_ai_translation_job.run(job.id)
        assert "error" in result
        job.refresh_from_db()
        assert job.status == AITranslationJob.Status.FAILED


@pytest.mark.django_db
class TestTranslateSingleKeyAsync:
    """Tests for translate_single_key_async task."""

    @patch("apps.translations.ai_service.is_openai_configured", return_value=False)
    def test_returns_error_when_openai_not_configured(self, mock_openai):
        result = translate_single_key_async.run(1, "en", "pl", None)
        assert "error" in result

    @patch("apps.translations.ai_service.is_openai_configured", return_value=True)
    @patch("apps.translations.ai_service.AITranslationService")
    def test_translates_successfully(self, mock_service_class, mock_openai, english_locale):
        polish_locale = LocaleFactory(code="pl", name="Polish", native_name="Polski")
        key = TranslationKey.objects.create(
            key="Test / Key",
            default_message="Hello",
        )
        mock_service = mock_service_class.return_value
        mock_service.translate_single.return_value = type(
            "Result", (), {"success": True, "translated_text": "Cześć", "error": None}
        )()

        result = translate_single_key_async.run(key.id, "en", "pl", None)

        assert result["success"] is True
        assert result["translation"] == "Cześć"
