import logging

from common import emails
from . import email_serializers

logger = logging.getLogger(__name__)


class TenantInvitationEmail(emails.Email):
    name = 'TENANT_INVITATION'
    serializer_class = email_serializers.TenantInvitationEmailSerializer
