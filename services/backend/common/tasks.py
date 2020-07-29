import json
from datetime import datetime

import boto3
from django.conf import settings


class Task:
    def __init__(self, name: str, source: str, event_bus_name=settings.WORKERS_EVENT_BUS_NAME):
        self.name = name
        self.source = source
        self.event_bus_name = event_bus_name

    def get_entries(self, data: dict):
        return [
            {
                'Time': datetime.now(),
                'Source': self.source,
                'DetailType': self.name,
                'Detail': json.dumps({"type": self.name, **data}),
                'EventBusName': self.event_bus_name,
            },
        ]

    def apply(self, data: dict):
        client = boto3.client('events', endpoint_url=settings.AWS_ENDPOINT_URL)
        client.put_events(Entries=self.get_entries(data))


class TaskPrinter(Task):
    def apply(self, data: dict):
        entries = self.get_entries(data)
        print(f"Put events: {entries=}")
