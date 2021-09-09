from datetime import timedelta

import pytest
from django.urls import reverse
from django.utils import timezone
from rest_framework import status

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
