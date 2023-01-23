import json
import logging

from dao.db.session import db_session
from utils import monitoring
from . import services, client

monitoring.init()

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def synchronize_content(event, context):
    logger.info(json.dumps(event, indent=2))

    with db_session() as session:
        synchronizer = services.ContentfulSync(client=client.get_client(), session=session)
        synchronizer.sync()
