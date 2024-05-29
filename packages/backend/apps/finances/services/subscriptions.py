import datetime

from django.utils import timezone
from djstripe import models as djstripe_models, enums as djstripe_enums

from .. import models, constants
from ..exceptions import UserOrCustomerNotDefined, SubscriptionAndPriceDefinedTogether, SubscriptionOrPriceNotDefined


def initialize_tenant(tenant):
    """
    Primary purpose for separating this code into its own function is the ability to mock it during tests so we utilise
    a schedule created by factories instead of relying on stripe-mock response

    :param user:
    :return:
    """
    price = models.Price.objects.get_by_plan(constants.FREE_PLAN)
    create_schedule(tenant=tenant, price=price)


def get_schedule(tenant=None, customer=None):
    if tenant:
        customer, _ = djstripe_models.Customer.get_or_create(tenant)
    if customer is None:
        raise UserOrCustomerNotDefined("Either user or customer must be defined")

    return customer.schedules.filter(status=djstripe_enums.SubscriptionScheduleStatus.active).first()


def create_schedule(
    subscription: djstripe_models.Subscription = None, price: djstripe_models.Price = None, tenant=None, customer=None
):
    if subscription and price:
        raise SubscriptionAndPriceDefinedTogether("Subscription and price can't be defined together")

    subscription_schedule_stripe_instance = None
    if price:
        if tenant:
            customer, _ = djstripe_models.Customer.get_or_create(tenant)
        if customer is None:
            raise UserOrCustomerNotDefined("Either user or customer must be defined")

        subscription_schedule_stripe_instance = djstripe_models.SubscriptionSchedule._api_create(
            customer=customer.id, start_date='now', end_behavior="release", phases=[{'items': [{'price': price.id}]}]
        )

    if subscription:
        if isinstance(subscription, djstripe_models.StripeModel):
            subscription = subscription.id

        subscription_schedule_stripe_instance = djstripe_models.SubscriptionSchedule._api_create(
            from_subscription=subscription
        )

    if subscription_schedule_stripe_instance is None:
        raise SubscriptionOrPriceNotDefined("Either subscription or price must be defined")

    return djstripe_models.SubscriptionSchedule.sync_from_stripe_data(subscription_schedule_stripe_instance)


def update_schedule(instance: djstripe_models.SubscriptionSchedule, **kwargs):
    subscription_schedule_stripe_instance = instance._api_update(**kwargs)
    return djstripe_models.SubscriptionSchedule.sync_from_stripe_data(subscription_schedule_stripe_instance)


def get_valid_schedule_phases(schedule: djstripe_models.SubscriptionSchedule):
    return [
        phase
        for phase in schedule.phases
        if timezone.datetime.fromtimestamp(phase['end_date'], tz=datetime.timezone.utc) > timezone.now()
    ]


def get_current_schedule_phase(schedule):
    phases = get_valid_schedule_phases(schedule)
    return phases[0]


def is_current_schedule_phase_plan(
    schedule: djstripe_models.SubscriptionSchedule, plan_config: constants.SubscriptionPlanConfig
):
    current_phase = get_current_schedule_phase(schedule)
    current_price_id = current_phase['items'][0]['price']
    current_price = djstripe_models.Price.objects.get(id=current_price_id)
    return current_price.product.name == plan_config.name


def is_current_schedule_phase_trialing(schedule: djstripe_models.SubscriptionSchedule):
    current_phase = get_current_schedule_phase(schedule)
    if not current_phase['trial_end']:
        return False

    trial_end = timezone.datetime.fromtimestamp(current_phase['trial_end'], tz=datetime.timezone.utc)
    return trial_end > timezone.now()
