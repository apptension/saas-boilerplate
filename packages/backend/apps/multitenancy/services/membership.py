from graphql_relay import to_global_id
from django.contrib.auth import get_user_model

from ..models import Tenant, TenantMembership
from ..constants import TenantUserRole
from ..tokens import tenant_invitation_token
from ..notifications import TenantInvitationEmail, send_tenant_invitation_notification

User = get_user_model()


def create_tenant_membership(
    tenant: Tenant,
    user: User = None,
    creator: User = None,
    invitee_email_address: str = "",
    role: TenantUserRole = TenantUserRole.MEMBER,
    is_accepted: bool = False,
):
    membership = TenantMembership.objects.create(
        user=user,
        tenant=tenant,
        role=role,
        invitee_email_address=invitee_email_address,
        is_accepted=is_accepted,
        creator=creator,
    )
    if not is_accepted:
        token = tenant_invitation_token.make_token(
            user_email=invitee_email_address if invitee_email_address else user.email, tenant_membership=membership
        )
        global_tenant_membership_id = to_global_id("TenantMembershipType", membership.id)
        TenantInvitationEmail(
            to=user.email if user else invitee_email_address,
            data={'tenant_membership_id': global_tenant_membership_id, 'token': token},
        ).send()

        if user:
            send_tenant_invitation_notification(membership, global_tenant_membership_id, token)

    return membership
