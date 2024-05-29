import logging

from dao.db.session import db_session
from .services import user as user_services

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def user_data_export(event, context):
    logger.info(event)

    event_detail = event.get("detail", {})
    user_ids = event_detail.get("user_ids", [])
    admin_email = event_detail.get("admin_email")

    with db_session() as session:
        user_services.process_user_data_export(session=session, user_ids=user_ids, admin_email=admin_email)
