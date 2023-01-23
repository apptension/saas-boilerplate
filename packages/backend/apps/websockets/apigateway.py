import json

import boto3
from django.conf import settings

from .models import WebSocketConnection
from .local_client import LocalWebsocketClient


def get_client():
    if settings.IS_LOCAL_DEBUG:
        return LocalWebsocketClient()
    return boto3.client('apigatewaymanagementapi', endpoint_url=settings.WEB_SOCKET_API_ENDPOINT_URL)


def post_to_connection(data, connection_id):
    client = get_client()
    try:
        client.post_to_connection(Data=json.dumps(data).encode(), ConnectionId=connection_id)
    except client.exceptions.GoneException:
        WebSocketConnection.objects.filter(connection_id=connection_id).delete()
