"""
Initialize default locales for the application.

This command creates the default set of supported locales if they don't exist.
It should be run during initial deployment or when adding new locales.

Usage:
    python manage.py init_locales
"""

from django.core.management.base import BaseCommand

from apps.translations.models import Locale


# Default locales to create
DEFAULT_LOCALES = [
    {'code': 'en', 'name': 'English', 'native_name': 'English', 'is_default': True, 'rtl': False, 'sort_order': 1},
    {'code': 'pl', 'name': 'Polish', 'native_name': 'Polski', 'is_default': False, 'rtl': False, 'sort_order': 2},
    {'code': 'de', 'name': 'German', 'native_name': 'Deutsch', 'is_default': False, 'rtl': False, 'sort_order': 3},
    {'code': 'es', 'name': 'Spanish', 'native_name': 'Español', 'is_default': False, 'rtl': False, 'sort_order': 4},
    {
        'code': 'zh',
        'name': 'Chinese (Simplified)',
        'native_name': '简体中文',
        'is_default': False,
        'rtl': False,
        'sort_order': 5,
    },
    {'code': 'hi', 'name': 'Hindi', 'native_name': 'हिन्दी', 'is_default': False, 'rtl': False, 'sort_order': 6},
    {'code': 'ar', 'name': 'Arabic', 'native_name': 'العربية', 'is_default': False, 'rtl': True, 'sort_order': 7},
    {'code': 'fr', 'name': 'French', 'native_name': 'Français', 'is_default': False, 'rtl': False, 'sort_order': 8},
]


class Command(BaseCommand):
    help = 'Initialize default locales for the application'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Update existing locales with default values',
        )

    def handle(self, *args, **options):
        force = options['force']

        created_count = 0
        updated_count = 0
        skipped_count = 0

        for locale_data in DEFAULT_LOCALES:
            code = locale_data['code']
            existing = Locale.objects.filter(code=code).first()

            if existing:
                if force:
                    # Update existing locale
                    for key, value in locale_data.items():
                        setattr(existing, key, value)
                    existing.save()
                    updated_count += 1
                    self.stdout.write(f"  Updated: {code} - {locale_data['name']}")
                else:
                    skipped_count += 1
                    self.stdout.write(f"  Skipped: {code} - {locale_data['name']} (already exists)")
            else:
                Locale.objects.create(**locale_data)
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f"  Created: {code} - {locale_data['name']}"))

        self.stdout.write('')
        self.stdout.write(
            self.style.SUCCESS(
                f"Locale initialization complete: {created_count} created, "
                f"{updated_count} updated, {skipped_count} skipped"
            )
        )
