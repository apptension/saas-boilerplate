import hashid_field

from django.db import models, IntegrityError, transaction
from django.conf import settings
from django.utils.text import slugify
from django.db.models import UniqueConstraint, Q

from . import constants
from .managers import TenantManager, TenantMembershipManager
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

    MAX_SAVE_ATTEMPTS = 10

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        counter = 0
        while counter < self.MAX_SAVE_ATTEMPTS:
            try:
                with transaction.atomic():
                    if not counter:
                        self.slug = slugify(self.name)
                    else:
                        self.slug = f"{slugify(self.name)}-{counter}"
                    super().save(*args, **kwargs)
                    break
            except IntegrityError as e:
                if 'duplicate key' in str(e).lower():
                    counter += 1
                else:
                    raise e

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.__original_name = self.name


class TenantMembership(TimestampedMixin, models.Model):
    # User - Tenant connection fields
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="tenant_memberships", null=True
    )
    role = models.CharField(choices=constants.TenantUserRole.choices, default=constants.TenantUserRole.OWNER)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name="user_memberships")

    # Invitation connected fields
    is_accepted = models.BooleanField(default=False)
    invitation_accepted_at = models.DateTimeField(null=True)
    invitee_email_address = models.EmailField(
        db_collation="case_insensitive",
        verbose_name="invitee email address",
        max_length=255,
        null=True,
    )

    objects = TenantMembershipManager()

    class Meta:
        constraints = [
            UniqueConstraint(
                name="unique_non_null_user_and_tenant", fields=["user", "tenant"], condition=Q(user__isnull=False)
            ),
            UniqueConstraint(
                name="unique_non_null_user_and_invitee_email_address",
                fields=["invitee_email_address", "tenant"],
                condition=Q(invitee_email_address__isnull=False),
            ),
        ]

    def __str__(self):
        return f"{self.user.email} {self.tenant.name} {self.role}"
