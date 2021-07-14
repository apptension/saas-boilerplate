import json
import logging

from dao.db.session import db_session
from utils import monitoring
from .. import utils
from ..connection import purge_connection

monitoring.init()

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def handle(event, context):
    logger.info(json.dumps(event))

    connection_id = event["requestContext"]["connectionId"]

    with db_session() as session:
        purge_connection(connection_id, session)

    return utils.prepare_response(connection_id)
