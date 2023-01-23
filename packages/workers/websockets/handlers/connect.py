import json
import logging

import jwt
from hashids import Hashids

import settings
from dao.db.session import db_session
from userauth.models import User
from utils import monitoring
from .. import models, utils

monitoring.init()

logger = logging.getLogger()
logger.setLevel(logging.INFO)

hashids = Hashids(salt=settings.HASHID_SALT, min_length=7)


def get_token_from_cookie(cookie):
    cookies = cookie.split("; ")
    token = next((c[6:] for c in cookies if c.startswith("token=")), None)
    return token


def get_user_id_from_token(token):
    decoded_jwt = jwt.decode(token, settings.JWT_SECRET, algorithms="HS256")
    user_hashid = decoded_jwt.get("user_id")
    return hashids.decode(user_hashid)[0]


def handle(event, context):
    logger.info(json.dumps(event))

    connection_id = event["requestContext"]["connectionId"]
    cookie_header = event["headers"].get("Cookie", "")

    token = get_token_from_cookie(cookie_header)
    if not token:
        return utils.prepare_response("Token is missing.", 400)

    try:
        user_id = get_user_id_from_token(token)
    except jwt.ExpiredSignatureError:
        return utils.prepare_response("Signature has expired.", 400)

    with db_session() as session:
        user = session.query(User).filter_by(id=user_id).first()
        if not user:
            return utils.prepare_response("User doesn't exist.", 400)
        connection = models.WebSocketConnection(user=user, connection_id=connection_id)
        session.add(connection)

    return utils.prepare_response(connection_id)
