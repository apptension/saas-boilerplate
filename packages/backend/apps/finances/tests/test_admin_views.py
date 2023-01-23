import pytest
from django_hosts import reverse
from rest_framework import status

pytestmark = pytest.mark.django_db


class TestAdminRefundView:
    def test_refund_succeeded_charge(self, api_client_admin, user_factory, charge):
        user = user_factory(admin=True)
        api_client_admin.force_authenticate(user)
        url = reverse('payment-intent-refund', host='admin', kwargs={'pk': charge.payment_intent.pk})

        response = api_client_admin.post(
            url,
            {
                'amount': charge.amount,
                'reason': 'requested_by_customer',
            },
        )

        assert response.status_code == status.HTTP_302_FOUND

    def test_with_multiple_charges(
        self,
        charge_factory,
        customer,
        api_client_admin,
        user_factory,
    ):
        failed_charge = charge_factory(failed=True, customer=customer)
        charge = charge_factory(customer=failed_charge.customer, payment_intent=failed_charge.payment_intent)
        user = user_factory(admin=True)
        api_client_admin.force_authenticate(user)
        url = reverse('payment-intent-refund', host='admin', kwargs={'pk': charge.payment_intent.pk})

        response = api_client_admin.post(
            url,
            {
                'amount': charge.amount,
                'reason': 'requested_by_customer',
            },
        )

        assert response.status_code == status.HTTP_302_FOUND

    def test_return_error_without_succeeded_charges(self, charge_factory, customer, api_client_admin, user_factory):
        failed_charge = charge_factory(failed=True, customer=customer)
        admin_user = user_factory(admin=True)
        api_client_admin.force_authenticate(admin_user)
        url = reverse('payment-intent-refund', host='admin', kwargs={'pk': failed_charge.payment_intent.pk})

        response = api_client_admin.post(
            url,
            {
                'amount': failed_charge.amount,
                'reason': 'requested_by_customer',
            },
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
