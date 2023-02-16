from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import joinedload, Session

import boto3
import settings
from utils import hashid
from . import export
from ..types import ExportedUserData
from ..models import User
from .. import emails


class _ProcessUserDataExport:
    def __call__(self, session: Session, user_ids: list[str], admin_email: str):
        entries = []
        email_events = []

        for user_id in user_ids:
            if user := self._get_user(session, user_id):
                entry = self._get_user_export_entry(user)
                email_events.append(emails.get_user_export_email_event(to=user.email, data=entry))
                entries.append(entry)

        if entries:
            email_events.append(emails.get_admin_export_email_event(to=admin_email, data=entries))
            self._send_export_emails(email_events)

    @staticmethod
    def _get_user(session: Session, user_id: str) -> Optional[User]:
        stmt = (
            select(User)
            .filter_by(id=hashid.decode(user_id))
            .options(joinedload(User.profile), joinedload(User.cruddemoitem_set), joinedload(User.documents))
        )
        return session.scalars(stmt).first()

    @staticmethod
    def _get_user_export_entry(user: User) -> ExportedUserData:
        export_user_archive = export.ExportUserArchive(user)
        return {"email": user.email, "export_url": export_user_archive.run()}

    @staticmethod
    def _send_export_emails(email_events: list):
        events = boto3.client('events', endpoint_url=settings.AWS_ENDPOINT_URL)
        events.put_events(Entries=email_events)


process_user_data_export = _ProcessUserDataExport()
