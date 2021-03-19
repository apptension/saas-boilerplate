from djstripe import models as djstripe_models

from .. import models, constants


def update(instance, **kwargs):
    stripe_subscription = instance._api_update(**kwargs)
    subscription = djstripe_models.Subscription.sync_from_stripe_data(stripe_subscription)
    djstripe_models.SubscriptionItem.sync_from_stripe_data(stripe_subscription.get("items").data[0])
    return subscription


def update_to_free_plan(instance, **kwargs):
    free_plan_price = models.Price.objects.get_by_plan(constants.FREE_PLAN)
    subscription_item = instance.items.first()
    return update(instance, items=[{'id': subscription_item.id, 'price': free_plan_price.id}], **kwargs)
