from djstripe import models as djstripe_models

from . import managers


class Product(djstripe_models.Product):
    class Meta:
        proxy = True

    objects = managers.ProductManager()


class Price(djstripe_models.Price):
    class Meta:
        proxy = True

    objects = managers.PriceManager()


class Subscription(djstripe_models.Subscription):
    class Meta:
        proxy = True


class SubscriptionItem(djstripe_models.SubscriptionItem):
    class Meta:
        proxy = True


class Customer(djstripe_models.Customer):
    class Meta:
        proxy = True
