from djstripe import models as djstripe_models, enums as djstripe_enums
from rest_framework import mixins, viewsets, response, generics
from rest_framework.decorators import action

from common.acl import policies
from . import serializers, constants
from .services import subscriptions


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

    def perform_destroy(self, instance):
        customer = instance.customer
        if customer.default_payment_method and customer.default_payment_method.id == instance.id:
            customer.default_payment_method = None
            customer.save()
        instance.detach()

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


class SubscriptionPlansListView(generics.ListAPIView):
    permission_classes = (policies.AnyoneFullAccess,)
    serializer_class = serializers.SubscriptionPlansListSerializer

    def get_queryset(self):
        return djstripe_models.Price.objects.filter(
            product__name__in=[
                constants.FREE_PLAN.name,
                constants.MONTHLY_PLAN.name,
                constants.YEARLY_PLAN.name,
            ]
        )


class UserChargeViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    permission_classes = (policies.UserFullAccess,)
    serializer_class = serializers.UserChargeSerializer

    def get_queryset(self):
        customer, _ = djstripe_models.Customer.get_or_create(self.request.user)
        return customer.charges.filter(status=djstripe_enums.ChargeStatus.succeeded)
