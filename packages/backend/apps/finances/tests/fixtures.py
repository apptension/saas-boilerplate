import pytest
import pytest_factoryboy
import stripe
from django.contrib.auth import get_user_model
from djstripe.models import Account

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
pytest_factoryboy.register(factories.RefundFactory)


@pytest.fixture(autouse=True)
def mock_init_user(mocker):
    mocker.patch('apps.finances.services.subscriptions.initialize_tenant')


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
def stripe_mock_fixture_product_default_price(price_factory):
    """
    stripe-mock v0.128.0 introduces "default_price" field in returned product fixture. In some cases the tests may fail,
    if the Price object with this id does not exist in database. Adding it manually to avoid that issue. The hardcoded
    ID may need to be changed when the Stripe-mock is updated to the newer version.
    """
    return price_factory(id="price_1NapVeJr3d0nrouD2gX5mHOY")


@pytest.fixture(scope='function', autouse=True)
def stripe_find_owner_account_monkey_patch():
    """
    dj-stripe v2.7.0 restored checking for owner of an Account object. Stripe-mock returns different account ID on
    every call, what leads to infinite loop of fetching accounts from Stripe-mock. This monkey patch restores old
    _find_owner_account functionality of the Account model.
    """

    def _find_owner_account(cls, data, api_key):
        return None

    Account._find_owner_account = classmethod(_find_owner_account)


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
