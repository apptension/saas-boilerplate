import json
import logging
import uuid
from datetime import datetime

import boto3
import pytz
import requests
from django.conf import settings

logger = logging.getLogger(__name__)


class Task:
    def __init__(self, name: str, source: str, event_bus_name=settings.WORKERS_EVENT_BUS_NAME):
        self.name = name
        self.source = source
        self.event_bus_name = event_bus_name

    @staticmethod
    def make_entry(data: dict, source: str, detail_type: str, event_bus_name: str):
        return {
            'Source': source,
            'DetailType': detail_type,
            'Detail': json.dumps(
                {
                    "id": uuid.uuid4().hex,
                    "type": detail_type,
                    **data,
                }
            ),
            'EventBusName': event_bus_name,
        }

    def get_entry(self, data: dict):
        return Task.make_entry(data=data, source=self.source, detail_type=self.name, event_bus_name=self.event_bus_name)

    def apply(self, data: dict, due_date: datetime = None):
        task_entry = self.get_entry(data)

        if due_date is not None:
            task_entry = Task.make_entry(
                data={
                    'entry': task_entry,
                    'due_date': due_date.isoformat(),
                },
                event_bus_name=self.event_bus_name,
                source='backend.scheduler',
                detail_type='backend.scheduler',
            )

        Task._apply(entry=task_entry)

    @classmethod
    def _apply(cls, entry):
        client = boto3.client('events', endpoint_url=settings.AWS_ENDPOINT_URL)
        client.put_events(Entries=[entry])


class TaskLocalInvoke(Task):
    def apply(self, data: dict, due_date: datetime = None):
        if due_date is None:
            due_date = datetime.now(tz=pytz.utc)

        entry = self.get_entry(data)
        response = requests.post(
            settings.TASKS_LOCAL_URL, json={**entry, 'Time': datetime.now().isoformat()}, timeout=10
        )
        logger.info(f"Invoking local task: {entry=} at {due_date.isoformat()}")
        logger.info(f"Invoke local response status code: {response.status_code}")


class TaskPrinter(Task):
    def apply(self, data: dict, due_date=None):
        if due_date is None:
            due_date = datetime.now()

        entry = self.get_entry(data)
        logger.info(f"Put events: {entry=} at {due_date.isoformat()}")
