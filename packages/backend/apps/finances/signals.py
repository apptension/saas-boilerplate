from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from django.dispatch import receiver

from .services import subscriptions

User = get_user_model()


@receiver(post_save, sender=User)
def create_free_plan_subscription(sender, instance, created, **kwargs):
    if created:
        subscriptions.initialize_user(user=instance)
