import factory

from djstripe import models as djstripe_models, enums
from apps.users.tests import factories as user_factories


class CustomerFactory(factory.DjangoModelFactory):
    class Meta:
        model = djstripe_models.Customer

    id = factory.Faker('uuid4')
    currency = 'usd'
    tax_exempt = enums.CustomerTaxExempt.none
    subscriber = factory.SubFactory(user_factories.UserFactory)


class PaymentIntentFactory(factory.DjangoModelFactory):
    class Meta:
        model = djstripe_models.PaymentIntent

    id = factory.Faker('uuid4')
    amount = factory.Faker('pyint', min_value=1000, max_value=9999)
    amount_capturable = 0
    amount_received = factory.LazyAttribute(lambda obj: obj.amount)
    capture_method = enums.CaptureMethod.automatic
    client_secret = factory.Faker('pystr')
    confirmation_method = enums.ConfirmationMethod.automatic
    currency = 'usd'
    customer = factory.SubFactory(CustomerFactory)
    payment_method_types = ['card']
    status = enums.PaymentIntentStatus.succeeded


class BalanceTransactionFactory(factory.DjangoModelFactory):
    class Meta:
        model = djstripe_models.BalanceTransaction

    id = factory.Faker('uuid4')
    amount = factory.Faker('pyint', min_value=1000, max_value=9999)
    available_on = factory.Faker('future_date')
    currency = 'usd'
    fee = 0
    fee_details = {}
    net = factory.LazyAttribute(lambda obj: obj.amount)
    source = factory.Faker('pystr')
    reporting_category = enums.BalanceTransactionReportingCategory.charge
    status = enums.BalanceTransactionStatus.available
    type = enums.BalanceTransactionType.charge


class PaymentMethodFactory(factory.DjangoModelFactory):
    class Meta:
        model = djstripe_models.PaymentMethod

    id = factory.Faker('uuid4')
    billing_details = {
        "address": {"city": None, "country": None, "line1": None, "line2": None, "postal_code": "61675", "state": None},
        "email": None,
        "name": "Jenny Rosen",
        "phone": None,
    }
    customer = factory.SubFactory(CustomerFactory)
    type = enums.PaymentMethodType.card
    card = {
        "brand": "visa",
        "checks": {"address_line1_check": None, "address_postal_code_check": "pass", "cvc_check": "pass"},
        "country": "US",
        "exp_month": 2,
        "exp_year": 2022,
        "fingerprint": "2Dw1MfetKVBfMIp1",
        "funding": "credit",
        "generated_from": None,
        "last4": "4242",
        "networks": {"available": ["visa"], "preferred": None},
        "three_d_secure_usage": {"supported": True},
        "wallet": None,
    }


class ChargeFactory(factory.DjangoModelFactory):
    class Meta:
        model = djstripe_models.Charge

    id = factory.Faker('uuid4')
    amount = factory.Faker('pyint', min_value=1000, max_value=9999)
    amount_captured = factory.LazyAttribute(lambda obj: obj.amount)
    amount_refunded = 0

    balance_transaction = factory.SubFactory(
        BalanceTransactionFactory,
        source=factory.LazyAttribute(lambda obj: obj.id),
        reporting_category=enums.BalanceTransactionReportingCategory.charge,
        type=enums.BalanceTransactionType.charge,
    )
    billing_details = {
        "address": {"city": None, "country": None, "line1": None, "line2": None, "postal_code": "61675", "state": None},
        "email": None,
        "name": "Jenny Rosen",
        "phone": None,
    }
    calculated_statement_descriptor = factory.Faker('name')
    captured = True
    currency = 'usd'
    customer = factory.SubFactory(CustomerFactory)
    payment_intent = factory.SubFactory(
        PaymentIntentFactory, customer=factory.LazyAttribute(lambda obj: obj.factory_parent.customer)
    )
    payment_method = factory.SubFactory(
        PaymentMethodFactory, customer=factory.LazyAttribute(lambda obj: obj.factory_parent.customer)
    )
    status = enums.ChargeStatus.succeeded

    class Params:
        failed = factory.Trait(
            amount_captured=0,
            balance_transaction=None,
            captured=False,
            status=enums.ChargeStatus.failed,
            failure_message='Your card has expired.',
            failure_code=enums.ApiErrorCode.expired_card,
            outcome={
                "network_status": "declined_by_network",
                "reason": "expired_card",
                "risk_level": "normal",
                "risk_score": 14,
                "seller_message": "The bank returned the decline code `expired_card`.",
                "type": "issuer_declined",
            },
            payment_intent=factory.SubFactory(
                PaymentIntentFactory, customer=factory.LazyAttribute(lambda obj: obj.factory_parent.customer)
            ),
        )
