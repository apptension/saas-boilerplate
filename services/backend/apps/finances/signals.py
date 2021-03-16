from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from django.dispatch import receiver

from . import models, constants

User = get_user_model()


@receiver(post_save, sender=User)
def create_free_plan_subscription(sender, instance, created, **kwargs):
    if created:
        price = models.Price.objects.get_by_plan(constants.FREE_PLAN)
        customer, _ = models.Customer.get_or_create(instance)
        customer.subscribe(price=price)
