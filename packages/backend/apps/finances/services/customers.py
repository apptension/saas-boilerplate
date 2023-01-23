from typing import Union

from djstripe import models as djstripe_models


def set_default_payment_method(
    customer: djstripe_models.Customer, payment_method: Union[djstripe_models.PaymentMethod, str]
):
    """
    Customer's default payment method should be set on the invoice_settings field. The
    default_payment_method on the customer model is only a convenience for easier filtering; it
    is populated in the dj-stripe webhook.

    :param customer:
    :param payment_method:
    :return:
    """
    if isinstance(payment_method, djstripe_models.StripeModel):
        payment_method = payment_method.id

    stripe_customer = customer.api_retrieve()
    stripe_customer["invoice_settings"]["default_payment_method"] = payment_method
    stripe_customer.save()
    customer.sync_from_stripe_data(stripe_customer)
    customer.refresh_from_db()
    return customer


def remove_payment_method(payment_method: djstripe_models.PaymentMethod):
    """
    This function needs to be run inside a transaction.
    It locks all rows in PaymentMethods table that are related to a customer of a payment method you want to remove.
    This avoids race conditions when someone wants to quickly remove multiple payment methods.

    :param payment_method:
    :return:
    """
    customer = payment_method.customer
    customer_payment_methods = list(customer.payment_methods.select_for_update().order_by('-created').all())

    if customer.default_payment_method == payment_method:
        customer.default_payment_method = None
        customer.save()

    if customer.default_payment_method is None:
        next_default_pm = next(iter([pm for pm in customer_payment_methods if pm != payment_method]), None)
        if next_default_pm:
            set_default_payment_method(customer, next_default_pm)

    payment_method.detach()
