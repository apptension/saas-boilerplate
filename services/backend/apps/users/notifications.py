from dataclasses import dataclass, asdict
from django.conf import settings

import logging
import random

from common import emails
from . import models

logger = logging.getLogger(__name__)


@dataclass
class NotificationData:
    pass


@dataclass
class AccountActivationNotificationData(NotificationData):
    user_id: str
    token: str


@dataclass
class PasswordResetNotificationData(NotificationData):
    user_id: str
    token: str


def create(name, user: models.User, data: NotificationData):
    if settings.DEBUG:
        logger.info(random.choice(["🍿", "🍉", "🌯", "🍔"]))
        logger.info({"user": user, "data": asdict(data)})

    email_task = emails.SendEmail(name)
    email_task.apply(to=user.email, data=data)
