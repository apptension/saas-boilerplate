import json
import logging

import boto3
from dao.db.session import db_session
from . import models

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def post_to_connection(domain_name, connection_id, body):
    client = boto3.client('apigatewaymanagementapi', endpoint_url=f"https://{domain_name}/ws")
    logger.info(f"Posting to connection: {json.dumps(body)}")
    try:
        client.post_to_connection(Data=json.dumps(body).encode(), ConnectionId=connection_id)
    except client.exceptions.GoneException:
        with db_session() as session:
            connection = session.query(models.WebSocketConnection).filter_by(connection_id=connection_id).first()
            session.delete(connection)
