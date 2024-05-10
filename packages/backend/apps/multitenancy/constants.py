from enum import Enum
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
    """
    Predefined tenant user roles:
    - OWNER
    - ADMIN
    - MEMBER
    """

    OWNER = "OWNER", "Owner"
    ADMIN = "ADMIN", "Administrator"
    MEMBER = "MEMBER", "Member"


class Notification(Enum):
    TENANT_INVITATION_CREATED = "TENANT_INVITATION_CREATED"
    TENANT_INVITATION_ACCEPTED = "TENANT_INVITATION_ACCEPTED"
    TENANT_INVITATION_DECLINED = "TENANT_INVITATION_DECLINED"
