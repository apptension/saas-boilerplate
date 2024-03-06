from django.db import models

from .constants import TenantType, TenantUserRole


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
        new_tenant.members.add(
            user, through_defaults={"tenant": new_tenant, "role": TenantUserRole.OWNER, "is_accepted": True}
        )

        return new_tenant, True


class TenantMembershipManager(models.Manager):
    def get_queryset(self):
        """
        Overrides the default get_queryset function to exclude invitations from the queryset.
        """
        return super().get_queryset().filter(is_accepted=True)

    def get_not_accepted(self):
        """
        Retrieves not accepted tenant invitations.
        """
        return super().get_queryset().filter(is_accepted=False)

    def get_all(self, **kwargs):
        """
        Retrieves all tenants memberships.
        """
        return super().get_queryset(**kwargs)

    def associate_invitations_with_user(self, email, user):
        """
        Associates not accepted tenant invitations with a user.

        This method finds not accepted tenant invitations with the specified email address
        and associates them with the provided user.
        """
        invitations = self.get_not_accepted().filter(invitee_email_address=email)
        invitations.update(user=user)
