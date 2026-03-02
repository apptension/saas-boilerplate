"""
Tests for AI translation service.
"""

import pytest
from unittest.mock import Mock, patch, MagicMock

from apps.translations.ai_service import AITranslationService, TranslationResult, is_openai_configured


pytestmark = pytest.mark.django_db


class TestAITranslationService:
    """Tests for AITranslationService."""

    def test_get_language_name_known_locale(self):
        """Should return full language name for known locales."""
        service = AITranslationService()

        assert service.get_language_name('en') == 'English'
        assert service.get_language_name('pl') == 'Polish'
        assert service.get_language_name('de') == 'German'
        assert service.get_language_name('ja') == 'Japanese'

    def test_get_language_name_unknown_locale(self):
        """Should return locale code for unknown locales."""
        service = AITranslationService()

        assert service.get_language_name('xx') == 'xx'
        assert service.get_language_name('unknown') == 'unknown'

    @patch('apps.translations.ai_service.settings')
    def test_is_openai_configured_with_key(self, mock_settings):
        """Should return True when API key is configured."""
        mock_settings.OPENAI_API_KEY = 'sk-test-key'

        assert is_openai_configured() is True

    @patch('apps.translations.ai_service.settings')
    def test_is_openai_configured_without_key(self, mock_settings):
        """Should return False when API key is not configured."""
        mock_settings.OPENAI_API_KEY = ''

        assert is_openai_configured() is False

    @patch('apps.translations.ai_service.settings')
    def test_client_raises_without_api_key(self, mock_settings):
        """Should raise ValueError when trying to use client without API key."""
        mock_settings.OPENAI_API_KEY = None

        service = AITranslationService()

        with pytest.raises(ValueError, match="OPENAI_API_KEY is not configured"):
            _ = service.client

    @patch('openai.OpenAI')
    @patch('apps.translations.ai_service.settings')
    def test_translate_batch_success(self, mock_settings, mock_openai):
        """Should successfully translate a batch of keys."""
        mock_settings.OPENAI_API_KEY = 'sk-test-key'
        mock_settings.OPENAI_MODEL = 'gpt-4'

        # Mock OpenAI response
        mock_response = Mock()
        mock_response.choices = [Mock(message=Mock(content='{"translations": {"key1": "Witaj", "key2": "Świat"}}'))]
        mock_client = Mock()
        mock_client.chat.completions.create.return_value = mock_response
        mock_openai.return_value = mock_client

        service = AITranslationService()
        results = service.translate_batch(
            keys_with_text=[{'key': 'key1', 'text': 'Hello'}, {'key': 'key2', 'text': 'World'}],
            source_locale='en',
            target_locale='pl',
        )

        assert len(results) == 2
        assert results[0].key == 'key1'
        assert results[0].translated_text == 'Witaj'
        assert results[0].success is True
        assert results[1].key == 'key2'
        assert results[1].translated_text == 'Świat'
        assert results[1].success is True

    @patch('openai.OpenAI')
    @patch('apps.translations.ai_service.settings')
    def test_translate_batch_partial_response(self, mock_settings, mock_openai):
        """Should handle partial responses from OpenAI."""
        mock_settings.OPENAI_API_KEY = 'sk-test-key'
        mock_settings.OPENAI_MODEL = 'gpt-4'

        # Mock OpenAI response with only one translation
        mock_response = Mock()
        mock_response.choices = [Mock(message=Mock(content='{"translations": {"key1": "Witaj"}}'))]
        mock_client = Mock()
        mock_client.chat.completions.create.return_value = mock_response
        mock_openai.return_value = mock_client

        service = AITranslationService()
        results = service.translate_batch(
            keys_with_text=[{'key': 'key1', 'text': 'Hello'}, {'key': 'key2', 'text': 'World'}],
            source_locale='en',
            target_locale='pl',
        )

        assert len(results) == 2
        assert results[0].success is True
        assert results[1].success is False
        assert 'not found' in results[1].error

    @patch('openai.OpenAI')
    @patch('apps.translations.ai_service.settings')
    def test_translate_batch_invalid_json(self, mock_settings, mock_openai):
        """Should handle invalid JSON responses."""
        mock_settings.OPENAI_API_KEY = 'sk-test-key'
        mock_settings.OPENAI_MODEL = 'gpt-4'

        # Mock invalid JSON response
        mock_response = Mock()
        mock_response.choices = [Mock(message=Mock(content='not valid json'))]
        mock_client = Mock()
        mock_client.chat.completions.create.return_value = mock_response
        mock_openai.return_value = mock_client

        service = AITranslationService()
        results = service.translate_batch(
            keys_with_text=[{'key': 'key1', 'text': 'Hello'}], source_locale='en', target_locale='pl'
        )

        assert len(results) == 1
        assert results[0].success is False
        assert 'JSON parse error' in results[0].error

    @patch('openai.OpenAI')
    @patch('apps.translations.ai_service.settings')
    def test_translate_batch_api_error(self, mock_settings, mock_openai):
        """Should handle OpenAI API errors."""
        mock_settings.OPENAI_API_KEY = 'sk-test-key'
        mock_settings.OPENAI_MODEL = 'gpt-4'

        # Mock API error
        mock_client = Mock()
        mock_client.chat.completions.create.side_effect = Exception("API rate limit exceeded")
        mock_openai.return_value = mock_client

        service = AITranslationService()
        results = service.translate_batch(
            keys_with_text=[{'key': 'key1', 'text': 'Hello'}], source_locale='en', target_locale='pl'
        )

        assert len(results) == 1
        assert results[0].success is False
        assert 'rate limit' in results[0].error

    def test_translate_batch_empty_list(self):
        """Should handle empty input list."""
        service = AITranslationService()
        results = service.translate_batch(keys_with_text=[], source_locale='en', target_locale='pl')

        assert results == []

    @patch('openai.OpenAI')
    @patch('apps.translations.ai_service.settings')
    def test_translate_single(self, mock_settings, mock_openai):
        """Should translate a single key."""
        mock_settings.OPENAI_API_KEY = 'sk-test-key'
        mock_settings.OPENAI_MODEL = 'gpt-4'

        mock_response = Mock()
        mock_response.choices = [Mock(message=Mock(content='{"translations": {"test_key": "Przetłumaczony tekst"}}'))]
        mock_client = Mock()
        mock_client.chat.completions.create.return_value = mock_response
        mock_openai.return_value = mock_client

        service = AITranslationService()
        result = service.translate_single(
            key='test_key',
            text='Original text',
            source_locale='en',
            target_locale='pl',
            description='A test translation',
        )

        assert result.success is True
        assert result.key == 'test_key'
        assert result.translated_text == 'Przetłumaczony tekst'


class TestTranslationResult:
    """Tests for TranslationResult dataclass."""

    def test_successful_result(self):
        """Should create a successful result."""
        result = TranslationResult(key='test_key', source_text='Hello', translated_text='Cześć', success=True)

        assert result.key == 'test_key'
        assert result.source_text == 'Hello'
        assert result.translated_text == 'Cześć'
        assert result.success is True
        assert result.error is None

    def test_failed_result(self):
        """Should create a failed result with error."""
        result = TranslationResult(
            key='test_key', source_text='Hello', translated_text='', success=False, error='Translation failed'
        )

        assert result.success is False
        assert result.error == 'Translation failed'
