import logging

from djstripe import models as djstripe_models
from djstripe import webhooks

from . import constants, notifications, models
from .services import subscriptions, customers

logger = logging.getLogger(__name__)


@webhooks.handler('subscription_schedule.canceled', 'subscription_schedule.completed')
def activate_free_plan_on_subscription_deletion(event: djstripe_models.Event):
    """
    It is not possible to reactivate a canceled subscription with a different plan so we
    create a new subscription schedule on a free plan

    :param event:
    :return:
    """

    obj = event.data['object']
    customer = djstripe_models.Customer.objects.get(id=obj['customer'])
    free_plan_price = models.Price.objects.get_by_plan(constants.FREE_PLAN)
    subscriptions.create_schedule(customer=customer, price=free_plan_price)


@webhooks.handler('payment_method.attached')
def update_subscription_default_payment_method(event: djstripe_models.Event):
    """
    Remove this webhook if you don't want the newest payment method
    to be a default one for the subscription.
    The best alternative approach would most likely be to create a custom API
    endpoint that sets a default payment method on demand called right after
    the web app succeeds setup intent confirmation.

    :param event:
    :return:
    """

    obj = event.data['object']
    customer: djstripe_models.Customer = djstripe_models.Customer.objects.get(id=obj['customer'])
    if customer.default_payment_method is None:
        customers.set_default_payment_method(customer=customer, payment_method=obj['id'])


@webhooks.handler('invoice.payment_failed', 'invoice.payment_action_required')
def cancel_trial_subscription_on_payment_failure(event: djstripe_models.Event):
    obj = event.data['object']
    subscription_id = obj.get('subscription', None)

    subscription: djstripe_models.Subscription = djstripe_models.Subscription.objects.get(id=subscription_id)

    # Check if the previous subscription period was trialing
    # Unfortunately status field is already updated to active at this point
    if subscription.current_period_start == subscription.trial_end:
        subscription.cancel(at_period_end=False)


@webhooks.handler('invoice.payment_failed', 'invoice.payment_action_required')
def send_email_on_subscription_payment_failure(event: djstripe_models.Event):
    """
    This is an example of a handler that sends an email to a customer after a recurring payment fails

    :param event:
    :return:
    """
    obj = event.data['object']
    customer: djstripe_models.Customer = djstripe_models.Customer.objects.get(id=obj['customer'])
    notifications.create("subscriptionError", customer)
