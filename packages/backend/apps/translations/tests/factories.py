"""
Factory classes for translation models.
"""

import factory
from factory.django import DjangoModelFactory

from ..models import Locale, TranslationKey, Translation, TranslationVersion


class LocaleFactory(DjangoModelFactory):
    """Factory for Locale model."""

    class Meta:
        model = Locale
        django_get_or_create = ('code',)

    code = factory.Sequence(lambda n: f'l{n}')
    name = factory.LazyAttribute(lambda o: f"Language {o.code}")
    native_name = factory.LazyAttribute(lambda o: f"Native {o.code}")
    is_default = False
    is_active = True
    rtl = False
    sort_order = factory.Sequence(lambda n: n)


class EnglishLocaleFactory(LocaleFactory):
    """Factory for English locale."""

    code = 'en'
    name = 'English'
    native_name = 'English'
    is_default = True


class PolishLocaleFactory(LocaleFactory):
    """Factory for Polish locale."""

    code = 'pl'
    name = 'Polish'
    native_name = 'Polski'
    is_default = False


class TranslationKeyFactory(DjangoModelFactory):
    """Factory for TranslationKey model."""

    class Meta:
        model = TranslationKey
        django_get_or_create = ('key',)

    key = factory.Sequence(lambda n: f"Test / Key {n}")
    default_message = factory.LazyAttribute(lambda o: f"Default message for {o.key}")
    description = factory.LazyAttribute(lambda o: f"Description for {o.key}")
    is_deprecated = False


class TranslationFactory(DjangoModelFactory):
    """Factory for Translation model."""

    class Meta:
        model = Translation
        django_get_or_create = ('key', 'locale')

    key = factory.SubFactory(TranslationKeyFactory)
    locale = factory.SubFactory(LocaleFactory)
    value = factory.LazyAttribute(lambda o: f"Translated: {o.key.default_message}")
    status = Translation.Status.PUBLISHED


class TranslationVersionFactory(DjangoModelFactory):
    """Factory for TranslationVersion model."""

    class Meta:
        model = TranslationVersion

    locale = factory.SubFactory(LocaleFactory)
    version = factory.Sequence(lambda n: f"v{n}")
    s3_key = factory.LazyAttribute(lambda o: f"translations/{o.locale.code}/{o.version}.json")
    translation_count = 10
    is_active = False
