import hashid_field

from django.db import models, IntegrityError, transaction
from django.conf import settings
from django.utils.text import slugify

from . import constants
from .managers import TenantManager
from common.models import TimestampedMixin


class Tenant(TimestampedMixin, models.Model):
    """
    Represents a tenant within the application.

    Fields:
    - id: A unique identifier for the tenant.
    - creator: The user who created the tenant.
    - name: The name of the tenant.
    - slug: A URL-friendly version of the name.
    - type: The type of the tenant.
    - members: Many-to-many relationship with users through TenantMembership.

    Methods:
    - save: Overrides the default save method to ensure unique slug generation based on the name field.

    Initialization:
    - __original_name: Private attribute to track changes to the name field during the instance's lifecycle.

    Slug Generation:
    - The save method ensures the generation of a unique slug for the tenant. If the name is modified or the slug is
      not provided, it generates a slug based on the name. In case of a name collision, a counter is appended to the
      base slug to ensure uniqueness.
    """

    id: str = hashid_field.HashidAutoField(primary_key=True)
    creator: settings.AUTH_USER_MODEL = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    name: str = models.CharField(max_length=100, unique=False)
    slug: str = models.SlugField(max_length=100, unique=True)
    type: str = models.CharField(choices=constants.TenantType.choices)
    members = models.ManyToManyField(
        settings.AUTH_USER_MODEL, through='TenantMembership', related_name='tenants', blank=True
    )

    objects = TenantManager()

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        counter = kwargs.pop("counter", 0)

        if not counter:
            self.slug = slugify(self.name)
        else:
            self.slug = f"{slugify(self.name)}-{counter}"

        try:
            with transaction.atomic():
                return super().save(*args, **kwargs)
        except IntegrityError:
            counter += 1
            kwargs["counter"] = counter
            return self.save(*args, **kwargs)

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
