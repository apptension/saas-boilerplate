from hashid_field import rest as hidrest
from rest_framework import serializers

from . import models


class UpdateNotificationSerializer(serializers.ModelSerializer):
    id = hidrest.HashidSerializerCharField(
        source_field="notifications.Notification.id", source="notification.id", read_only=True
    )
    is_read = serializers.BooleanField(required=False)

    def update(self, instance: models.Notification, validated_data: dict):
        is_read = validated_data["is_read"]
        if is_read != instance.is_read:
            instance.is_read = is_read
            instance.save(update_fields=["read_at"])
        return instance

    class Meta:
        model = models.Notification
        fields = ("id", "is_read")
