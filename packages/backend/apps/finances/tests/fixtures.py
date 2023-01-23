import pytest
import pytest_factoryboy
import stripe
from django.contrib.auth import get_user_model

from . import factories
from .. import constants

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
pytest_factoryboy.register(factories.SubscriptionScheduleFactory)
pytest_factoryboy.register(factories.WebhookEventFactory)


@pytest.fixture(autouse=True)
def mock_init_user(mocker):
    mocker.patch('apps.finances.services.subscriptions.initialize_user')


@pytest.fixture(scope='function', autouse=True)
def free_plan_price(price_factory, plan_factory):
    price = price_factory(
        product__name=constants.FREE_PLAN.name,
        product__active=True,
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
        product__active=True,
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
        product__active=True,
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


@pytest.fixture(scope='function', autouse=True)
def stripe_request_client():
    from stripe.http_client import RequestsClient

    client = RequestsClient()
    stripe.default_http_client = client
    return client


@pytest.fixture(scope='function', autouse=True)
def stripe_request(mocker, stripe_request_client):
    return mocker.spy(stripe_request_client, 'request')
