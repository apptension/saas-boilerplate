"""
Pytest fixtures for translations tests.
"""

import pytest

from .factories import LocaleFactory, EnglishLocaleFactory, TranslationKeyFactory


@pytest.fixture
def english_locale(db):
    return EnglishLocaleFactory()


@pytest.fixture
def polish_locale(db):
    return LocaleFactory(code="pl", name="Polish", native_name="Polski")


@pytest.fixture
def translation_keys(db):
    return [
        TranslationKeyFactory(key="Home / Title", default_message="Welcome"),
        TranslationKeyFactory(key="Home / Subtitle", default_message="Hello World"),
        TranslationKeyFactory(key="Footer / Copyright", default_message="All rights reserved"),
    ]
