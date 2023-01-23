from django.db import models
from djstripe.settings import djstripe_settings
from djstripe import enums as djstripe_enums

from .constants import SubscriptionPlanConfig


class ProductManager(models.Manager):
    def get_or_create_subscription_plan(
        self, plan_config: SubscriptionPlanConfig, livemode=djstripe_settings.STRIPE_LIVE_MODE, stripe_account=None
    ):
        product = self.filter(name=plan_config.name).order_by('created').first()
        if product:
            return product, False

        action = "create:{}".format(plan_config.name)
        idempotency_key = djstripe_settings.get_idempotency_key("product", action, livemode)
        return (
            self.create(
                idempotency_key=idempotency_key,
                stripe_account=stripe_account,
                name=plan_config.name,
                type=djstripe_enums.ProductType.service,
            ),
            True,
        )

    def create(self, idempotency_key=None, stripe_account=None, **kwargs):
        metadata = {}

        stripe_product = self.model._api_create(
            **kwargs,
            idempotency_key=idempotency_key,
            metadata=metadata,
            stripe_account=stripe_account,
        )

        return self.model.sync_from_stripe_data(stripe_product)


class PriceManager(models.Manager):
    def get_by_plan(self, plan: SubscriptionPlanConfig):
        return self.filter(product__name=plan.name).order_by('created').first()

    def get_or_create_subscription_price(
        self,
        product,
        plan_config: SubscriptionPlanConfig,
        livemode=djstripe_settings.STRIPE_LIVE_MODE,
        stripe_account=None,
    ):
        try:
            return self.get(product=product), False
        except self.model.DoesNotExist:
            action = "create:{}".format(plan_config.name)
            idempotency_key = djstripe_settings.get_idempotency_key("plan_price", action, livemode)
            return (
                self.model.create(
                    idempotency_key=idempotency_key,
                    stripe_account=stripe_account,
                    product=product,
                    unit_amount=plan_config.initial_price.unit_amount,
                    currency=plan_config.initial_price.currency,
                    recurring=plan_config.initial_price.recurring,
                ),
                True,
            )
