from typing import Optional


import boto3
from typing import TypedDict
from . import export
from ....models import User


class ExportedUserData(TypedDict):
    email: str
    export_url: str


class _ProcessUserDataExport:
    def __call__(self, user_ids: list[str], admin_email: str):
        entries = []
        email_events = []

        for user_id in user_ids:
            if user := self._get_user(user_id):
                entry = self._get_user_export_entry(user)
                email_events.append(emails.get_user_export_email_event(to=user.email, data=entry))
                entries.append(entry)

        if entries:
            email_events.append(emails.get_admin_export_email_event(to=admin_email, data=entries))
            self._send_export_emails(email_events)

    @staticmethod
    def _get_user(user_id: str) -> Optional[User]:
        try:
            user = User.objects.prefetch_related('profile','cruddemoitem_set','documents').get(id=user_id)
            return user
        except User.DoesNotExist:
            return None

    @staticmethod
    def _get_user_export_entry(user: User) -> ExportedUserData:
        export_user_archive = export.ExportUserArchive(user)
        return {"email": user.email, "export_url": export_user_archive.run()}

    @staticmethod
    def _send_export_emails(email_events: list):
        events = boto3.client('events', endpoint_url=settings.AWS_ENDPOINT_URL)
        events.put_events(Entries=email_events)


process_user_data_export = _ProcessUserDataExport()
