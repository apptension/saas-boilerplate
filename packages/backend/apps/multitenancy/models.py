import hashid_field

from django.db import models
from django.conf import settings
from django.utils.text import slugify

from . import constants
from .managers import TenantManager
from common.models import TimestampedMixin


class Tenant(TimestampedMixin, models.Model):
    id: str = hashid_field.HashidAutoField(primary_key=True)
    creator: settings.AUTH_USER_MODEL = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    name: str = models.CharField(max_length=100, unique=True)
    slug: str = models.SlugField(max_length=100, unique=True)
    type: str = models.CharField(choices=constants.TenantType.choices)
    members = models.ManyToManyField(
        settings.AUTH_USER_MODEL, through='TenantMembership', related_name='tenants', blank=True
    )

    objects = TenantManager()

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class TenantMembership(TimestampedMixin, models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="tenant_memberships")
    role = models.CharField(choices=constants.TenantUserRole.choices, default=constants.TenantUserRole.OWNER)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name="user_memberships")

    class Meta:
        unique_together = ('user', 'tenant')

    def __str__(self):
        return f"{self.user.email} {self.tenant.name} {self.role}"