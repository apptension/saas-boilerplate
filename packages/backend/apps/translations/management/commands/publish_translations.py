"""
Django management command to publish translations to S3.

Usage:
    python manage.py publish_translations en
    python manage.py publish_translations --all

This command publishes translations for specified locale(s) to S3 and
invalidates the CloudFront cache.
"""

from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model

from apps.translations.models import Locale
from apps.translations.services import TranslationPublisher


User = get_user_model()


class Command(BaseCommand):
    help = "Publish translations for a locale to S3"

    def add_arguments(self, parser):
        parser.add_argument("locale_code", nargs="?", type=str, help='Locale code to publish (e.g., "en", "pl")')
        parser.add_argument("--all", action="store_true", help="Publish all active locales")
        parser.add_argument("--user", type=str, help="Email of user to attribute the publish to")

    def handle(self, *args, **options):
        locale_code = options.get("locale_code")
        publish_all = options["all"]
        user_email = options.get("user")

        if not locale_code and not publish_all:
            raise CommandError("Please specify a locale code or use --all")

        # Get user for attribution
        user = None
        if user_email:
            try:
                user = User.objects.get(email=user_email)
            except User.DoesNotExist:
                self.stdout.write(self.style.WARNING(f"User {user_email} not found, proceeding without attribution"))

        publisher = TranslationPublisher()

        if publish_all:
            locales = Locale.objects.filter(is_active=True)
            if not locales:
                raise CommandError("No active locales found")

            self.stdout.write(f"Publishing {locales.count()} locales...")

            for locale in locales:
                self._publish_locale(publisher, locale, user)
        else:
            try:
                locale = Locale.objects.get(code=locale_code, is_active=True)
            except Locale.DoesNotExist:
                raise CommandError(f'Locale "{locale_code}" not found or inactive')

            self._publish_locale(publisher, locale, user)

        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS("Publish complete!"))

    def _publish_locale(self, publisher, locale, user):
        self.stdout.write(f"Publishing {locale.name} ({locale.code})...")

        try:
            version = publisher.publish(locale, user)
            self.stdout.write(
                self.style.SUCCESS(
                    f"  ✓ Published version {version.version} ({version.translation_count} translations)"
                )
            )
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"  ✗ Failed: {e}"))
            raise CommandError(f"Failed to publish {locale.code}: {e}")
