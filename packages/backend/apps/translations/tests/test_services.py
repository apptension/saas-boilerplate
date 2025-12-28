"""
Tests for translation services.
"""

import pytest
from unittest.mock import patch, MagicMock

from ..models import TranslationKey, Translation, Locale
from ..services import TranslationPublisher, TranslationSyncer, get_translations_for_locale
from .factories import (
    LocaleFactory,
    EnglishLocaleFactory,
    TranslationKeyFactory,
    TranslationFactory
)


@pytest.fixture
def english_locale(db):
    return EnglishLocaleFactory()


@pytest.fixture
def polish_locale(db):
    return LocaleFactory(code='pl', name='Polish', native_name='Polski')


@pytest.fixture
def translation_keys(db):
    return [
        TranslationKeyFactory(key='Home / Title', default_message='Welcome'),
        TranslationKeyFactory(key='Home / Subtitle', default_message='Hello World'),
        TranslationKeyFactory(key='Footer / Copyright', default_message='All rights reserved'),
    ]


class TestTranslationSyncer:
    """Tests for TranslationSyncer class."""

    def test_sync_creates_new_keys(self, db):
        syncer = TranslationSyncer()
        
        master_json = {
            'Home / Title': {'defaultMessage': 'Welcome Home', 'description': 'Main title'},
            'Home / Button': {'defaultMessage': 'Click me'},
        }
        
        stats = syncer.sync_from_json(master_json)
        
        assert stats['created'] == 2
        assert stats['updated'] == 0
        assert stats['deprecated'] == 0
        
        assert TranslationKey.objects.count() == 2
        
        key = TranslationKey.objects.get(key='Home / Title')
        assert key.default_message == 'Welcome Home'
        assert key.description == 'Main title'

    def test_sync_updates_existing_keys(self, db, translation_keys):
        syncer = TranslationSyncer()
        
        master_json = {
            'Home / Title': {'defaultMessage': 'New Welcome Message'},
            'Home / Subtitle': {'defaultMessage': 'Hello World'},  # Same as before
        }
        
        stats = syncer.sync_from_json(master_json)
        
        assert stats['updated'] >= 1  # At least Home / Title was updated
        assert stats['deprecated'] == 1  # Footer / Copyright is now deprecated
        
        key = TranslationKey.objects.get(key='Home / Title')
        assert key.default_message == 'New Welcome Message'
        
        deprecated_key = TranslationKey.objects.get(key='Footer / Copyright')
        assert deprecated_key.is_deprecated is True

    def test_sync_handles_simple_format(self, db):
        """Test sync with simple format (key: value instead of key: {defaultMessage: value})."""
        syncer = TranslationSyncer()
        
        master_json = {
            'Simple / Key': 'Simple value'
        }
        
        stats = syncer.sync_from_json(master_json)
        
        assert stats['created'] == 1
        key = TranslationKey.objects.get(key='Simple / Key')
        assert key.default_message == 'Simple value'

    def test_get_sync_status(self, db, english_locale, polish_locale, translation_keys):
        # Add some translations
        TranslationFactory(
            key=translation_keys[0],
            locale=english_locale,
            status=Translation.Status.PUBLISHED
        )
        TranslationFactory(
            key=translation_keys[0],
            locale=polish_locale,
            status=Translation.Status.PUBLISHED
        )
        
        syncer = TranslationSyncer()
        status = syncer.get_sync_status()
        
        assert status['total_keys'] == 3
        assert status['active_keys'] == 3
        assert len(status['locales']) == 2


class TestTranslationPublisher:
    """Tests for TranslationPublisher class."""

    def test_generate_translation_bundle(self, db, english_locale, translation_keys):
        # Add a translation for one key
        TranslationFactory(
            key=translation_keys[0],
            locale=english_locale,
            value='Translated Welcome',
            status=Translation.Status.PUBLISHED
        )
        
        publisher = TranslationPublisher()
        bundle = publisher.generate_translation_bundle(english_locale)
        
        assert bundle['Home / Title'] == 'Translated Welcome'  # Has translation
        assert bundle['Home / Subtitle'] == 'Hello World'  # Falls back to default
        assert bundle['Footer / Copyright'] == 'All rights reserved'  # Falls back to default

    def test_generate_version_hash(self, db):
        publisher = TranslationPublisher()
        
        translations1 = {'a': 'b', 'c': 'd'}
        translations2 = {'a': 'b', 'c': 'd'}
        translations3 = {'a': 'different', 'c': 'd'}
        
        hash1 = publisher.generate_version_hash(translations1)
        hash2 = publisher.generate_version_hash(translations2)
        hash3 = publisher.generate_version_hash(translations3)
        
        assert hash1 == hash2  # Same content = same hash
        assert hash1 != hash3  # Different content = different hash

    @patch.object(TranslationPublisher, '_upload_json')
    @patch.object(TranslationPublisher, '_invalidate_cache')
    @patch.object(TranslationPublisher, '_clear_cache')
    def test_publish(self, mock_clear, mock_invalidate, mock_upload, db, english_locale, translation_keys):
        publisher = TranslationPublisher()
        publisher.bucket_name = 'test-bucket'
        
        user = MagicMock()
        version = publisher.publish(english_locale, user)
        
        assert version.locale == english_locale
        assert version.is_active is True
        assert version.translation_count == 3
        assert mock_upload.called
        assert mock_invalidate.called


class TestGetTranslationsForLocale:
    """Tests for get_translations_for_locale function."""

    def test_returns_translations_for_valid_locale(self, db, english_locale, translation_keys):
        TranslationFactory(
            key=translation_keys[0],
            locale=english_locale,
            value='Test Translation',
            status=Translation.Status.PUBLISHED
        )
        
        translations = get_translations_for_locale('en')
        
        assert translations is not None
        assert 'Home / Title' in translations

    def test_returns_none_for_invalid_locale(self, db):
        result = get_translations_for_locale('xx')
        assert result is None

    def test_returns_none_for_inactive_locale(self, db):
        LocaleFactory(code='xx', is_active=False)
        result = get_translations_for_locale('xx')
        assert result is None

