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
    - billing_email: Address used for billing purposes and it is provided to Stripe
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
        settings.AUTH_USER_MODEL,
        through='TenantMembership',
        related_name='tenants',
        blank=True,
        through_fields=('tenant', 'user'),
    )
    billing_email = models.EmailField(
        db_collation="case_insensitive",
        verbose_name="billing email address",
        max_length=255,
        unique=False,
        blank=True,
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

    @property
    def email(self):
        return self.billing_email if self.billing_email else self.creator.email

    @property
    def owners_count(self):
        """
        Calculate the total number of tenant owners for this tenant.
        Returns the count of tenant owners.
        """
        return self.members.filter(tenant_memberships__role=constants.TenantUserRole.OWNER).count()

    @property
    def owners(self):
        """
        Returns the list of Users with an owner role.
        """
        return self.members.filter(tenant_memberships__role=constants.TenantUserRole.OWNER).all()

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.__original_name = self.name


class TenantMembership(TimestampedMixin, models.Model):
    """
    Represents the membership of a user in a tenant. As well accepted as not accepted (invitations).

    Fields:
    - id: A unique identifier for the membership.
    - user: The user associated with the membership.
    - role: The role of the user in the tenant. Can be owner, admin or member.
    - tenant: The tenant to which the user belongs.
    - is_accepted: Indicates whether the membership invitation is accepted.
    - invitation_accepted_at: Timestamp when the invitation was accepted.
    - invitee_email_address: The email address of the invited user if not connected to an existing user.

    Constraints:
    - unique_non_null_user_and_tenant: Ensures the uniqueness of non-null user and tenant combinations.
    - unique_non_null_user_and_invitee_email_address: Ensures the uniqueness of non-null user and invitee email address
      combinations.
    """

    id: str = hashid_field.HashidAutoField(primary_key=True)
    # User - Tenant connection fields
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="tenant_memberships", null=True
    )
    creator: settings.AUTH_USER_MODEL = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="created_tenant_memberships"
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
        default="",
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
                condition=~Q(invitee_email_address__exact=""),
            ),
        ]

    def __str__(self):
        return f"{self.user.email} {self.tenant.name} {self.role}"
