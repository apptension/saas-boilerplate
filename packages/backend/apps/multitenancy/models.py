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
    name: str = models.CharField(max_length=100, unique=False)
    slug: str = models.SlugField(max_length=100, unique=True)
    type: str = models.CharField(choices=constants.TenantType.choices)
    members = models.ManyToManyField(
        settings.AUTH_USER_MODEL, through='TenantMembership', related_name='tenants', blank=True
    )

    objects = TenantManager()

    __original_name = None

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug or self.name != self.__original_name:
            base_slug = slugify(self.name)
            unique_slug = base_slug
            counter = 1
            while Tenant.objects.filter(slug=unique_slug).exists():
                unique_slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = unique_slug

        super().save(*args, **kwargs)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.__original_name = self.name


class TenantMembership(TimestampedMixin, models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="tenant_memberships")
    role = models.CharField(choices=constants.TenantUserRole.choices, default=constants.TenantUserRole.OWNER)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name="user_memberships")

    class Meta:
        unique_together = ('user', 'tenant')

    def __str__(self):
        return f"{self.user.email} {self.tenant.name} {self.role}"
