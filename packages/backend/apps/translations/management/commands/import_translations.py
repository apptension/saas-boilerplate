"""
Import translations from JSON file to database.

This command imports pre-translated content from a JSON file.
It can be used to deploy translations that were generated locally.

Usage:
    python manage.py import_translations /path/to/translations.json
    python manage.py import_translations /path/to/translations.json --overwrite

The JSON file should have the format:
{
    "locales": [...],
    "translations": {
        "en": { "key1": "value1", ... },
        "pl": { "key1": "wartość1", ... },
        ...
    }
}
"""

import json
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError

from apps.translations.models import Locale, Translation, TranslationKey


class Command(BaseCommand):
    help = 'Import translations from JSON file to database'

    def add_arguments(self, parser):
        parser.add_argument('file', type=str, help='Path to the translations JSON file')
        parser.add_argument(
            '--overwrite',
            action='store_true',
            help='Overwrite existing translations',
        )
        parser.add_argument(
            '--status',
            type=str,
            choices=['draft', 'review', 'approved', 'published'],
            default='published',
            help='Status to set for imported translations (default: published)',
        )

    def handle(self, *args, **options):
        file_path = Path(options['file'])
        overwrite = options['overwrite']
        status = options['status']

        if not file_path.exists():
            raise CommandError(f"File not found: {file_path}")

        self.stdout.write(f"Reading translations from: {file_path}")

        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        if 'translations' not in data:
            raise CommandError("Invalid file format: 'translations' key not found")

        # Get all translation keys
        keys_by_key = {k.key: k for k in TranslationKey.objects.filter(is_deprecated=False)}
        self.stdout.write(f"Found {len(keys_by_key)} active translation keys in database")

        # Get all locales
        locales_by_code = {loc.code: loc for loc in Locale.objects.filter(is_active=True)}
        self.stdout.write(f"Found {len(locales_by_code)} active locales in database")
        self.stdout.write('')

        # Map status string to enum
        status_map = {
            'draft': Translation.Status.DRAFT,
            'review': Translation.Status.REVIEW,
            'approved': Translation.Status.APPROVED,
            'published': Translation.Status.PUBLISHED,
        }
        translation_status = status_map[status]

        total_created = 0
        total_updated = 0
        total_skipped = 0

        for locale_code, translations in data['translations'].items():
            if locale_code not in locales_by_code:
                self.stdout.write(self.style.WARNING(f"  Skipping {locale_code}: locale not found"))
                continue

            locale = locales_by_code[locale_code]
            created = 0
            updated = 0
            skipped = 0

            for key, value in translations.items():
                if key not in keys_by_key:
                    skipped += 1
                    continue

                translation_key = keys_by_key[key]

                existing = Translation.objects.filter(key=translation_key, locale=locale).first()

                if existing:
                    if overwrite:
                        existing.value = value
                        existing.status = translation_status
                        existing.save()
                        updated += 1
                    else:
                        skipped += 1
                else:
                    Translation.objects.create(
                        key=translation_key, locale=locale, value=value, status=translation_status
                    )
                    created += 1

            total_created += created
            total_updated += updated
            total_skipped += skipped

            self.stdout.write(f"  {locale_code}: {created} created, {updated} updated, {skipped} skipped")

        self.stdout.write('')
        self.stdout.write(
            self.style.SUCCESS(
                f"Import complete: {total_created} created, {total_updated} updated, " f"{total_skipped} skipped"
            )
        )
