from djstripe import models as djstripe_models


def set_default_payment_method(customer: djstripe_models.Customer, payment_method):
    if isinstance(payment_method, djstripe_models.StripeModel):
        payment_method = payment_method.id

    stripe_customer = customer.api_retrieve()
    stripe_customer["invoice_settings"]["default_payment_method"] = payment_method
    stripe_customer.save()
    customer.sync_from_stripe_data(stripe_customer)
    customer.refresh_from_db()
    return customer
