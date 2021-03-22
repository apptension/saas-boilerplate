from djstripe import models as djstripe_models

from .. import models, constants


def update(instance: djstripe_models.Subscription, **kwargs):
    """
    This method replaced the Subscription.update method.

    Built in Subscription.update method does not update related SubscriptionItems even though the data
    returned from stripe has all the info needed.

    :param instance: Subscription
    :param kwargs:
    :return:
    """
    stripe_subscription = instance._api_update(**kwargs)
    subscription = djstripe_models.Subscription.sync_from_stripe_data(stripe_subscription)
    djstripe_models.SubscriptionItem.sync_from_stripe_data(stripe_subscription.get("items").data[0])
    return subscription


def update_to_free_plan(instance: djstripe_models.Subscription, **kwargs):
    free_plan_price = models.Price.objects.get_by_plan(constants.FREE_PLAN)
    subscription_item = instance.items.first()
    return update(instance, items=[{'id': subscription_item.id, 'price': free_plan_price.id}], **kwargs)
