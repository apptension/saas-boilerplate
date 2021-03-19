import logging

from djstripe import models as djstripe_models
from djstripe import webhooks

from . import constants

logger = logging.getLogger(__name__)


@webhooks.handler('customer.subscription.deleted')
def activate_free_plan_on_subscription_deletion(event):
    obj = event.data['object']
    customer = djstripe_models.Customer.objects.get(id=obj['customer'])
    free_plan_price = djstripe_models.Price.objects.get_by_plan(constants.FREE_PLAN)
    customer.subscribe(price=free_plan_price)
