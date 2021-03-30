import pytest
import callee
import datetime

pytestmark = pytest.mark.django_db


class TestCancelTrialSubscriptionOnPaymentFailure:
    event_type = 'invoice.payment_failed'

    def test_previously_trialing_subscription_is_canceled(
        self, webhook_event_factory, subscription_factory, monthly_plan_price, stripe_request
    ):
        start_date = datetime.datetime.now(tz=datetime.timezone.utc)

        subscription = subscription_factory(
            start_date=start_date,
            trial_end=start_date,
            items=[
                {
                    # The hardcoded ID is equal to the one returned from stripe-mock
                    # If the test fails after stripe-mock update you most likely need to change this to match their
                    # fixtures
                    'id': 'si_IyZyeAN1KSAd6Z',
                    'price': monthly_plan_price.id,
                }
            ],
        )

        webhook_event_factory(
            type=self.event_type,
            data={
                'object': {
                    'subscription': subscription.id,
                    'customer': subscription.customer.id,
                }
            },
        ).invoke_webhook_handlers()

        stripe_request.assert_any_call(
            'delete',
            callee.EndsWith(f'/subscriptions/{subscription.id}'),
            callee.Any(),
            None,
        )
