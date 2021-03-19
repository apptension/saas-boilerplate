from djstripe import models as djstripe_models


def customer_can_activate_trial(customer: djstripe_models.Customer):
    return not customer.subscriptions.filter(trial_end__isnull=False).exists()
