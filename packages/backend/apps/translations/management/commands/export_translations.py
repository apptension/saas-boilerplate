"""
Export translations from the database to JSON files.

This command exports all active locale translations to JSON files
that can be used by the frontend application.

Usage:
    python manage.py export_translations [--output-dir PATH]
"""

import json
from pathlib import Path

from django.core.management.base import BaseCommand

from apps.translations.models import Locale, Translation, TranslationKey


class Command(BaseCommand):
    help = 'Export translations from database to JSON files'

    def add_arguments(self, parser):
        parser.add_argument(
            '--output-dir',
            type=str,
            help='Output directory for JSON files (defaults to /app/translations)',
            default='/app/translations',
        )
        parser.add_argument(
            '--format',
            type=str,
            choices=['full', 'simple', 'json-dump'],
            default='full',
            help='Output format: full (with defaultMessage wrapper), simple (key-value), json-dump (all data as JSON to stdout)',
        )

    def handle(self, *args, **options):
        output_dir = Path(options['output_dir'])
        output_format = options['format']

        # If json-dump format, output everything to stdout and exit
        if output_format == 'json-dump':
            self.dump_all_translations_as_json()
            return

        # Ensure output directory exists
        output_dir.mkdir(parents=True, exist_ok=True)

        # Get master translations (for fallback)
        master_keys = {key.key: key.default_message for key in TranslationKey.objects.filter(is_deprecated=False)}
        total_keys = len(master_keys)

        self.stdout.write(f"Found {total_keys} active translation keys")
        self.stdout.write("")

        # Get all active locales
        locales = Locale.objects.filter(is_active=True).order_by('sort_order')

        locales_info = []

        for locale in locales:
            # Get all published translations for this locale
            translations = Translation.objects.filter(
                locale=locale, status=Translation.Status.PUBLISHED, key__is_deprecated=False
            ).select_related('key')

            # Build translation dict
            locale_translations = {t.key.key: t.value for t in translations}
            translated_count = len(locale_translations)

            # Build output based on format
            if output_format == 'full':
                # Full format with defaultMessage wrapper
                output_data = {}
                for key, default_msg in master_keys.items():
                    output_data[key] = {'defaultMessage': locale_translations.get(key, default_msg)}
            else:
                # Simple key-value format
                output_data = {}
                for key, default_msg in master_keys.items():
                    output_data[key] = locale_translations.get(key, default_msg)

            # Write to file
            output_path = output_dir / f"{locale.code}.json"
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(output_data, f, ensure_ascii=False, indent=2)

            # Calculate percentage
            percent = (translated_count / total_keys * 100) if total_keys > 0 else 0
            rtl_marker = ' (RTL)' if locale.rtl else ''

            self.stdout.write(
                self.style.SUCCESS(
                    f"  ✓ {locale.code}.json - {translated_count}/{total_keys} keys ({percent:.1f}%){rtl_marker}"
                )
            )

            locales_info.append(
                {
                    'code': locale.code,
                    'name': locale.name,
                    'native_name': locale.native_name,
                    'rtl': locale.rtl,
                    'is_default': locale.is_default,
                }
            )

        # Write locales.json metadata file
        locales_path = output_dir / "locales.json"
        with open(locales_path, 'w', encoding='utf-8') as f:
            json.dump(locales_info, f, ensure_ascii=False, indent=2)

        self.stdout.write(self.style.SUCCESS(f"  ✓ locales.json - {len(locales_info)} locales"))
        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS(f"Export complete! Files written to: {output_dir}"))

    def dump_all_translations_as_json(self):
        """Dump all translations as JSON to stdout for external processing."""
        result = {'locales': [], 'translations': {}}

        # Get master keys
        master_keys = {key.key: key.default_message for key in TranslationKey.objects.filter(is_deprecated=False)}

        for locale in Locale.objects.filter(is_active=True).order_by('sort_order'):
            result['locales'].append(
                {
                    'code': locale.code,
                    'name': locale.name,
                    'native_name': locale.native_name,
                    'rtl': locale.rtl,
                    'is_default': locale.is_default,
                }
            )

            translations = Translation.objects.filter(
                locale=locale, status=Translation.Status.PUBLISHED, key__is_deprecated=False
            ).select_related('key')

            locale_translations = {t.key.key: t.value for t in translations}

            # Include all keys with fallback to master
            full_translations = {}
            for key, default_msg in master_keys.items():
                full_translations[key] = locale_translations.get(key, default_msg)

            result['translations'][locale.code] = full_translations

        # Output as single-line JSON to stdout
        self.stdout.write(json.dumps(result, ensure_ascii=False))
