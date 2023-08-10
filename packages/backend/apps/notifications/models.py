import datetime
from typing import Optional

import hashid_field
from django.conf import settings
from django.db import models
from django.utils import timezone

from . import managers


class Notification(models.Model):
    id: str = hashid_field.HashidAutoField(primary_key=True)
    user: settings.AUTH_USER_MODEL = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    type: str = models.CharField(max_length=64)

    created_at: datetime.datetime = models.DateTimeField(auto_now_add=True)
    read_at: Optional[datetime.datetime] = models.DateTimeField(null=True, blank=True)

    data: dict = models.JSONField(default=dict)

    issuer: settings.AUTH_USER_MODEL = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, related_name="notifications_issued"
    )

    objects = managers.NotificationManager()

    def __str__(self) -> str:
        return str(self.id)

    @property
    def is_read(self) -> bool:
        return self.read_at is not None

    @is_read.setter
    def is_read(self, val: bool):
        self.read_at = timezone.now() if val else None
