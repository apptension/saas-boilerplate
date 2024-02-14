from django.db import models

from .constants import TenantType


class TenantManager(models.Manager):
    def get_or_create_user_sign_up_tenant(self, user):
        """
        Description:
        Retrieves or creates a tenant for a given user to ensure there is always at least one tenant associated with the user.
        Parameters:
        - user (User): The user for whom the tenant is retrieved or created.

        Returns:
        Tenant: The associated or newly created tenant instance of SIGN_UP type.
        """
        sign_up_tenant = self.filter(creator=user, type=TenantType.SIGN_UP).order_by('created').first()
        if sign_up_tenant:
            return sign_up_tenant, False

        new_tenant = self.create(creator=user, type=TenantType.SIGN_UP, name=str(user))
        new_tenant.members.add(user)

        return new_tenant, True
