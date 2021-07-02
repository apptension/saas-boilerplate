import json
import logging

from dao.db.session import db_session
from .. import models, utils

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def handle(event, context):
    logger.info(json.dumps(event))

    connection_id = event["requestContext"]["connectionId"]

    with db_session() as session:
        session.query(models.WebSocketConnection).filter_by(connection_id=connection_id).delete()

    return utils.prepare_response(connection_id)
