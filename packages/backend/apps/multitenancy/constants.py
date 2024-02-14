from django.db import models


class TenantType(models.TextChoices):
    """
    DEFAULT is a tenant type created during user sign up.
    It's default tenant for user to ensure that user always have at least one.
    ORGANIZATION is a tenant type for tenants created by user manually for purposes of inviting other members.
    """

    DEFAULT = "default", "Default"
    ORGANIZATION = "organization", "Organization"


class TenantUserRole(models.TextChoices):
    OWNER = 'owner', 'Owner'
    ADMIN = 'admin', 'Administrator'
    MEMBER = 'member', 'Member'
