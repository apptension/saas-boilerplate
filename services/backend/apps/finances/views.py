from django.shortcuts import get_object_or_404, redirect
from djstripe import models as djstripe_models
from rest_framework import mixins, viewsets, response, views, renderers

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


class StripePaymentMethodViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    permission_classes = (policies.UserFullAccess,)
    queryset = djstripe_models.PaymentMethod.objects.all()
    serializer_class = serializers.PaymentMethodSerializer
    lookup_field = 'id'

    def get_queryset(self):
        return self.queryset.filter(customer__subscriber=self.request.user)


class AdminRefundView(views.APIView):
    renderer_classes = [renderers.TemplateHTMLRenderer]
    permission_classes = (policies.AdminFullAccess,)
    template_name = 'refund.html'

    def get(self, request, pk):
        instance = get_object_or_404(djstripe_models.PaymentIntent, pk=pk)
        serializer = serializers.AdminStripePaymentIntentRefundSerializer(instance)
        return response.Response({'serializer': serializer, 'payment_intent': instance})

    def post(self, request, pk):
        instance = get_object_or_404(djstripe_models.PaymentIntent, pk=pk)
        serializer = serializers.AdminStripePaymentIntentRefundSerializer(
            instance,
            data=request.data,
            context={
                'request': self.request,
            },
        )
        if not serializer.is_valid():
            return response.Response({'serializer': serializer, 'payment_intent': instance})
        serializer.save()
        return redirect('admin:djstripe_paymentintent_change', object_id=pk)
