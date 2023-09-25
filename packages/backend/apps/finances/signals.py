import logging

from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from stripe.error import AuthenticationError

from .services import subscriptions


logger = logging.getLogger(__name__)

User = get_user_model()


@receiver(post_save, sender=User)
def create_free_plan_subscription(sender, instance, created, **kwargs):
    if not settings.STRIPE_ENABLED:
        return

    if created:
        try:
            subscriptions.initialize_user(user=instance)
        except AuthenticationError as e:
            logger.error(msg=e._message, exc_info=e)
            return
        except Exception as e:
            raise e
