"""
Tests for translation views.
"""

import pytest
from unittest.mock import patch
from rest_framework.test import APIClient
from rest_framework import status

from apps.translations.models import Locale, TranslationKey, Translation, AITranslationJob
from apps.translations.views import AvailableLocalesView, TranslationsJsonView

from .factories import LocaleFactory, EnglishLocaleFactory, TranslationKeyFactory, TranslationFactory


@pytest.mark.django_db
class TestAvailableLocalesView:
    """Tests for AvailableLocalesView."""

    def test_list_locales(self, english_locale):
        client = APIClient()
        response = client.get("/api/translations/locales/")
        assert response.status_code == 200
        assert isinstance(response.data, list)

    def test_returns_only_active_locales(self):
        LocaleFactory(code="inactive", is_active=False)
        LocaleFactory(code="active", is_active=True)
        client = APIClient()
        response = client.get("/api/translations/locales/")
        codes = [loc["code"] for loc in response.data]
        assert "active" in codes
        assert "inactive" not in codes


@pytest.mark.django_db
class TestTranslationsJsonView:
    """Tests for TranslationsJsonView."""

    def test_returns_404_for_invalid_locale(self):
        client = APIClient()
        response = client.get("/api/translations/xx.json")
        assert response.status_code == 404

    def test_returns_translations_for_valid_locale(self, english_locale, translation_keys):
        TranslationFactory(
            key=translation_keys[0],
            locale=english_locale,
            value="Translated",
            status=Translation.Status.PUBLISHED,
        )
        client = APIClient()
        from django.core.cache import cache

        cache.delete("translations_en")
        response = client.get("/api/translations/en.json")
        assert response.status_code == 200
        assert "Home / Title" in response.json() or "Translated" in str(response.content)


@pytest.mark.django_db
class TestAITranslationJobDetailView:
    """Tests for AITranslationJobDetailView."""

    def test_returns_404_for_nonexistent_job(self, user_factory):
        user = user_factory(is_superuser=True)
        client = APIClient()
        client.force_authenticate(user=user)
        response = client.get("/api/translations/ai-jobs/99999/")
        assert response.status_code == 404
