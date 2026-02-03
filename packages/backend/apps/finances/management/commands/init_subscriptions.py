from django.core.management.base import BaseCommand
from django.conf import settings

from ... import models, constants


class Command(BaseCommand):
    help = "Create stripe products and prices required for subscriptions"

    def create_or_update_plan(self, plan_config: constants.SubscriptionPlanConfig):
        product, _ = models.Product.objects.get_or_create_subscription_plan(plan_config=plan_config)
        models.Price.objects.get_or_create_subscription_price(product=product, plan_config=plan_config)

    def handle(self, *args, **options):
        if not settings.STRIPE_CHECKS_ENABLED:
            self.stdout.write(self.style.WARNING("Stripe checks are disabled. Skipping subscription initialization."))
            return

        if not settings.STRIPE_ENABLED:
            self.stdout.write(
                self.style.WARNING("Stripe is not properly configured. Skipping subscription initialization.")
            )
            return

        plan_products = constants.ALL_PLANS
        for plan_product in plan_products:
            self.create_or_update_plan(plan_product)
