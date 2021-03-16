from djstripe import models as djstripe_models, enums as djstripe_enums
from rest_framework import serializers, exceptions
from django.contrib import messages
from django.utils.translation import gettext as _

from . import models


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


class PaymentMethodSerializer(serializers.ModelSerializer):
    card = serializers.JSONField(read_only=True)

    class Meta:
        model = djstripe_models.PaymentMethod
        fields = ('id', 'type', 'card')
        read_only_fields = fields


class SubscriptionItemProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Product
        fields = ('id', 'name')


class SubscriptionItemPriceSerializer(serializers.ModelSerializer):
    product = SubscriptionItemProductSerializer()

    class Meta:
        model = models.Price
        fields = ('id', 'product', 'unit_amount')


class SubscriptionItemSerializer(serializers.ModelSerializer):
    price = SubscriptionItemPriceSerializer()

    class Meta:
        model = models.SubscriptionItem
        fields = ('id', 'price', 'quantity')


class ActiveSubscriptionSerializer(serializers.ModelSerializer):
    default_payment_method = PaymentMethodSerializer()
    item = SubscriptionItemSerializer(source='items.first')

    class Meta:
        model = models.Subscription
        fields = (
            'id',
            'status',
            'start_date',
            'current_period_end',
            'current_period_start',
            'default_payment_method',
            'item',
        )


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
