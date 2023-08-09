from django.core.management.base import BaseCommand

from ... import models, constants


class Command(BaseCommand):
    help = 'Create stripe products and prices required for subscriptions'

    def create_or_update_plan(self, plan_config: constants.SubscriptionPlanConfig):
        product, _ = models.Product.objects.get_or_create_subscription_plan(plan_config=plan_config)
        models.Price.objects.get_or_create_subscription_price(product=product, plan_config=plan_config)

    def handle(self, *args, **options):
        plan_products = constants.ALL_PLANS
        for plan_product in plan_products:
            self.create_or_update_plan(plan_product)
