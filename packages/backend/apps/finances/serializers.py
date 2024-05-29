import datetime

from django.conf import settings
from django.contrib import messages
from django.utils import timezone
from django.utils.translation import gettext as _
from djstripe import models as djstripe_models, enums as djstripe_enums
from drf_yasg.utils import swagger_serializer_method
from rest_framework import serializers, exceptions

from . import models, constants, utils
from .services import subscriptions, customers


class PaymentIntentSerializer(serializers.ModelSerializer):
    """**IMPORTANT:** Update this serializer with real products and prices created in Stripe"""

    product = serializers.ChoiceField(
        choices=(
            ('5', 'A'),
            ('10', 'B'),
            ('15', 'C'),
        ),
        required=True,
        write_only=True,
    )

    class Meta:
        model = djstripe_models.PaymentIntent
        fields = ('id', 'amount', 'currency', 'client_secret', 'product')
        read_only_fields = ('id', 'amount', 'currency', 'client_secret')

    def create(self, validated_data):
        request = self.context['request']

        (customer, _) = djstripe_models.Customer.get_or_create(request.tenant)
        amount = int(validated_data['product']) * 100
        payment_intent_response = djstripe_models.PaymentIntent._api_create(
            amount=amount,
            currency="usd",
            customer=customer.id,
            setup_future_usage="off_session",
        )
        return djstripe_models.PaymentIntent.sync_from_stripe_data(payment_intent_response)

    def update(self, instance: djstripe_models.PaymentIntent, validated_data):
        amount = int(validated_data['product']) * 100
        payment_intent_response = instance._api_update(amount=amount)
        return djstripe_models.PaymentIntent.sync_from_stripe_data(payment_intent_response)


class SetupIntentSerializer(serializers.ModelSerializer):
    class Meta:
        model = djstripe_models.SetupIntent
        fields = ('id', 'client_secret')
        read_only_fields = ('id', 'client_secret')

    def create(self, validated_data):
        request = self.context['request']

        (customer, _) = djstripe_models.Customer.get_or_create(request.tenant)
        setup_intent_response = djstripe_models.SetupIntent._api_create(
            customer=customer.id, payment_method_types=['card'], usage='off_session'
        )
        return djstripe_models.SetupIntent.sync_from_stripe_data(setup_intent_response)


class PaymentMethodSerializer(serializers.ModelSerializer):
    card = serializers.JSONField(read_only=True)
    billing_details = serializers.JSONField(read_only=True)

    class Meta:
        model = djstripe_models.PaymentMethod
        fields = ('id', 'type', 'card', 'billing_details')
        exclude_fields = ("id",)
        read_only_fields = fields
        swagger_schema_fields = {"properties": {key for key in fields if key not in [1, 2, 3]}}


class UpdateDefaultPaymentMethodSerializer(serializers.Serializer):
    def update(self, instance, validated_data):
        customer, _ = djstripe_models.Customer.get_or_create(self.context['request'].tenant)
        customers.set_default_payment_method(customer=customer, payment_method=instance)
        return instance


class SubscriptionItemProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Product
        fields = ('id', 'name')
        swagger_schema_fields = {"properties": {}}


class PriceSerializer(serializers.ModelSerializer):
    product = SubscriptionItemProductSerializer()

    class Meta:
        model = djstripe_models.Price
        fields = ('id', 'product', 'unit_amount')


class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = djstripe_models.Subscription
        fields = (
            'id',
            'status',
            'start_date',
            'current_period_end',
            'current_period_start',
            'trial_start',
            'trial_end',
        )
        read_only_fields = (
            'id',
            'status',
            'start_date',
            'current_period_end',
            'current_period_start',
            'trial_start',
            'trial_end',
        )


class SubscriptionSchedulePhaseItemSerializer(serializers.Serializer):
    price = serializers.SerializerMethodField()
    quantity = serializers.IntegerField()

    @swagger_serializer_method(serializer_or_field=PriceSerializer)
    def get_price(self, obj):
        # We check for existence of the price because of the stripe-mock limitations
        price = djstripe_models.Price.objects.filter(id=obj['price']).first()
        if not price:
            return None
        return PriceSerializer(price).data


class StripeTimestampField(serializers.DateTimeField):
    def to_representation(self, value):
        return super().to_representation(timezone.datetime.fromtimestamp(value, tz=datetime.timezone.utc))


class SubscriptionSchedulePhaseSerializer(serializers.Serializer):
    item = serializers.SerializerMethodField()
    start_date = StripeTimestampField()
    end_date = StripeTimestampField()
    trial_end = StripeTimestampField()

    @swagger_serializer_method(serializer_or_field=SubscriptionSchedulePhaseItemSerializer)
    def get_item(self, obj):
        return SubscriptionSchedulePhaseItemSerializer(obj['items'][0]).data


class TenantSubscriptionScheduleSerializer(serializers.ModelSerializer):
    subscription = SubscriptionSerializer(source='customer.subscription', read_only=True)
    default_payment_method = PaymentMethodSerializer(source='customer.default_payment_method', read_only=True)
    phases = serializers.SerializerMethodField()
    can_activate_trial = serializers.SerializerMethodField()
    price = serializers.SlugRelatedField(
        slug_field='id',
        queryset=djstripe_models.Price.objects.filter(
            product__name__in=[
                constants.MONTHLY_PLAN.name,
                constants.YEARLY_PLAN.name,
            ],
        ),
        write_only=True,
    )

    @swagger_serializer_method(serializer_or_field=SubscriptionSchedulePhaseSerializer(many=True))
    def get_phases(self, obj):
        phases = subscriptions.get_valid_schedule_phases(obj)
        return SubscriptionSchedulePhaseSerializer(phases, many=True).data

    @swagger_serializer_method(serializer_or_field=serializers.BooleanField)
    def get_can_activate_trial(self, instance: djstripe_models.SubscriptionSchedule):
        return utils.customer_can_activate_trial(instance.customer)

    def validate(self, attrs):
        customer = self.instance.customer
        can_activate_trial = utils.customer_can_activate_trial(customer)
        is_trialing = subscriptions.is_current_schedule_phase_trialing(schedule=self.instance)

        payment_method = customer.default_payment_method
        if payment_method is None:
            payment_method = (
                djstripe_models.PaymentMethod.objects.filter(customer=customer).order_by('-created').first()
            )

        if not is_trialing and not can_activate_trial and not payment_method:
            raise serializers.ValidationError(_('Customer has no payment method setup'), code='missing_payment_method')

        return {
            **attrs,
            'payment_method': payment_method,
            'can_activate_trial': can_activate_trial,
            'is_trialing': is_trialing,
        }

    def update(self, instance: djstripe_models.SubscriptionSchedule, validated_data):
        customer = instance.customer
        price = validated_data['price']
        payment_method = validated_data['payment_method']
        can_activate_trial = validated_data['can_activate_trial']
        is_trialing = validated_data['is_trialing']
        current_phase = subscriptions.get_current_schedule_phase(schedule=instance)

        if payment_method and customer.default_payment_method is None:
            customers.set_default_payment_method(customer=customer, payment_method=payment_method)

        if is_trialing:
            current_phase.pop('end_date', None)
            current_phase.pop('trial', None)
            current_phase['items'] = [{'price': price.id}]
            return subscriptions.update_schedule(instance, phases=[current_phase])

        if subscriptions.is_current_schedule_phase_plan(schedule=instance, plan_config=constants.FREE_PLAN):
            current_phase['end_date'] = 'now'

        next_phase = {'items': [{'price': price.id}]}
        if can_activate_trial:
            next_phase['trial_end'] = timezone.now() + timezone.timedelta(settings.SUBSCRIPTION_TRIAL_PERIOD_DAYS)

        updated_phases = [current_phase]
        if next_phase:
            updated_phases.append(next_phase)
        return subscriptions.update_schedule(instance, phases=updated_phases)

    class Meta:
        model = djstripe_models.SubscriptionSchedule
        fields = ('subscription', 'phases', 'can_activate_trial', 'price', 'default_payment_method')


class CancelTenantActiveSubscriptionSerializer(serializers.ModelSerializer):
    def validate(self, attrs):
        if subscriptions.is_current_schedule_phase_plan(schedule=self.instance, plan_config=constants.FREE_PLAN):
            raise serializers.ValidationError(
                _('Customer has no paid subscription to cancel'), code='no_paid_subscription'
            )

        return attrs

    def update(self, instance: djstripe_models.SubscriptionSchedule, validated_data):
        free_plan_price = models.Price.objects.get_by_plan(constants.FREE_PLAN)
        current_phase = subscriptions.get_current_schedule_phase(schedule=instance)
        next_phase = {'items': [{'price': free_plan_price.id}]}

        if subscriptions.is_current_schedule_phase_trialing(schedule=instance):
            current_phase['end_date'] = current_phase['trial_end']

        return subscriptions.update_schedule(instance, phases=[current_phase, next_phase])

    class Meta:
        model = djstripe_models.SubscriptionSchedule
        fields = ()


class AdminStripePaymentIntentRefundSerializer(serializers.Serializer):
    amount = serializers.IntegerField(write_only=True, label="Amount (in cents)", min_value=100)
    reason = serializers.ChoiceField(
        write_only=True,
        choices=(
            ('duplicate', 'Duplicate'),
            ('fraudulent', 'Fraudulent'),
            ('requested_by_customer', 'Requested By Customer'),
        ),
    )

    class Meta:
        fields = (
            'amount',
            'refund',
        )

    def validate(self, attrs):
        amount = attrs['amount'] / 100
        try:
            charge = djstripe_models.Charge.objects.get(
                payment_intent=self.instance, status=djstripe_enums.ChargeStatus.succeeded
            )
        except djstripe_models.Charge.DoesNotExist:
            raise exceptions.ValidationError({'amount': _('Successful charge does not exist')})

        amount_to_refund = charge._calculate_refund_amount(amount=amount)
        if amount_to_refund <= 0:
            raise exceptions.ValidationError({'amount': _('Charge has already been fully refunded')})

        return {
            **attrs,
            'amount': amount,
            'amount_to_refund': amount_to_refund,
            'charge': charge,
        }

    def update(self, instance: djstripe_models.PaymentIntent, validated_data):
        amount = validated_data['amount']
        reason = validated_data['reason']
        charge: djstripe_models.Charge = validated_data['charge']
        amount_to_refund = validated_data['amount_to_refund'] / 100

        charge.refund(amount=amount, reason=reason)
        messages.add_message(
            self.context['request'],
            messages.INFO,
            f'Successfully refunded {amount_to_refund} {charge.currency}',
        )

        return instance


class TenantChargeInvoiceItemSerializer(serializers.ModelSerializer):
    price = PriceSerializer()

    class Meta:
        model = djstripe_models.InvoiceItem
        fields = ('id', 'price')


class TenantChargeInvoiceSerializer(serializers.ModelSerializer):
    items = TenantChargeInvoiceItemSerializer(source='invoiceitems', many=True)

    class Meta:
        model = djstripe_models.Invoice
        fields = ('id', 'billing_reason', 'items')


class TenantChargeSerializer(serializers.ModelSerializer):
    invoice = TenantChargeInvoiceSerializer()
    billing_details = serializers.JSONField(read_only=True)
    payment_method_details = serializers.JSONField(read_only=True)

    class Meta:
        model = djstripe_models.Charge
        fields = (
            'id',
            'amount',
            'billing_details',
            'currency',
            'captured',
            'created',
            'paid',
            'payment_method_details',
            'status',
            'invoice',
        )
