from django.db import models


class TenantType(models.TextChoices):
    SIGN_UP = "sign_up", "Sign Up"
    ORGANIZATION = "organization", "Organization"


class TenantUserRole(models.TextChoices):
    OWNER = 'owner', 'Owner'
    ADMIN = 'admin', 'Administrator'
    MEMBER = 'member', 'Member'

