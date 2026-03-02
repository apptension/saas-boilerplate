from common import emails
from ...notifications import get_user_language
from . import email_serializers
from . import constants


class DataExportEmail(emails.Email):
    def __init__(self, to: str, data: dict, user=None):
        lang = get_user_language(user) if user else emails.DEFAULT_EMAIL_LANGUAGE
        super().__init__(to=to, data=data, lang=lang)


class UserDataExportEmail(DataExportEmail):
    name = constants.UserEmails.USER_EXPORT
    serializer_class = email_serializers.UserDataExportEmailSerializer


class AdminDataExportEmail(DataExportEmail):
    name = constants.UserEmails.USER_EXPORT_ADMIN
    serializer_class = email_serializers.AdminDataExportEmailSerializer
