import pytest
from django.urls import reverse
from djstripe import models as djstripe_models
from rest_framework import status

pytestmark = pytest.mark.django_db


class TestSubscriptionPlanListView:
    def assert_plan(self, result, price):
        assert result['id'] == price.id
        assert result['product'] == {'id': price.product.id, 'name': price.product.name}

    def test_return_available_plans(self, api_client, user, monthly_plan_price, yearly_plan_price):
        api_client.force_authenticate(user)
        url = reverse('subscription-plans-list')

        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        self.assert_plan(response.data[0], monthly_plan_price)
        self.assert_plan(response.data[1], yearly_plan_price)


class TestUserActiveSubscriptionView:
    def assert_response(self, response, subscription):
        subscription_item = subscription.items.first()

        assert response.data['id'] == subscription.id
        assert response.data['status'] == subscription.status
        if subscription.default_payment_method:
            assert response.data['default_payment_method']['id'] == subscription.default_payment_method.id

        assert response.data['item'] == {
            'id': subscription_item.id,
            'quantity': subscription_item.quantity,
            'price': {
                'id': subscription_item.price.id,
                'unit_amount': subscription_item.price.unit_amount,
                'product': {'id': subscription_item.price.product.id, 'name': subscription_item.price.product.name},
            },
        }

    def test_trial_fields_in_response_when_user_never_activated_it(self, api_client, user):
        api_client.force_authenticate(user)
        url = reverse('user-active-subscription')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK, response.data

        assert not response.data['trial_start']
        assert not response.data['trial_end']
        assert response.data['can_activate_trial']

    def test_trial_fields_in_response_when_customer_already_activated_trial(
        self, api_client, user, subscription_factory
    ):
        customer, _ = djstripe_models.Customer.get_or_create(user)
        djstripe_models.Subscription.objects.filter(customer=customer).delete()
        subscription_factory(trialing=True, customer=customer)

        api_client.force_authenticate(user)
        url = reverse('user-active-subscription')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK, response.data
        assert response.data['trial_start']
        assert response.data['trial_end']
        assert not response.data['can_activate_trial']

    def test_return_active_subscription_data(self, api_client, user):
        api_client.force_authenticate(user)
        url = reverse('user-active-subscription')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK, response.data

        customer = djstripe_models.Customer.objects.get(subscriber=user)
        self.assert_response(response, customer.subscription)

    def test_change_active_subscription(self, api_client, user, monthly_plan_price):
        api_client.force_authenticate(user)
        url = reverse('user-active-subscription')
        response = api_client.patch(url, {'price': monthly_plan_price.id})

        assert response.status_code == status.HTTP_200_OK, response.data

        customer = djstripe_models.Customer.objects.get(subscriber=user)
        self.assert_response(response, customer.subscription)

    def test_change_when_user_has_no_payment_method_but_can_activate_trial(self, api_client, user, monthly_plan_price):
        customer = djstripe_models.Customer.objects.get(subscriber=user)

        djstripe_models.PaymentMethod.objects.filter(customer=customer).delete()

        api_client.force_authenticate(user)
        url = reverse('user-active-subscription')

        response = api_client.patch(url, {'price': monthly_plan_price.id})

        assert response.status_code == status.HTTP_200_OK, response.data

        customer.subscription.refresh_from_db()
        self.assert_response(response, customer.subscription)

    def test_return_error_on_change_if_customer_has_no_payment_method(
        self, api_client, user, monthly_plan_price, subscription_factory
    ):
        customer, _ = djstripe_models.Customer.get_or_create(user)
        djstripe_models.Subscription.objects.filter(customer=customer).delete()
        subscription_factory(trialing=True, customer=customer)

        djstripe_models.PaymentMethod.objects.filter(customer=customer).delete()

        api_client.force_authenticate(user)
        url = reverse('user-active-subscription')

        response = api_client.patch(url, {'price': monthly_plan_price.id})

        assert response.status_code == status.HTTP_400_BAD_REQUEST, response.data
        assert response.data['non_field_errors'][0]['code'] == 'missing_payment_method'


class TestCancelUserActiveSubscriptionView:
    def test_return_error_if_customer_has_no_paid_subscription(self, api_client, user):
        api_client.force_authenticate(user)
        url = reverse('user-active-subscription-cancel')
        response = api_client.post(url)

        assert response.status_code == status.HTTP_400_BAD_REQUEST, response.data
        assert response.data['non_field_errors'][0]['code'] == 'no_paid_subscription'

    def test_cancel_trialing_subscription(self, api_client, user, subscription_factory, monthly_plan_price):
        customer, _ = djstripe_models.Customer.get_or_create(user)
        djstripe_models.Subscription.objects.filter(customer=customer).delete()
        subscription_factory(trialing=True, customer=customer, items=[{'price': monthly_plan_price.id}])

        api_client.force_authenticate(user)
        url = reverse('user-active-subscription-cancel')
        response = api_client.post(url)

        customer.refresh_from_db()

        assert response.status_code == status.HTTP_200_OK, response.data
