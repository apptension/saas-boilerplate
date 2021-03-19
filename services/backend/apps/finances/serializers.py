import datetime

import pytz
from django.conf import settings
from django.contrib import messages
from django.utils import timezone
from django.utils.translation import gettext as _
from djstripe import models as djstripe_models, enums as djstripe_enums
from drf_yasg.utils import swagger_serializer_method
from rest_framework import serializers, exceptions

from . import models, constants, utils
from .services import subscriptions


class PaymentIntentSerializer(serializers.ModelSerializer):
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

        (customer, _) = djstripe_models.Customer.get_or_create(request.user)
        amount = int(validated_data['product']) * 100
        payment_intent_response = djstripe_models.PaymentIntent._api_create(
            amount=amount,
            currency="pln",
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

        (customer, _) = djstripe_models.Customer.get_or_create(request.user)
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
        read_only_fields = fields


class SubscriptionItemProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Product
        fields = ('id', 'name')


class SubscriptionPlansListSerializer(serializers.ModelSerializer):
    product = SubscriptionItemProductSerializer()

    class Meta:
        model = djstripe_models.Price
        fields = ('id', 'product', 'unit_amount')
        read_only_fields = fields


class SubscriptionItemPriceSerializer(serializers.ModelSerializer):
    product = SubscriptionItemProductSerializer()

    class Meta:
        model = djstripe_models.Price
        fields = ('id', 'product', 'unit_amount')


class SubscriptionItemSerializer(serializers.ModelSerializer):
    price = SubscriptionItemPriceSerializer()

    class Meta:
        model = djstripe_models.SubscriptionItem
        fields = ('id', 'price', 'quantity')


class UserActiveSubscriptionSerializer(serializers.ModelSerializer):
    default_payment_method = PaymentMethodSerializer(read_only=True)
    item = SubscriptionItemSerializer(source='items.first', read_only=True)
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
    can_activate_trial = serializers.SerializerMethodField()

    @swagger_serializer_method(serializer_or_field=serializers.BooleanField)
    def get_can_activate_trial(self, instance):
        return utils.customer_can_activate_trial(instance.customer)

    def validate(self, attrs):
        customer = self.instance.customer
        payment_method = self.instance.default_payment_method
        can_activate_trial = utils.customer_can_activate_trial(customer)

        if payment_method is None:
            payment_method = (
                djstripe_models.PaymentMethod.objects.filter(customer=customer).order_by('-created').first()
            )

        if not can_activate_trial and not payment_method:
            raise serializers.ValidationError(_('Customer has no payment method setup'), code='missing_payment_method')

        return {**attrs, 'payment_method': payment_method, 'can_activate_trial': can_activate_trial}

    def update(self, instance: djstripe_models.Subscription, validated_data):
        price = validated_data['price']
        subscription_item = instance.items.first()
        payment_method = validated_data['payment_method']
        can_activate_trial = validated_data['can_activate_trial']

        update_kwargs = {}
        if payment_method:
            update_kwargs['default_payment_method'] = payment_method.id

        if can_activate_trial:
            update_kwargs['trial_end'] = datetime.datetime.now(tz=pytz.UTC) + datetime.timedelta(
                settings.SUBSCRIPTION_TRIAL_PERIOD_DAYS
            )

        return subscriptions.update(
            instance,
            items=[{'id': subscription_item.id, 'price': price.id}],
            proration_behavior='create_prorations',
            cancel_at_period_end=False,
            **update_kwargs,
        )

    class Meta:
        model = djstripe_models.Subscription
        fields = (
            'id',
            'status',
            'start_date',
            'current_period_end',
            'current_period_start',
            'cancel_at',
            'cancel_at_period_end',
            'trial_start',
            'trial_end',
            'can_activate_trial',
            'default_payment_method',
            'item',
            'price',
        )
        read_only_fields = (
            'id',
            'status',
            'start_date',
            'current_period_end',
            'current_period_start',
            'trial_start',
            'trial_end',
            'cancel_at',
            'cancel_at_period_end',
            'default_payment_method',
            'item',
        )


class CancelUserActiveSubscriptionSerializer(serializers.ModelSerializer):
    def validate(self, attrs):
        customer = self.instance.customer
        free_plan_product, created = models.Product.objects.get_or_create_subscription_plan(
            plan_config=constants.FREE_PLAN
        )
        if customer.is_subscribed_to(product=free_plan_product):
            raise serializers.ValidationError(
                _('Customer has no paid subscription to cancel'), code='no_paid_subscription'
            )

        return attrs

    def update(self, instance: djstripe_models.Subscription, validated_data):
        if instance.trial_end and instance.trial_end > timezone.now():
            return subscriptions.update_to_free_plan(
                instance,
                trial_end='now',
                proration_behavior='none',
            )
        return instance.cancel(at_period_end=True)

    class Meta:
        model = djstripe_models.Subscription
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
