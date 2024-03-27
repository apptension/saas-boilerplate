from django.db import models


class TenantType(models.TextChoices):
    """
    DEFAULT is a tenant type created during user sign-up.
    It serves as the default tenant for them, ensuring that they always have at least one.
    ORGANIZATION is a tenant type for tenants created manually by the user for the purpose of inviting other members.
    """

    DEFAULT = "default", "Default"
    ORGANIZATION = "organization", "Organization"


class TenantUserRole(models.TextChoices):
    OWNER = "OWNER", "Owner"
    ADMIN = "ADMIN", "Administrator"
    MEMBER = "MEMBER", "Member"
