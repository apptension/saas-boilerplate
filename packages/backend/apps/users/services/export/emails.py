from common import emails
from . import email_serializers
from . import constants


class DataExportEmail(emails.Email):
    def __init__(self, to: str, data: dict):
        super().__init__(to=to, data=data)


class UserDataExportEmail(DataExportEmail):
    name = constants.UserEmails.USER_EXPORT
    serializer_class = email_serializers.UserDataExportEmailSerializer


class AdminDataExportEmail(DataExportEmail):
    name = constants.UserEmails.USER_EXPORT_ADMIN
    serializer_class = email_serializers.AdminDataExportEmailSerializer
