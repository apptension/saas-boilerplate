from django.shortcuts import get_object_or_404, redirect
from djstripe import models as djstripe_models
from rest_framework import response, views, renderers, status

from common.acl import policies
from . import serializers


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
            context={'request': self.request},
        )
        if not serializer.is_valid():
            return response.Response(
                {'serializer': serializer, 'payment_intent': instance}, status=status.HTTP_400_BAD_REQUEST
            )
        serializer.save()
        return redirect('admin:djstripe_paymentintent_change', object_id=pk)
