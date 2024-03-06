from django.contrib.auth import get_user_model

from ..models import Tenant, TenantMembership
from ..constants import TenantUserRole
from ..tokens import tenant_invitation_token

User = get_user_model()


def create_tenant_membership(
    tenant: Tenant,
    user: User = None,
    invitee_email_address: str = "",
    role: TenantUserRole = TenantUserRole.MEMBER,
    is_accepted: bool = False,
):
    membership = TenantMembership.objects.create(
        user=user, tenant=tenant, role=role, invitee_email_address=invitee_email_address, is_accepted=is_accepted
    )
    if not is_accepted:
        # TODO: Change printing token below to email notification
        print(  # noqa
            tenant_invitation_token.make_token(
                user_email=invitee_email_address if invitee_email_address else user.email, tenant_membership=membership
            )
        )

    return membership
