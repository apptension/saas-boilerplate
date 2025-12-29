"""
Django management command to sync translations from a JSON file.

Usage:
    python manage.py sync_translations path/to/master.json
    
This command reads a master translations JSON file and syncs the keys
to the database. New keys are created, existing keys are updated,
and keys no longer in the file are marked as deprecated.
"""

import json
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError

from apps.translations.services import TranslationSyncer


class Command(BaseCommand):
    help = 'Sync translation keys from a master JSON file to the database'

    def add_arguments(self, parser):
        parser.add_argument('json_file', type=str, help='Path to the master translations JSON file')
        parser.add_argument('--dry-run', action='store_true', help='Show what would be done without making changes')

    def handle(self, *args, **options):
        json_path = Path(options['json_file'])
        dry_run = options['dry_run']

        if not json_path.exists():
            raise CommandError(f'File not found: {json_path}')

        self.stdout.write(f'Reading translations from: {json_path}')

        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                master_data = json.load(f)
        except json.JSONDecodeError as e:
            raise CommandError(f'Invalid JSON file: {e}')

        key_count = len(master_data)
        self.stdout.write(f'Found {key_count} translation keys')

        if dry_run:
            self.stdout.write(self.style.WARNING('Dry run mode - no changes will be made'))
            # Just count what would happen
            from apps.translations.models import TranslationKey

            existing_keys = set(TranslationKey.objects.values_list('key', flat=True))
            new_keys = set(master_data.keys())

            to_create = new_keys - existing_keys
            to_update = new_keys & existing_keys
            to_deprecate = existing_keys - new_keys

            self.stdout.write(f'  Would create: {len(to_create)} keys')
            self.stdout.write(f'  Would update: {len(to_update)} keys')
            self.stdout.write(f'  Would deprecate: {len(to_deprecate)} keys')
            return

        syncer = TranslationSyncer()
        stats = syncer.sync_from_json(master_data)

        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('Sync complete!'))
        self.stdout.write(f'  Created: {stats["created"]} keys')
        self.stdout.write(f'  Updated: {stats["updated"]} keys')
        self.stdout.write(f'  Deprecated: {stats["deprecated"]} keys')
        self.stdout.write(f'  Unchanged: {stats.get("unchanged", 0)} keys')

        if stats['deprecated'] > 0:
            self.stdout.write('')
            self.stdout.write(
                self.style.WARNING(
                    f'{stats["deprecated"]} keys were marked as deprecated. '
                    'These are no longer in the codebase but their translations are preserved.'
                )
            )
