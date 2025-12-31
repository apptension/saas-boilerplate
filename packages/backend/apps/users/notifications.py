import logging

from common import emails
from . import email_serializers

logger = logging.getLogger(__name__)


def get_user_language(user):
    """Get user's preferred language, with fallback to default."""
    try:
        if hasattr(user, 'profile') and user.profile and user.profile.language:
            return user.profile.language
    except Exception:
        pass
    return emails.DEFAULT_EMAIL_LANGUAGE


class UserEmail(emails.Email):
    def __init__(self, user, data=None):
        lang = get_user_language(user)
        super().__init__(to=user.email, data=data, lang=lang)


class AccountActivationEmail(UserEmail):
    name = 'ACCOUNT_ACTIVATION'
    serializer_class = email_serializers.AccountActivationEmailSerializer


class PasswordResetEmail(UserEmail):
    name = 'PASSWORD_RESET'
    serializer_class = email_serializers.PasswordResetEmailSerializer
