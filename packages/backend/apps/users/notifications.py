import logging

from common import emails
from . import email_serializers

logger = logging.getLogger(__name__)


class UserEmail(emails.Email):
    def __init__(self, user, data=None):
        super().__init__(to=user.email, data=data)


class AccountActivationEmail(UserEmail):
    name = 'ACCOUNT_ACTIVATION'
    serializer_class = email_serializers.AccountActivationEmailSerializer


class PasswordResetEmail(UserEmail):
    name = 'PASSWORD_RESET'
    serializer_class = email_serializers.PasswordResetEmailSerializer
