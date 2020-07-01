import json
from datetime import datetime

import boto3
from django.conf import settings


class Task:
    def __init__(self, name: str, source: str, event_bus_name=settings.WORKERS_EVENT_BUS_NAME):
        self.name = name
        self.source = source
        self.event_bus_name = event_bus_name

    def apply(self, data: dict):
        data["type"] = self.name

        client = boto3.client('events', endpoint_url=settings.AWS_EVENTS_URL)
        client.put_events(
            Entries=[
                {
                    'Time': datetime.now(),
                    'Source': self.source,
                    'DetailType': self.name,
                    'Detail': json.dumps(data),
                    'EventBusName': self.event_bus_name,
                },
            ]
        )
