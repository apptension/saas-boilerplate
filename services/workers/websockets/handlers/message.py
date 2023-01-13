import json
import logging
import uuid

from dao.db.session import db_session
from utils import monitoring
from .. import models, apigateway, utils

monitoring.init()

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def handle(event, context):
    logger.info(json.dumps(event))

    connection_id = event["requestContext"]["connectionId"]
    domain_name = event["requestContext"]["domainName"]
    operation = json.loads(event.get("body", "{}"))

    if operation.get("type") == "connection_init":
        apigateway.post_to_connection(
            domain_name,
            connection_id,
            {"id": str(uuid.uuid4()), "type": "connection_ack", "payload": {"con_id": connection_id}},
        )

    elif operation.get("type") == "subscribe":
        subscription_id = operation.get("id")
        payload = operation.get("payload", {})

        with db_session() as session:
            connection = session.query(models.WebSocketConnection).filter_by(connection_id=connection_id).first()
            if connection:
                subscription = models.GraphQLSubscription(
                    connection=connection,
                    relay_id=subscription_id,
                    operation_name=payload.get("operationName"),
                    query=payload.get("query"),
                    variables=payload.get("variables"),
                )
                session.add(subscription)

    elif operation.get("type") == "stop":
        subscription_id = operation.get("id")

        with db_session() as session:
            connection = session.query(models.WebSocketConnection).filter_by(connection_id=connection_id).first()
            if connection:
                session.query(models.GraphQLSubscription).filter_by(
                    connection=connection, relay_id=subscription_id
                ).delete()

    return utils.prepare_response(connection_id)
