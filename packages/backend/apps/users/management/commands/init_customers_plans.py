from django.core.management.base import BaseCommand
from django.conf import settings

from apps.multitenancy.models import Tenant
from apps.finances.services import subscriptions


class Command(BaseCommand):
    help = "Creates stripe customer and schedule subscription plan"

    def handle(self, *args, **options):
        if not settings.STRIPE_CHECKS_ENABLED:
            self.stdout.write(self.style.WARNING("Stripe checks are disabled. Skipping customer plans initialization."))
            return

        if not settings.STRIPE_ENABLED:
            self.stdout.write(
                self.style.WARNING("Stripe is not properly configured. Skipping customer plans initialization.")
            )
            return

        tenants = Tenant.objects.filter(djstripe_customers__isnull=True)
        for tenant in tenants:
            subscriptions.initialize_tenant(tenant=tenant)
