import pytest
from djstripe import models as djstripe_models

pytestmark = pytest.mark.django_db


class TestAllSubscriptionPlansQuery:
    ALL_SUBSCRIPTION_PLANS_QUERY = '''
        query  {
          allSubscriptionPlans {
            edges {
              node {
                pk
                unitAmount
                product {
                  pk
                  name
                }
              }
            }
          }
        }
    '''

    def assert_plan(self, result, price):
        assert result['pk'] == price.id
        assert result['product'] == {'pk': price.product.id, 'name': price.product.name}

    def test_returns_all_items(self, graphene_client, free_plan_price, monthly_plan_price, yearly_plan_price):
        executed = graphene_client.query(self.ALL_SUBSCRIPTION_PLANS_QUERY)

        assert executed["data"]
        assert executed["data"]["allSubscriptionPlans"]
        assert executed["data"]["allSubscriptionPlans"]["edges"]
        self.assert_plan(executed["data"]["allSubscriptionPlans"]["edges"][0]["node"], free_plan_price)
        self.assert_plan(executed["data"]["allSubscriptionPlans"]["edges"][1]["node"], monthly_plan_price)
        self.assert_plan(executed["data"]["allSubscriptionPlans"]["edges"][2]["node"], yearly_plan_price)


class TestActiveSubscriptionQuery:
    ACTIVE_SUBSCRIPTION_QUERY = '''
        query  {
          activeSubscription {
            subscription {
              pk
              status
              trialStart
              trialEnd
            }
            phases {
              startDate
              endDate
              trialEnd
              item {
                quantity
                price {
                  pk
                  unitAmount
                  product {
                    pk
                    name
                  }
                }
              }
            }
            canActivateTrial
            defaultPaymentMethod {
              pk
              type
              card
              billingDetails
            }
          }
        }
    '''

    def assert_response(self, response, schedule):
        subscription = schedule.customer.subscription

        assert response['subscription']['pk'] == subscription.id
        assert response['subscription']['status'].lower() == subscription.status

        default_payment_method = schedule.customer.default_payment_method
        if default_payment_method:
            assert response['defaultPaymentMethod']['pk'] == default_payment_method.id
        else:
            assert response['defaultPaymentMethod'] is None

        assert len(response['phases']) > 0
        for index, response_phase in enumerate(response['phases']):
            phase = schedule.phases[index]
            item = phase['items'][0]
            price = djstripe_models.Price.objects.get(id=item['price'])

            assert response_phase['item'] == {
                'quantity': item['quantity'],
                'price': {
                    'pk': price.id,
                    'unitAmount': price.unit_amount,
                    'product': {'pk': price.product.id, 'name': price.product.name},
                },
            }

    def test_return_error_for_unauthorized_user(self, graphene_client):
        executed = graphene_client.query(self.ACTIVE_SUBSCRIPTION_QUERY)

        assert executed["errors"]
        assert executed["errors"][0]["message"] == "permission_denied"

    def test_trial_fields_in_response_when_customer_already_activated_trial(
        self, graphene_client, subscription_schedule_factory, monthly_plan_price
    ):
        subscription_schedule = subscription_schedule_factory(
            phases=[{'items': [{'price': monthly_plan_price.id}], 'trialing': True}]
        )
        customer = subscription_schedule.customer
        graphene_client.force_authenticate(customer.subscriber)

        executed = graphene_client.query(self.ACTIVE_SUBSCRIPTION_QUERY)

        assert executed['data']['activeSubscription']['phases'][0]['trialEnd']
        assert executed['data']['activeSubscription']['subscription']['trialStart']
        assert executed['data']['activeSubscription']['subscription']['trialEnd']
        assert not executed['data']['activeSubscription']['canActivateTrial']

    def test_trial_fields_in_response_when_user_never_activated_it(self, graphene_client, subscription_schedule):
        user = subscription_schedule.customer.subscriber
        graphene_client.force_authenticate(user)

        executed = graphene_client.query(self.ACTIVE_SUBSCRIPTION_QUERY)

        response_phase = executed['data']['activeSubscription']['phases'][0]
        assert not response_phase['trialEnd']
        assert executed['data']['activeSubscription']['canActivateTrial']

    def test_return_active_subscription_data(self, graphene_client, subscription_schedule):
        user = subscription_schedule.customer.subscriber
        graphene_client.force_authenticate(user)

        executed = graphene_client.query(self.ACTIVE_SUBSCRIPTION_QUERY)

        self.assert_response(executed['data']['activeSubscription'], subscription_schedule)
