import json
import logging
from datetime import datetime

import boto3
import requests
from django.conf import settings

logger = logging.getLogger(__name__)


class Task:
    def __init__(self, name: str, source: str, event_bus_name=settings.WORKERS_EVENT_BUS_NAME):
        self.name = name
        self.source = source
        self.event_bus_name = event_bus_name

    def get_entry(self, data: dict):
        return {
            'Time': datetime.now(),
            'Source': self.source,
            'DetailType': self.name,
            'Detail': json.dumps({"type": self.name, **data}),
            'EventBusName': self.event_bus_name,
        }

    def apply(self, data: dict):
        Task._apply(entry=self.get_entry(data))

    @classmethod
    def _apply(cls, entry):
        print({'apply': entry})
        client = boto3.client('events', endpoint_url=settings.AWS_ENDPOINT_URL)
        client.put_events(Entries=[entry])


class TaskLocalInvoke(Task):
    def apply(self, data: dict):
        entry = self.get_entry(data)
        response = requests.post(settings.TASKS_LOCAL_URL, json={**entry, 'Time': entry['Time'].isoformat()})
        logger.info(f"Invoking local task: {entry=}")
        logger.info(f"Invoke local response status code: {response.status_code}")


class TaskPrinter(Task):
    def apply(self, data: dict):
        entry = self.get_entry(data)
        logger.info(f"Put events: {entry=}")
