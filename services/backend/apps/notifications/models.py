import hashid_field
from django.conf import settings
from django.db import models


class Notification(models.Model):
    id = hashid_field.HashidAutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    type = models.CharField(max_length=64)

    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True)

    data = models.JSONField(default=dict)
