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
