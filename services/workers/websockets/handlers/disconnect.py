import json
import logging

from dao.db.session import db_session
from utils import monitoring
from .. import models, utils

monitoring.init()

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def handle(event, context):
    logger.info(json.dumps(event))

    connection_id = event["requestContext"]["connectionId"]

    with db_session() as session:
        connection = session.query(models.WebSocketConnection).filter_by(connection_id=connection_id).first()
        session.query(models.GraphQLSubscription).filter_by(connection=connection).delete()
        session.delete(connection)

    return utils.prepare_response(connection_id)
