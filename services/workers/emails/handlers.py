import json
import logging

from . import sender

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def send_email(event, context):
    logger.info(json.dumps(event, indent=2))

    sender.send_email(data=event.get("detail", event))
