from datetime import timedelta

import calleee
import pytest
from django.urls import reverse
from django.utils import timezone
from rest_framework import status

from .utils import stripe_encode

pytestmark = pytest.mark.django_db


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

    def test_return_charges_ordered_by_creation_date_descending(self, api_client, customer, charge_factory):
        old_charge = charge_factory(customer=customer, created=timezone.now() - timedelta(days=1))
        oldest_charge = charge_factory(customer=customer, created=timezone.now() - timedelta(days=2))
        new_charge = charge_factory(customer=customer, created=timezone.now())
        api_client.force_authenticate(customer.subscriber)
        url = reverse('charge-list')

        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK, response.data
        assert len(response.data) == 3
        charge_ids = [charge['id'] for charge in response.data]
        assert charge_ids == [new_charge.id, old_charge.id, oldest_charge.id]


class TestPaymentMethodDelete:
    def test_return_error_for_other_users_payment_method(self, stripe_request, api_client, payment_method_factory):
        other_users_pm = payment_method_factory()
        payment_method = payment_method_factory()
        api_client.force_authenticate(payment_method.customer.subscriber)
        url = reverse('payment-method-detail', kwargs={'id': other_users_pm.id})

        response = api_client.delete(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND
        stripe_request.assert_any_call(
            'get', calleee.EndsWith(f'/payment_methods/{other_users_pm.id}'), calleee.Any(), None
        )

    def test_detach_payment_method(self, stripe_request, api_client, payment_method):
        customer = payment_method.customer
        api_client.force_authenticate(customer.subscriber)
        url = reverse('payment-method-detail', kwargs={'id': payment_method.id})

        response = api_client.delete(url)
        customer.refresh_from_db()

        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert customer.default_payment_method is None
        stripe_request.assert_any_call(
            'post',
            calleee.EndsWith(f'payment_methods/{payment_method.id}/detach'),
            calleee.Any(),
            '',
        )

    def test_set_default_payment_method_to_next_one(self, stripe_request, api_client, customer, payment_method_factory):
        payment_method = payment_method_factory(customer=customer)
        customer.default_payment_method = payment_method
        customer.save()
        other_payment_method = payment_method_factory(customer=customer)
        api_client.force_authenticate(customer.subscriber)
        url = reverse('payment-method-detail', kwargs={'id': payment_method.id})

        response = api_client.delete(url)
        customer.refresh_from_db()

        assert response.status_code == status.HTTP_204_NO_CONTENT
        stripe_request.assert_any_call(
            'post',
            calleee.EndsWith(f'payment_methods/{payment_method.id}/detach'),
            calleee.Any(),
            '',
        )
        stripe_request.assert_any_call(
            'post',
            calleee.EndsWith(f'/customers/{customer.id}'),
            calleee.Any(),
            stripe_encode({'invoice_settings': {'default_payment_method': other_payment_method.id}}),
        )


class TestPaymentMethodSetDefault:
    def test_fetch_unknown_payment_method_from_stripe(self, stripe_request, api_client, payment_method_factory):
        other_users_pm = payment_method_factory()
        payment_method = payment_method_factory()
        api_client.force_authenticate(payment_method.customer.subscriber)
        url = reverse('payment-method-set-default', kwargs={'id': other_users_pm.id})

        response = api_client.post(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND
        stripe_request.assert_any_call(
            'get', calleee.EndsWith(f'/payment_methods/{other_users_pm.id}'), calleee.Any(), None
        )

    def test_set_default_payment_method(self, api_client, payment_method_factory, customer, stripe_request):
        payment_method = payment_method_factory(customer=customer)
        api_client.force_authenticate(payment_method.customer.subscriber)
        url = reverse('payment-method-set-default', kwargs={'id': payment_method.id})

        response = api_client.post(url)

        assert response.status_code == status.HTTP_200_OK
        stripe_request.assert_any_call(
            'post',
            calleee.EndsWith(f'/customers/{customer.id}'),
            calleee.Any(),
            stripe_encode({'invoice_settings': {'default_payment_method': payment_method.id}}),
        )
