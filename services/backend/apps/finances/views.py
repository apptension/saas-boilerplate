from django.db import transaction
from django.http import Http404
from djstripe import models as djstripe_models, enums as djstripe_enums
from rest_framework import mixins, viewsets, response, generics
from rest_framework.decorators import action
from stripe.error import InvalidRequestError

from common.acl import policies
from . import serializers
from .services import subscriptions, customers


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


class StripePaymentMethodViewSet(mixins.ListModelMixin, mixins.DestroyModelMixin, viewsets.GenericViewSet):
    permission_classes = (policies.UserFullAccess,)
    queryset = djstripe_models.PaymentMethod.objects.all()
    serializer_class = serializers.PaymentMethodSerializer
    lookup_field = 'id'

    def get_queryset(self):
        return self.queryset.filter(customer__subscriber=self.request.user)

    def get_object(self):
        """
        Payment method is created by webhook yet sometimes the object is needed earlier (e.g. set_default action).
        """
        queryset = self.filter_queryset(self.get_queryset())
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        filter_kwargs = {self.lookup_field: self.kwargs[lookup_url_kwarg]}

        if not queryset.filter(**filter_kwargs).exists():
            try:
                api_response = djstripe_models.PaymentMethod(id=self.kwargs[lookup_url_kwarg]).api_retrieve()
                djstripe_models.PaymentMethod.sync_from_stripe_data(api_response)
            except InvalidRequestError:
                raise Http404

        obj = generics.get_object_or_404(queryset, **filter_kwargs)
        self.check_object_permissions(self.request, obj)
        return obj

    def perform_destroy(self, instance):
        customers.remove_payment_method(payment_method=instance)

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['post'], url_path='default')
    def set_default(self, request, id=None):
        payment_method = self.get_object()
        serializer = serializers.UpdateDefaultPaymentMethodSerializer(
            payment_method, data=request.data, context=self.get_serializer_context()
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return response.Response(serializer.data)


class UserActiveSubscriptionView(generics.RetrieveUpdateAPIView):
    permission_classes = (policies.UserFullAccess,)
    serializer_class = serializers.UserSubscriptionScheduleSerializer

    def get_object(self):
        return subscriptions.get_schedule(user=self.request.user)


class CancelUserActiveSubscriptionView(generics.GenericAPIView):
    permission_classes = (policies.UserFullAccess,)
    serializer_class = serializers.CancelUserActiveSubscriptionSerializer

    def post(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return response.Response(serializer.data)

    def get_object(self):
        return subscriptions.get_schedule(user=self.request.user)


class UserChargeViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    permission_classes = (policies.UserFullAccess,)
    serializer_class = serializers.UserChargeSerializer

    def get_queryset(self):
        customer, _ = djstripe_models.Customer.get_or_create(self.request.user)
        return customer.charges.filter(status=djstripe_enums.ChargeStatus.succeeded).order_by("-created")
