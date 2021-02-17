import hashid_field
from django.conf import settings
from django.db import models

from apps.content import models as content_models


class CrudDemoItem(models.Model):
    id = hashid_field.HashidAutoField(primary_key=True)
    name = models.CharField(max_length=255)


class ContentfulDemoItemFavorite(models.Model):
    id = hashid_field.HashidAutoField(primary_key=True)
    item = models.ForeignKey(content_models.DemoItem, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [['item', 'user']]
