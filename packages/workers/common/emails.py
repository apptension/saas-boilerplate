import json
import uuid

import settings


def get_send_email_event(detail_type: str, data: dict) -> dict:
    return {
        'Source': 'backend.email',
        'DetailType': detail_type,
        'Detail': json.dumps(
            {
                "id": uuid.uuid4().hex,
                "type": detail_type,
                **data,
            }
        ),
        'EventBusName': settings.WORKERS_EVENT_BUS_NAME,
    }
