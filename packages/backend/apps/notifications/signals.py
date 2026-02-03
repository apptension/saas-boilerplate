import asyncio

from django.db.models.signals import post_save
from django.dispatch import receiver

from . import models, schema


def _is_in_async_context():
    """Check if we're in an async context."""
    try:
        asyncio.get_running_loop()
        return True
    except RuntimeError:
        return False


@receiver(post_save, sender=models.Notification)
def notify_about_entry(sender, instance: models.Notification, created, update_fields, **kwargs):
    if created:
        payload = {"id": str(instance.id)}
        group = str(instance.user.id)

        # Use broadcast_sync for synchronous contexts (like Celery workers)
        # Use broadcast_async for async contexts
        if _is_in_async_context():
            asyncio.create_task(schema.NotificationCreatedSubscription.broadcast_async(payload=payload, group=group))
        else:
            schema.NotificationCreatedSubscription.broadcast_sync(payload=payload, group=group)
