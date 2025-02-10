from typing import Optional

import hashid_field
from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import models

from apps.content import models as content_models
from common.storages import UniqueFilePathGenerator
from common.models import TimestampedMixin, TenantDependentModelMixin

User = get_user_model()


class CrudDemoItem(TenantDependentModelMixin, models.Model):
    id = hashid_field.HashidAutoField(primary_key=True)
    name = models.CharField(max_length=255)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True)

    def __str__(self) -> str:
        return self.name

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.edited_by: Optional[User] = None


class ContentfulDemoItemFavorite(TimestampedMixin, models.Model):
    id = hashid_field.HashidAutoField(primary_key=True)
    item = models.ForeignKey(content_models.DemoItem, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    class Meta:
        unique_together = [['item', 'user']]

    def __str__(self) -> str:
        return str(self.id)


class DocumentDemoItem(models.Model):
    file = models.FileField(upload_to=UniqueFilePathGenerator("documents"))
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, related_name="documents"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return str(self.id)

    def delete(self, *args, **kwargs):
        self.file.delete()
        super().delete(*args, **kwargs)
