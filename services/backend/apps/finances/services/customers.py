from typing import Union
from django.db.models import Q

from djstripe import models as djstripe_models


def set_default_payment_method(
    customer: djstripe_models.Customer, payment_method: Union[djstripe_models.PaymentMethod, str]
):
    if isinstance(payment_method, djstripe_models.StripeModel):
        payment_method = payment_method.id

    stripe_customer = customer.api_retrieve()
    stripe_customer["invoice_settings"]["default_payment_method"] = payment_method
    stripe_customer.save()
    customer.sync_from_stripe_data(stripe_customer)
    customer.refresh_from_db()
    return customer


def remove_payment_method(payment_method: djstripe_models.PaymentMethod):
    customer = payment_method.customer
    if customer.default_payment_method == payment_method:
        customer.default_payment_method = None
        customer.save()

    if customer.default_payment_method is None:
        next_default_pm = customer.payment_methods.filter(~Q(id=payment_method.id)).order_by('-created').first()
        if next_default_pm:
            set_default_payment_method(customer, next_default_pm)

    payment_method.detach()
