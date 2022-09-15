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


class TestChangeActiveSubscriptionMutation:
    CHANGE_ACTIVE_SUBSCRIPTION_MUTATION = '''
        mutation($input: ChangeActiveSubscriptionMutationInput!)  {
          changeActiveSubscription(input: $input) {
            subscriptionSchedule {
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
            }
          }
        }
    '''

    def test_change_active_subscription(self, graphene_client, subscription_schedule, monthly_plan_price):
        input = {'price': monthly_plan_price.id}
        user = subscription_schedule.customer.subscriber

        graphene_client.force_authenticate(user)
        executed = graphene_client.mutate(
            self.CHANGE_ACTIVE_SUBSCRIPTION_MUTATION,
            variable_values={'input': input},
        )

        assert executed['data']
        assert "errors" not in executed

    def test_change_when_user_has_no_payment_method_but_can_activate_trial(
        self, graphene_client, customer_factory, subscription_schedule_factory, free_plan_price, monthly_plan_price
    ):
        input = {'price': monthly_plan_price.id}
        customer = customer_factory(default_payment_method=None)
        user = customer.subscriber
        subscription_schedule_factory(customer=customer, phases=[{'items': [{'price': free_plan_price.id}]}])
        djstripe_models.PaymentMethod.objects.filter(customer=customer).delete()

        graphene_client.force_authenticate(user)
        executed = graphene_client.mutate(
            self.CHANGE_ACTIVE_SUBSCRIPTION_MUTATION,
            variable_values={'input': input},
        )

        assert executed['data']
        assert "errors" not in executed

    def test_return_error_on_change_if_customer_has_no_payment_method(
        self, graphene_client, customer_factory, monthly_plan_price, subscription_schedule_factory
    ):
        input = {'price': monthly_plan_price.id}
        customer = customer_factory(default_payment_method=None)
        user = customer.subscriber
        subscription_schedule_factory(
            customer=customer, phases=[{'items': [{'price': monthly_plan_price.id}], 'trial_completed': True}]
        )
        djstripe_models.PaymentMethod.objects.filter(customer=customer).delete()

        graphene_client.force_authenticate(user)
        executed = graphene_client.mutate(
            self.CHANGE_ACTIVE_SUBSCRIPTION_MUTATION,
            variable_values={'input': input},
        )

        assert len(executed["errors"]) == 1
        error = executed["errors"][0]
        assert error["path"] == ["changeActiveSubscription"]
        assert error["extensions"]["non_field_errors"] == [
            {'message': 'Customer has no payment method setup', 'code': 'missing_payment_method'}
        ]


class TestCancelActiveSubscriptionMutation:
    CANCEL_ACTIVE_SUBSCRIPTION_MUTATION = '''
        mutation($input: CancelActiveSubscriptionMutationInput!)  {
          cancelActiveSubscription(input: $input) {
            subscriptionSchedule {
              id
            }
          }
        }
    '''

    def test_return_error_for_unauthorized_user(self, graphene_client):
        executed = graphene_client.mutate(
            self.CANCEL_ACTIVE_SUBSCRIPTION_MUTATION,
            variable_values={'input': {}},
        )

        assert executed["errors"]
        assert executed["errors"][0]["message"] == "permission_denied"

    def test_return_error_if_customer_has_no_paid_subscription(self, graphene_client, subscription_schedule):
        graphene_client.force_authenticate(subscription_schedule.customer.subscriber)

        executed = graphene_client.mutate(
            self.CANCEL_ACTIVE_SUBSCRIPTION_MUTATION,
            variable_values={'input': {}},
        )

        assert len(executed["errors"]) == 1
        error = executed["errors"][0]
        assert error["path"] == ["cancelActiveSubscription"]
        assert error["extensions"]["non_field_errors"] == [
            {'message': 'Customer has no paid subscription to cancel', 'code': 'no_paid_subscription'}
        ]

    def test_cancel_trialing_subscription(self, graphene_client, subscription_schedule_factory, monthly_plan_price):
        subscription_schedule = subscription_schedule_factory(
            phases=[{'items': [{'price': monthly_plan_price.id}], 'trialing': True}]
        )
        graphene_client.force_authenticate(subscription_schedule.customer.subscriber)

        executed = graphene_client.mutate(
            self.CANCEL_ACTIVE_SUBSCRIPTION_MUTATION,
            variable_values={'input': {}},
        )

        assert executed['data']
        assert "errors" not in executed
