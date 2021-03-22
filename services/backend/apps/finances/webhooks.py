import logging

from djstripe import models as djstripe_models, enums as djstripe_enums
from djstripe import webhooks

from . import constants
from .services import subscriptions

logger = logging.getLogger(__name__)


@webhooks.handler('customer.subscription.updated')
def downgrade_to_free_plan_for_past_due_subscription(event):
    """
    Subscription is has a past_due status after a recurring charge fails.

    :param event:
    :return:
    """

    obj = event.data['object']
    if obj['status'] != djstripe_enums.SubscriptionStatus.past_due:
        return

    subscription = djstripe_models.Subscription.objects.get(id=obj['id'])
    subscriptions.update_to_free_plan(subscription)


@webhooks.handler('customer.subscription.deleted')
def activate_free_plan_on_subscription_deletion(event):
    """
    It is not possible to reactivate a canceled subscription with a different plan so we
    create a new subscription on a free plan

    :param event:
    :return:
    """

    obj = event.data['object']
    customer = djstripe_models.Customer.objects.get(id=obj['customer'])
    free_plan_price = djstripe_models.Price.objects.get_by_plan(constants.FREE_PLAN)
    customer.subscribe(price=free_plan_price)
