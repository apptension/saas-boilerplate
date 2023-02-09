import logging

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
    user_ids = event.get("detail", {}).get("user_ids", [])

    with db_session() as session:
        entries = _process_user_data_export(session, user_ids)

    logger.info(entries)  # TODO: Send e-mail with generated export entries


def _process_user_data_export(session, user_ids) -> list[dict]:
    entries = []

    for user_id in user_ids:
        if user := session.get(User, hashid.decode(user_id)):
            user_data = export.export_user_data(user)
            user_data_obj_key = export.get_user_data_object_key(user_id)
            export.upload_user_data_to_s3(user_data, user_data_obj_key)

            entries.append({"user_id": user_id, "export_url": export.get_user_data_url(user_data_obj_key)})

    return entries
