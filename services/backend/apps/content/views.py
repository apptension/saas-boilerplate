from rest_framework import generics

from common.acl import policies
from . import serializers


class ContentfulWebhook(generics.CreateAPIView):
    permission_classes = (policies.AnyoneFullAccess,)
    serializer_class = serializers.ContentfulWebhookSerializer
