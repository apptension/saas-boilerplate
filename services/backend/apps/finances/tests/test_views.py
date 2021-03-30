import callee
import pytest
from django.urls import reverse
from djstripe import models as djstripe_models
from rest_framework import status

from .utils import stripe_encode

pytestmark = pytest.mark.django_db


class TestSubscriptionPlanListView:
    def assert_plan(self, result, price):
        assert result['id'] == price.id
        assert result['product'] == {'id': price.product.id, 'name': price.product.name}

    def test_return_available_plans(self, api_client, free_plan_price, monthly_plan_price, yearly_plan_price):
        url = reverse('subscription-plans-list')

        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        self.assert_plan(response.data[0], free_plan_price)
        self.assert_plan(response.data[1], monthly_plan_price)
        self.assert_plan(response.data[2], yearly_plan_price)


class TestUserActiveSubscriptionView:
    def assert_response(self, response, schedule):
        subscription = schedule.customer.subscription

        assert response.data['subscription']['id'] == subscription.id
        assert response.data['subscription']['status'] == subscription.status

        default_payment_method = schedule.customer.default_payment_method
        if default_payment_method:
            assert response.data['default_payment_method']['id'] == default_payment_method.id
        else:
            assert response.data['default_payment_method'] is None

        assert len(response.data['phases']) > 0
        for index, response_phase in enumerate(response.data['phases']):
            phase = schedule.phases[index]
            item = phase['items'][0]
            price = djstripe_models.Price.objects.get(id=item['price'])

            assert response_phase['item'] == {
                'quantity': item['quantity'],
                'price': {
                    'id': price.id,
                    'unit_amount': price.unit_amount,
                    'product': {'id': price.product.id, 'name': price.product.name},
                },
            }

    def test_return_error_for_unauthorized_user(self, api_client):
        url = reverse('user-active-subscription')
        response = api_client.post(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_trial_fields_in_response_when_customer_already_activated_trial(
        self, api_client, subscription_schedule_factory, monthly_plan_price
    ):
        subscription_schedule = subscription_schedule_factory(
            phases=[{'items': [{'price': monthly_plan_price.id}], 'trialing': True}]
        )
        customer = subscription_schedule.customer

        api_client.force_authenticate(customer.subscriber)
        url = reverse('user-active-subscription')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK, response.data
        assert response.data['phases'][0]['trial_end']
        assert response.data['subscription']['trial_start']
        assert response.data['subscription']['trial_end']
        assert not response.data['can_activate_trial']

    def test_trial_fields_in_response_when_user_never_activated_it(self, api_client, subscription_schedule):
        user = subscription_schedule.customer.subscriber
        api_client.force_authenticate(user)
        url = reverse('user-active-subscription')
        response = api_client.get(url)

        response_phase = response.data['phases'][0]

        assert response.status_code == status.HTTP_200_OK, response.data

        assert not response_phase['trial_end']
        assert response.data['can_activate_trial']

    def test_return_active_subscription_data(self, api_client, subscription_schedule):
        user = subscription_schedule.customer.subscriber
        api_client.force_authenticate(user)
        url = reverse('user-active-subscription')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK, response.data

        self.assert_response(response, subscription_schedule)

    def test_change_active_subscription(self, api_client, subscription_schedule, monthly_plan_price):
        user = subscription_schedule.customer.subscriber
        api_client.force_authenticate(user)
        url = reverse('user-active-subscription')
        response = api_client.patch(url, {'price': monthly_plan_price.id})

        assert response.status_code == status.HTTP_200_OK, response.data

    def test_change_when_user_has_no_payment_method_but_can_activate_trial(
        self, api_client, customer_factory, subscription_schedule_factory, free_plan_price, monthly_plan_price
    ):
        customer = customer_factory(default_payment_method=None)
        subscription_schedule_factory(customer=customer, phases=[{'items': [{'price': free_plan_price.id}]}])
        user = customer.subscriber

        djstripe_models.PaymentMethod.objects.filter(customer=customer).delete()

        api_client.force_authenticate(user)
        url = reverse('user-active-subscription')

        response = api_client.patch(url, {'price': monthly_plan_price.id})

        assert response.status_code == status.HTTP_200_OK, response.data

    def test_return_error_on_change_if_customer_has_no_payment_method(
        self, api_client, customer_factory, monthly_plan_price, subscription_schedule_factory
    ):
        customer = customer_factory(default_payment_method=None)
        subscription_schedule_factory(
            customer=customer, phases=[{'items': [{'price': monthly_plan_price.id}], 'trial_completed': True}]
        )
        djstripe_models.PaymentMethod.objects.filter(customer=customer).delete()

        api_client.force_authenticate(customer.subscriber)
        url = reverse('user-active-subscription')

        response = api_client.patch(url, {'price': monthly_plan_price.id})

        assert response.status_code == status.HTTP_400_BAD_REQUEST, response.data
        assert response.data['non_field_errors'][0]['code'] == 'missing_payment_method'


class TestCancelUserActiveSubscriptionView:
    def test_return_error_for_unauthorized_user(self, api_client):
        url = reverse('user-active-subscription-cancel')
        response = api_client.post(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_return_error_if_customer_has_no_paid_subscription(self, api_client, subscription_schedule):
        api_client.force_authenticate(subscription_schedule.customer.subscriber)
        url = reverse('user-active-subscription-cancel')
        response = api_client.post(url)

        assert response.status_code == status.HTTP_400_BAD_REQUEST, response.data
        assert response.data['non_field_errors'][0]['code'] == 'no_paid_subscription'

    def test_cancel_trialing_subscription(self, api_client, subscription_schedule_factory, monthly_plan_price):
        subscription_schedule = subscription_schedule_factory(
            phases=[{'items': [{'price': monthly_plan_price.id}], 'trialing': True}]
        )
        api_client.force_authenticate(subscription_schedule.customer.subscriber)
        url = reverse('user-active-subscription-cancel')
        response = api_client.post(url)
        assert response.status_code == status.HTTP_200_OK, response.data


class TestUserChargesListView:
    def test_return_error_for_unauthorized_user(self, api_client):
        url = reverse('charge-list')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_return_only_customer_charges(self, api_client, customer, charge_factory):
        other_customer_charge = charge_factory()
        regular_charge = charge_factory(customer=customer)

        api_client.force_authenticate(customer.subscriber)

        url = reverse('charge-list')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK, response.data
        assert len(response.data) == 1

        charge_ids = [charge['id'] for charge in response.data]

        assert regular_charge.id in charge_ids
        assert other_customer_charge.id not in charge_ids


class TestPaymentMethodDelete:
    def test_return_error_for_other_users_payment_method(
        self, mocker, stripe_request_client, api_client, payment_method_factory
    ):
        other_users_pm = payment_method_factory()
        payment_method = payment_method_factory()
        stripe_request = mocker.spy(stripe_request_client, 'request')

        api_client.force_authenticate(payment_method.customer.subscriber)
        url = reverse('payment-method-detail', kwargs={'id': other_users_pm.id})
        response = api_client.delete(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND
        stripe_request.assert_not_called()

    def test_detach_payment_method(self, mocker, stripe_request_client, api_client, payment_method):
        customer = payment_method.customer
        stripe_request = mocker.spy(stripe_request_client, 'request')

        api_client.force_authenticate(customer.subscriber)
        url = reverse('payment-method-detail', kwargs={'id': payment_method.id})
        response = api_client.delete(url)

        customer.refresh_from_db()

        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert customer.default_payment_method is None
        stripe_request.assert_any_call(
            'post',
            callee.EndsWith(f'payment_methods/{payment_method.id}/detach'),
            callee.Any(),
            '',
        )


class TestPaymentMethodSetDefault:
    def test_return_error_for_other_users_payment_method(
        self, mocker, stripe_request_client, api_client, payment_method_factory
    ):
        other_users_pm = payment_method_factory()
        payment_method = payment_method_factory()
        stripe_request = mocker.spy(stripe_request_client, 'request')

        api_client.force_authenticate(payment_method.customer.subscriber)
        url = reverse('payment-method-set-default', kwargs={'id': other_users_pm.id})
        response = api_client.post(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND
        stripe_request.assert_not_called()

    def test_set_default_payment_method(
        self, mocker, api_client, payment_method_factory, customer, stripe_request_client
    ):
        payment_method = payment_method_factory(customer=customer)
        stripe_request = mocker.spy(stripe_request_client, 'request')

        api_client.force_authenticate(payment_method.customer.subscriber)
        url = reverse('payment-method-set-default', kwargs={'id': payment_method.id})
        response = api_client.post(url)

        assert response.status_code == status.HTTP_200_OK
        stripe_request.assert_any_call(
            'post',
            callee.EndsWith(f'/customers/{customer.id}'),
            callee.Any(),
            stripe_encode({'invoice_settings': {'default_payment_method': payment_method.id}}),
        )
