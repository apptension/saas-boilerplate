from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from common.acl import policies
from . import models, serializers


class CrudDemoItemViewSet(viewsets.ModelViewSet):
    queryset = models.CrudDemoItem.objects.all()
    serializer_class = serializers.CrudDemoItemSerializer
    permission_classes = (policies.IsAuthenticatedFullAccess,)


class ContentfulDemoItemFavoriteViewSet(viewsets.GenericViewSet):
    permission_classes = (policies.IsAuthenticatedFullAccess,)
    serializer_class = serializers.ContentfulDemoItemFavoriteSerializer

    @action(detail=True, methods=['post', 'delete'])
    def favorite(self, request, pk=None):
        if request.method == 'POST':
            return self.create_favorite(pk)
        elif request.method == 'DELETE':
            return self.remove_favorite(pk)

        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def create_favorite(self, pk=None):
        serializer = self.get_serializer(data={'item': pk})
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(status=status.HTTP_201_CREATED, data=serializer.data)

    def remove_favorite(self, pk=None):
        instance = models.ContentfulDemoItemFavorite.objects.get(item=pk, user=self.request.user)
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
