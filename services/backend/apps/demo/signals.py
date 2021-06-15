from django.db.models.signals import post_save
from django.dispatch import receiver

from . import models
from . import notifications


@receiver(post_save, sender=models.CrudDemoItem)
def notify_about_entry(sender, instance: models.CrudDemoItem, created, update_fields, **kwargs):
    if created:
        notifications.send_new_entry_created_notification(instance)
    else:
        notifications.send_entry_updated_notification(instance)
