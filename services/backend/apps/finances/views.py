from djstripe import models as djstripe_models
from rest_framework import mixins, viewsets

from common.acl import policies
from . import serializers


class StripePaymentIntentViewSet(
    mixins.CreateModelMixin, mixins.RetrieveModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet
):
    permission_classes = (policies.UserFullAccess,)
    queryset = djstripe_models.PaymentIntent.objects.all()
    serializer_class = serializers.PaymentIntentSerializer
    lookup_field = 'id'

    def get_queryset(self):
        return self.queryset.filter(customer__subscriber=self.request.user)


class StripeSetupIntentViewSet(mixins.CreateModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    permission_classes = (policies.UserFullAccess,)
    queryset = djstripe_models.SetupIntent.objects.all()
    serializer_class = serializers.SetupIntentSerializer
    lookup_field = 'id'

    def get_queryset(self):
        return self.queryset.filter(customer__subscriber=self.request.user)
