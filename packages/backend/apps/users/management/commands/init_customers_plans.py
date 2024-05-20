from django.core.management.base import BaseCommand

from apps.multitenancy.models import Tenant
from apps.finances.services import subscriptions


class Command(BaseCommand):
    help = 'Creates stripe customer and schedule subscription plan'

    def handle(self, *args, **options):
        tenants = Tenant.objects.filter(djstripe_customers__isnull=True)
        for tenant in tenants:
            subscriptions.initialize_tenant(tenant=tenant)
