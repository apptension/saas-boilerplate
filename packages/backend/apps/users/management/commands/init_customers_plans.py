from django.core.management.base import BaseCommand

from ...models import User
from apps.finances.services import subscriptions


class Command(BaseCommand):
    help = 'Creates stripe customer and schedule subscription plan'

    def handle(self, *args, **options):
        users = User.objects.filter(djstripe_customers__isnull=True, is_superuser=False)
        for user in users:
            subscriptions.initialize_user(user=user)
