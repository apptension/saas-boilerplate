import json
import logging

from utils import monitoring
from . import services

monitoring.init()

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def schedule_task(event, context):
    logger.info(json.dumps(event, indent=2))
    data = event.get("detail", event)
    services.schedule_function_invocation(id=data.get('id'), name=data.get("type"), input_data=data)


def execute_task(event, context):
    logger.info(json.dumps(event, indent=2))
    data = event.get("detail", event)
    services.send_event(data.get("entry"))
