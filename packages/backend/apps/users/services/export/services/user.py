from typing import Optional
from typing import TypedDict

from . import export
from .. import emails
from ....models import User


class ExportedUserData(TypedDict):
    email: str
    export_url: str


class _ProcessUserDataExport:
    def __call__(self, user_ids: list[str], admin_email: str):
        entries = []

        for user_id in user_ids:
            if user := self._get_user(user_id):
                entry = self._get_user_export_entry(user)
                emails.UserDataExportEmail(to=user.email, data={"data": entry}).send()
                entries.append(entry)

        if entries:
            emails.AdminDataExportEmail(to=admin_email, data={"data": entries}).send()

    @staticmethod
    def _get_user(user_id: str) -> Optional[User]:
        try:
            user = User.objects.prefetch_related('profile', 'cruddemoitem_set', 'documents').get(id=user_id)
            return user
        except User.DoesNotExist:
            return None

    @staticmethod
    def _get_user_export_entry(user: User) -> ExportedUserData:
        export_user_archive = export.ExportUserArchive(user)
        return {"email": user.email, "export_url": export_user_archive.run()}


process_user_data_export = _ProcessUserDataExport()
