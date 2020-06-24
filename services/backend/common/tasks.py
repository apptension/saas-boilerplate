import json
from datetime import datetime

import boto3
from django.conf import settings


class Task:
    def __init__(self, name: str, source: str, event_bus_name=None):
        self.name = name
        self.source = source

        self.event_bus_name = event_bus_name
        if event_bus_name is None:
            self.event_bus_name = settings.WORKERS_EVENT_BUS_NAME

    def apply(self, data: dict):
        client = boto3.client('events')
        client.put_events(
            Entries=[
                {
                    'Time': datetime.now(),
                    'Source': self.source,
                    'DetailType': self.name,
                    'Detail': json.dumps(data),
                    'EventBusName': self.event_bus_name
                },
            ])


