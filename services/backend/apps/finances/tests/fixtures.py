import pytest
import pytest_factoryboy
import stripe
from django.contrib.auth import get_user_model
from djstripe import models as djstripe_models

from . import factories
from .. import constants, models

User = get_user_model()

pytest_factoryboy.register(factories.CustomerFactory)
pytest_factoryboy.register(factories.BalanceTransactionFactory)
pytest_factoryboy.register(factories.ChargeFactory)
pytest_factoryboy.register(factories.PaymentIntentFactory)
pytest_factoryboy.register(factories.PaymentMethodFactory)
pytest_factoryboy.register(factories.PriceFactory)
pytest_factoryboy.register(factories.PlanFactory)
pytest_factoryboy.register(factories.ProductFactory)
pytest_factoryboy.register(factories.SubscriptionFactory)
pytest_factoryboy.register(factories.SubscriptionItemFactory)


@pytest.fixture(scope='function', autouse=True)
def djstripe_sync_method(mocker):
    def sync_from_stripe_data(data):
        return data._wrapped_instance

    mocker.patch('djstripe.models.StripeModel.sync_from_stripe_data', side_effect=sync_from_stripe_data)


@pytest.fixture()
def stripe_methods_factory(mocker):
    def fn(model, factory):
        def retrieve(id, **kwargs):
            instance = model.objects.get(id=id)

            def getitem(*args, **kwargs):
                return instance.__dict__.__getitem__(*args, **kwargs)

            stripe_instance = mocker.MagicMock()
            stripe_instance._wrapped_instance = instance
            stripe_instance.__getitem__.side_effect = getitem
            stripe_instance.request.return_value = stripe_instance
            return stripe_instance

        def create(**kwargs):
            kwargs.pop('api_key', None)
            kwargs.pop('idempotency_key', None)
            kwargs.pop('stripe_account', None)
            kwargs.pop('metadata', None)

            instance = factory(**kwargs)

            def getitem(*args, **kwargs):
                return instance.__dict__.__getitem__(*args, **kwargs)

            stripe_instance = mocker.MagicMock()
            stripe_instance._wrapped_instance = instance
            stripe_instance.__getitem__.side_effect = getitem
            stripe_instance.request.return_value = stripe_instance
            return stripe_instance

        return {'retrieve': retrieve, 'create': create}

    return fn


@pytest.fixture(scope='function', autouse=True)
def stripe_customer_mock(mocker, stripe_methods_factory, customer_factory):
    methods = stripe_methods_factory(models.Customer, customer_factory)

    def create(**kwargs):
        email = kwargs.pop('email')
        subscriber = User.objects.get(email=email)

        return methods['create'](subscriber=subscriber, **kwargs)

    mocker.patch('stripe.Customer.retrieve', side_effect=methods['retrieve'])
    mocker.patch('stripe.Customer.create', side_effect=create)


@pytest.fixture(scope='function', autouse=True)
def stripe_price_mock(mocker, stripe_methods_factory, price_factory):
    methods = stripe_methods_factory(models.Price, price_factory)
    mocker.patch('stripe.Price.retrieve', side_effect=methods['retrieve'])
    mocker.patch('stripe.Price.create', side_effect=methods['create'])


@pytest.fixture(scope='function', autouse=True)
def stripe_subscription_mock(mocker, stripe_methods_factory, subscription_factory):
    methods = stripe_methods_factory(models.Subscription, subscription_factory)

    def create(**kwargs):
        customer = kwargs.pop('customer', None)
        if isinstance(customer, str):
            kwargs['customer'] = models.Customer.objects.get(id=customer)

        return methods['create'](**kwargs)

    mocker.patch('stripe.Subscription.retrieve', side_effect=methods['retrieve'])
    mocker.patch('stripe.Subscription.create', side_effect=create)


@pytest.fixture(scope='function', autouse=True)
def stripe_charge_mock(mocker, stripe_methods_factory, charge_factory):
    methods = stripe_methods_factory(djstripe_models.Charge, charge_factory)

    def retrieve(**kwargs):
        stripe_instance = methods['retrieve'](**kwargs)
        stripe_instance.refund.return_value = stripe_instance
        stripe_instance.capture.return_value = stripe_instance
        return stripe_instance

    mocker.patch('stripe.Charge.retrieve', side_effect=retrieve)
    mocker.patch('stripe.Charge.create', side_effect=methods['create'])


@pytest.fixture(scope='function', autouse=True)
def free_plan_price(price_factory, plan_factory):
    price = price_factory(
        product__name=constants.FREE_PLAN.name,
        unit_amount=constants.FREE_PLAN.initial_price.unit_amount,
        currency=constants.FREE_PLAN.initial_price.currency,
        recurring=constants.FREE_PLAN.initial_price.recurring,
    )

    plan_factory(
        id=price.id,
        product=price.product,
        amount=constants.FREE_PLAN.initial_price.unit_amount,
        currency=constants.FREE_PLAN.initial_price.currency,
    )

    return price


@pytest.fixture(scope='function', autouse=True)
def monthly_plan_price(price_factory, plan_factory):
    price = price_factory(
        product__name=constants.MONTHLY_PLAN.name,
        unit_amount=constants.MONTHLY_PLAN.initial_price.unit_amount,
        currency=constants.MONTHLY_PLAN.initial_price.currency,
        recurring=constants.MONTHLY_PLAN.initial_price.recurring,
    )

    plan_factory(
        id=price.id,
        product=price.product,
        amount=constants.MONTHLY_PLAN.initial_price.unit_amount,
        currency=constants.MONTHLY_PLAN.initial_price.currency,
    )

    return price


@pytest.fixture(scope='function', autouse=True)
def yearly_plan_price(price_factory, plan_factory):
    price = price_factory(
        product__name=constants.YEARLY_PLAN.name,
        unit_amount=constants.YEARLY_PLAN.initial_price.unit_amount,
        currency=constants.YEARLY_PLAN.initial_price.currency,
        recurring=constants.YEARLY_PLAN.initial_price.recurring,
    )

    plan_factory(
        id=price.id,
        product=price.product,
        amount=constants.YEARLY_PLAN.initial_price.unit_amount,
        currency=constants.YEARLY_PLAN.initial_price.currency,
    )

    return price


@pytest.fixture(scope='function', autouse=True)
def stripe_proxy():
    stripe.api_base = "http://stripemock:12111"
