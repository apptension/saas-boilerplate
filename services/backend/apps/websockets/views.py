from rest_framework import generics, status
from rest_framework.response import Response

from common.acl import policies
from . import serializers, models


class DebugConnectionCreateView(generics.CreateAPIView):
    permission_classes = (policies.IsAnonymousFullAccess,)
    serializer_class = serializers.DebugConnectionCreateSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class DebugDisconnectionCreateView(generics.DestroyAPIView):
    permission_classes = (policies.IsAnonymousFullAccess,)
    queryset = models.WebSocketConnection.objects.all()
    lookup_field = 'connection_id'

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)


class DebugMessageView(generics.GenericAPIView):
    permission_classes = (policies.IsAnonymousFullAccess,)
    serializer_class = serializers.DebugMessageSerializer

    def post(self, request, connection_id, *args, **kwargs):
        serializer = self.get_serializer(data={"connection_id": connection_id, **request.data})
        serializer.is_valid(raise_exception=True)
        return Response(serializer.save(), status=status.HTTP_200_OK, headers={"Sec-WebSocket-Protocol": "graphql-ws"})
