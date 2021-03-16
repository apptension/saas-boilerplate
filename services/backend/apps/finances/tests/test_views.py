import pytest
from django.urls import reverse
from rest_framework import status

pytestmark = pytest.mark.django_db

from .. import models


class TestUserActiveSubscriptionView:
    def test_return_active_subscription_data(self, api_client, user):
        api_client.force_authenticate(user)
        url = reverse('user-active-subscription')
        response = api_client.get(url)

        customer = models.Customer.objects.get(subscriber=user)
        subscription = customer.subscription
        subscription_item = subscription.items.first()

        assert response.status_code == status.HTTP_200_OK, response.data
        assert response.data['id'] == subscription.id
        assert response.data['status'] == subscription.status
        assert response.data['default_payment_method'] == {
            'id': subscription.default_payment_method.id,
            'type': subscription.default_payment_method.type,
            'card': subscription.default_payment_method.card,
        }
        assert response.data['item'] == {
            'id': subscription_item.id,
            'quantity': subscription_item.quantity,
            'price': {
                'id': subscription_item.price.id,
                'unit_amount': subscription_item.price.unit_amount,
                'product': {'id': subscription_item.price.product.id, 'name': subscription_item.price.product.name},
            },
        }
