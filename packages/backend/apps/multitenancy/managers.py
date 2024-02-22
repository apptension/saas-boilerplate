from django.db import models

from .constants import TenantType


class TenantManager(models.Manager):
    def get_or_create_user_default_tenant(self, user):
        """
        Description:
        Retrieves or creates a default tenant for a given user, ensuring that there is always at least one tenant
        instance associated with them.

        Parameters:
        - user (User): The user for whom the tenant is retrieved or created.

        Returns:
        Tenant: The associated or newly created tenant instance of SIGN_UP type.
        """
        default_tenant = self.filter(creator=user, type=TenantType.DEFAULT).order_by('created_at').first()
        if default_tenant:
            return default_tenant, False

        new_tenant = self.create(creator=user, type=TenantType.DEFAULT, name=str(user))
        new_tenant.members.add(user)

        return new_tenant, True
