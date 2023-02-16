import logging

from sqlalchemy import select
from sqlalchemy.orm import joinedload

import boto3
import settings
from dao.db.session import db_session
from utils import hashid
from .models import User
from .services import export

events = boto3.client('events', endpoint_url=settings.AWS_ENDPOINT_URL)
logger = logging.getLogger()
logger.setLevel(logging.INFO)


def user_data_export(event, context):
    logger.info(f"Event: {event.get('detail')}")
    user_ids = event.get("detail", {}).get("user_ids", [])

    with db_session() as session:
        entries = _process_user_data_export(session, user_ids)

    logger.info(f"Entries: {entries}")  # TODO: Send e-mail with generated export entries


def _process_user_data_export(session, user_ids) -> list[dict]:
    entries = []

    for user_id in user_ids:
        stmt = (
            select(User)
            .filter_by(id=hashid.decode(user_id))
            .options(joinedload(User.profile), joinedload(User.cruddemoitem_set), joinedload(User.documents))
        )
        if user := session.scalars(stmt).first():
            user_archive_exporter = export.ExportUserArchive(user)
            entries.append({"user_id": user_id, "export_url": user_archive_exporter.run()})

    return entries
