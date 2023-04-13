from django.conf import settings
from django.db import models


class WebSocketConnection(models.Model):
    user: settings.AUTH_USER_MODEL = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    connection_id: str = models.CharField(max_length=32)

    def __str__(self) -> str:
        return self.connection_id


class GraphQLSubscription(models.Model):
    connection: WebSocketConnection = models.ForeignKey(WebSocketConnection, on_delete=models.CASCADE)
    relay_id: str = models.CharField(max_length=36)
    operation_name: str = models.CharField(max_length=32)
    query: str = models.TextField()
    variables: dict = models.JSONField(default=dict, blank=True)

    def __str__(self) -> str:
        return self.relay_id
