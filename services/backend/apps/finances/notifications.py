import logging
import random
from dataclasses import dataclass, asdict

from django.conf import settings
from djstripe import models as djstripe_models

from common import emails

logger = logging.getLogger(__name__)


@dataclass
class NotificationData:
    pass


def create(name, customer: djstripe_models.Customer, data: NotificationData = None):
    if data is None:
        data = NotificationData()

    if settings.DEBUG:
        logger.info(random.choice(["🍿", "🍉", "🌯", "🍔"]))
        logger.info({"customer": customer, "data": asdict(data)})

    email_task = emails.SendEmail(name)
    email_task.apply(to=customer.subscriber.email, data=data)
