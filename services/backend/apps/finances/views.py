from djstripe import models as djstripe_models, enums as djstripe_enums
from rest_framework import mixins, viewsets, response, generics

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


class StripePaymentMethodViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    permission_classes = (policies.UserFullAccess,)
    queryset = djstripe_models.PaymentMethod.objects.all()
    serializer_class = serializers.PaymentMethodSerializer
    lookup_field = 'id'

    def get_queryset(self):
        return self.queryset.filter(customer__subscriber=self.request.user)


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
