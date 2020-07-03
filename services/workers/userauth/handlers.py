import json

from dao.db.session import db_session
from userauth import models as ua_models
from utils.logging import logger


def hello(event, context):
    logger.info(json.dumps(event, indent=2))

    with db_session() as session:
        users = session.query(ua_models.User)

    return {"users": json.dumps([dict(id=user.id, email=user.email, is_active=user.is_active) for user in users])}
