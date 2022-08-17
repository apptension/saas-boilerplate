import uuid

from rest_framework import serializers
from hashid_field import rest
from django.contrib import auth as dj_auth

from . import models, apigateway


class DebugConnectionCreateSerializer(serializers.Serializer):
    user_pk = rest.HashidSerializerCharField(source_field="users.User.id", source="user.id", write_only=True)
    connection_id = serializers.CharField(max_length=32, write_only=True)

    def validate(self, attrs):
        user = None
        try:
            user = dj_auth.get_user_model().objects.get(pk=attrs.pop("user")["id"])
        except dj_auth.get_user_model().DoesNotExist:
            pass

        return {**attrs, 'user': user}

    def create(self, validated_data):
        user = validated_data.pop('user')

        if user:
            ws_connection = models.WebSocketConnection(user=user, connection_id=validated_data["connection_id"])
            ws_connection.save()

        return {}


class DebugMessageSerializer(serializers.Serializer):
    connection_id = serializers.CharField()
    id = serializers.CharField(required=False)
    type = serializers.CharField()
    payload = serializers.DictField()

    def create(self, validated_data):
        operation_type = validated_data.get("type")
        payload = validated_data.get("payload")
        subscription_id = validated_data.get("id")
        connection_id = validated_data.get("connection_id")

        if operation_type == "connection_init":
            apigateway.post_to_connection(
                {"id": str(uuid.uuid4()), "type": "connection_ack", "payload": {"con_id": connection_id}},
                connection_id,
            )
        elif operation_type == "subscribe" or operation_type == "start":
            connection = models.WebSocketConnection.objects.filter(connection_id=connection_id).first()
            if connection:
                subscription = models.GraphQLSubscription(
                    connection=connection,
                    relay_id=subscription_id,
                    operation_name=payload.get("operationName"),
                    query=payload.get("query"),
                    variables=payload.get("variables"),
                )
                subscription.save()
        elif operation_type == "complete" or operation_type == "stop":
            models.GraphQLSubscription.filter(
                connection__connection_id=connection_id, relay_id=subscription_id
            ).delete()

        return connection_id
