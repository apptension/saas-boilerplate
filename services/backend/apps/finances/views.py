from djstripe import models as djstripe_models
from rest_framework import mixins, viewsets

from common.acl import policies
from . import serializers


class StripeSetupIntentViewSet(mixins.CreateModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    permission_classes = (policies.UserFullAccess,)
    queryset = djstripe_models.SetupIntent.objects.all()
    serializer_class = serializers.SetupIntentSerializer
    lookup_field = 'id'

    def get_queryset(self):
        return self.queryset.filter(customer__subscriber=self.request.user)
