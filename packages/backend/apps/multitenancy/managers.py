from django.db import models

from .constants import TenantType, TenantUserRole


class TenantManager(models.Manager):
    def get_or_create_user_sign_up_tenant(self, user):
        sign_up_tenant = self.filter(creator=user, type=TenantType.SIGN_UP).order_by('created').first()
        if sign_up_tenant:
            return sign_up_tenant, False

        new_tenant = self.create(creator=user, type=TenantType.SIGN_UP, name=str(user))
        new_tenant.members.add(user, role=TenantUserRole.OWNER)
        return new_tenant, True
