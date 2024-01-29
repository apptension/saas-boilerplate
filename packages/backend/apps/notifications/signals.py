from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.websockets import utils
from . import models, constants, schema


@receiver(post_save, sender=models.Notification)
def notify_about_entry(sender, instance: models.Notification, created, update_fields, **kwargs):
    if created:
        schema.NotificationCreatedSubscription.broadcast(payload={'id': str(instance.id)}, group="group42")
