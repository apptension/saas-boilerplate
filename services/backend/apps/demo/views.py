from rest_framework import viewsets

from . import models, serializers
from common.acl import policies


class CrudDemoItemViewSet(viewsets.ModelViewSet):
    queryset = models.CrudDemoItem.objects.all()
    serializer_class = serializers.CrudDemoItemSerializer
    permission_classes = (policies.IsAuthenticatedFullAccess,)
