import datetime
import uuid

import factory
from django.utils import timezone
from djstripe import models as djstripe_models, enums

from apps.multitenancy.tests import factories as multitenancy_factories
from .. import models, constants


class CustomerFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = djstripe_models.Customer
        django_get_or_create = ('id', 'subscriber')

    id = factory.Faker('uuid4')
    livemode = False
    currency = 'usd'
    tax_exempt = enums.CustomerTaxExempt.none
    subscriber = factory.SubFactory(multitenancy_factories.TenantFactory)
    email = factory.LazyAttribute(lambda obj: obj.subscriber.email)


class PaymentIntentFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = djstripe_models.PaymentIntent
        django_get_or_create = ('id',)

    id = factory.Faker('uuid4')
    livemode = False
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


class BalanceTransactionFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = djstripe_models.BalanceTransaction
        django_get_or_create = ('id',)

    id = factory.Faker('uuid4')
    livemode = False
    amount = factory.Faker('pyint', min_value=1000, max_value=9999)
    available_on = factory.Faker('future_datetime', tzinfo=timezone.get_current_timezone())
    currency = 'usd'
    fee = 0
    fee_details = {}
    net = factory.LazyAttribute(lambda obj: obj.amount)
    source = factory.Faker('pystr')
    reporting_category = enums.BalanceTransactionReportingCategory.charge
    status = enums.BalanceTransactionStatus.available
    type = enums.BalanceTransactionType.charge


class PaymentMethodFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = djstripe_models.PaymentMethod
        django_get_or_create = ('id',)

    id = factory.Faker('uuid4')
    livemode = False
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


class ChargeFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = djstripe_models.Charge
        django_get_or_create = ('id',)

    id = factory.Faker('uuid4')
    livemode = False
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
    calculated_statement_descriptor = factory.Faker('text', max_nb_chars=22)
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


class ProductFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = models.Product
        django_get_or_create = ('id',)

    id = factory.Faker('uuid4')
    livemode = False
    name = factory.Faker('pystr')
    type = enums.ProductType.service


class PriceFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = djstripe_models.Price
        django_get_or_create = ('id',)

    id = factory.Faker('uuid4')
    livemode = False
    active = True
    currency = 'usd'
    product = factory.SubFactory(ProductFactory)
    type = enums.PriceType.one_time


class PlanFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = djstripe_models.Plan
        django_get_or_create = ('id',)

    id = factory.Faker('uuid4')
    livemode = False
    active = True
    currency = 'usd'
    product = factory.SubFactory(ProductFactory)


class SubscriptionItemFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = djstripe_models.SubscriptionItem

    id = factory.Faker('uuid4')
    livemode = False
    price = factory.SubFactory(PriceFactory)
    quantity = 1


class SubscriptionFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = djstripe_models.Subscription
        django_get_or_create = ('id',)

    id = factory.Faker('uuid4')
    livemode = False
    collection_method = enums.InvoiceCollectionMethod.charge_automatically
    start_date = datetime.datetime.now(tz=datetime.timezone.utc)
    trial_start = None
    trial_end = None
    current_period_start = factory.LazyAttribute(lambda o: o.start_date)
    current_period_end = factory.LazyAttribute(lambda o: o.current_period_start + +datetime.timedelta(30))

    customer = factory.SubFactory(CustomerFactory)
    status = enums.SubscriptionStatus.active

    @factory.post_generation
    def items(self, create, extracted, **kwargs):
        if not create:
            return

        if extracted:
            for item in extracted:
                djstripe_models.SubscriptionItem.objects.create(
                    id=item.get('id', uuid.uuid4()),
                    price=djstripe_models.Price.objects.get(id=item['price']),
                    plan=djstripe_models.Plan.objects.get(id=item['price']),
                    subscription=self,
                    quantity=item.get('quantity', 1),
                )

    class Params:
        trialing = factory.Trait(
            status=enums.SubscriptionStatus.trialing,
            trial_start=datetime.datetime.now(tz=datetime.timezone.utc),
            trial_end=datetime.datetime.now(tz=datetime.timezone.utc) + datetime.timedelta(30),
        )

        trial_completed = factory.Trait(
            status=enums.SubscriptionStatus.trialing,
            current_period_start=datetime.datetime.now(tz=datetime.timezone.utc) - datetime.timedelta(2),
            trial_start=datetime.datetime.now(tz=datetime.timezone.utc) - datetime.timedelta(2),
            trial_end=datetime.datetime.now(tz=datetime.timezone.utc) - datetime.timedelta(1),
        )


class SubscriptionScheduleFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = djstripe_models.SubscriptionSchedule
        django_get_or_create = ('id',)

    id = factory.Faker('uuid4')
    livemode = False
    customer = factory.SubFactory(CustomerFactory)
    end_behavior = enums.SubscriptionScheduleEndBehavior.release
    status = enums.SubscriptionScheduleStatus.active

    @factory.post_generation
    def phases(self, create, extracted, **kwargs):
        def unix_time(dt):
            epoch = datetime.datetime.utcfromtimestamp(0).replace(tzinfo=datetime.timezone.utc)
            return int((dt - epoch).total_seconds())

        if not create:
            return

        phases = extracted
        if phases is None:
            free_plan_price = models.Price.objects.get_by_plan(constants.FREE_PLAN)
            phases = [{'items': [{'price': free_plan_price.id}]}]

        phase, *rest_phases = phases
        for item in phase['items']:
            item['quantity'] = item.get('quantity', 1)

        subscription = SubscriptionFactory(customer=self.customer, **phase)
        phase['start_date'] = unix_time(subscription.start_date)
        phase['end_date'] = unix_time(subscription.current_period_end)

        phase['trial_end'] = None
        if subscription.trial_end:
            phase['trial_end'] = unix_time(subscription.trial_end)

        self.phases = [phase, *rest_phases]


class WebhookEventFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = djstripe_models.Event

    id = factory.Faker('uuid4')


class RefundFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = djstripe_models.Refund
        django_get_or_create = ('id',)

    id = factory.Faker('uuid4')
    livemode = False
    amount = factory.Faker('pyint', min_value=1000, max_value=9999)
    balance_transaction = factory.SubFactory(
        BalanceTransactionFactory,
        source=factory.LazyAttribute(lambda obj: obj.id),
        reporting_category=enums.BalanceTransactionReportingCategory.charge,
        type=enums.BalanceTransactionType.charge,
    )
    charge = factory.SubFactory(ChargeFactory, amount_refunded=factory.LazyAttribute(lambda obj: obj.amount))
    currency = 'usd'
    reason = enums.RefundReason.duplicate
    status = enums.RefundStatus.succeeded
