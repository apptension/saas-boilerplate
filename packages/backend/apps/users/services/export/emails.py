from common.emails import get_send_email_event
from userauth.constants import UserEmails
from userauth.types import ExportedUserData


def get_user_export_email_event(to: str, data: ExportedUserData):
    return get_send_email_event(detail_type=UserEmails.USER_EXPORT.value, data={"to": to, "data": data})


def get_admin_export_email_event(to: str, data: list[ExportedUserData]):
    return get_send_email_event(detail_type=UserEmails.USER_EXPORT_ADMIN.value, data={"to": to, "data": data})
