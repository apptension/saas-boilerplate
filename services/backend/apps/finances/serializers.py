from djstripe import models as djstripe_models
from rest_framework import serializers


class PaymentIntentSerializer(serializers.ModelSerializer):
    product = serializers.ChoiceField(choices=(
        ('5', 'A'),
        ('10', 'B'),
        ('15', 'C'),
    ), required=True, write_only=True)

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
