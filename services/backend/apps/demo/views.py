from rest_framework import viewsets

from common.acl import policies
from . import models, serializers


class CrudDemoItemViewSet(viewsets.ModelViewSet):
    queryset = models.CrudDemoItem.objects.all()
    serializer_class = serializers.CrudDemoItemSerializer
    permission_classes = (policies.IsAuthenticatedFullAccess,)
