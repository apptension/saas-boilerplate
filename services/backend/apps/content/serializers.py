from rest_framework import serializers

from . import tasks


class ContentfulWebhookSerializer(serializers.Serializer):
    def create(self, obj):
        sync_task = tasks.ContentfulSync('complete')
        sync_task.apply()
        return {}
