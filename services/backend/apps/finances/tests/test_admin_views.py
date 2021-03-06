import pytest
import stripe
from django_hosts import reverse
from rest_framework import status
from djstripe import models as djstripe_models

pytestmark = pytest.mark.django_db


class TestAdminRefundView:
    def test_refund_succeeded_charge(
        self, api_client_admin, user_factory, charge, mocker, stripe_charge_factory, faker
    ):
        refund_id = f'r_{faker.pystr()}'
        api_charge = stripe_charge_factory(charge)
        stripe_charge_refunded = stripe_charge_factory(
            charge,
            amount_refunded=charge.amount,
            refunded=True,
            refunds={
                "object": "list",
                "data": [
                    {
                        "id": refund_id,
                        "object": "refund",
                        "amount": charge.amount,
                        "balance_transaction": charge.balance_transaction.id,
                        "charge": charge.id,
                        "created": 1615026003,
                        "currency": "usd",
                        "metadata": {},
                        "payment_intent": charge.payment_intent.id,
                        "reason": 'requested_by_customer',
                        "receipt_number": None,
                        "source_transfer_reversal": None,
                        "status": "succeeded",
                        "transfer_reversal": None,
                    }
                ],
                "has_more": False,
                "url": f"/v1/charges/{charge.id}/refunds",
            },
        )

        with mocker.patch('stripe.Charge.retrieve', return_value=api_charge):
            with mocker.patch.object(stripe.Charge, 'refund', return_value=stripe_charge_refunded):
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
        refund = djstripe_models.Refund.objects.get(id=refund_id)
        assert refund.amount == charge.amount

    def test_with_multiple_charges(
        self, charge_factory, customer, api_client_admin, user_factory, mocker, stripe_charge_factory, faker
    ):
        failed_charge = charge_factory(failed=True, customer=customer)
        charge = charge_factory(customer=failed_charge.customer, payment_intent=failed_charge.payment_intent)

        refund_id = f'r_{faker.pystr()}'
        api_charge = stripe_charge_factory(charge)
        stripe_charge_refunded = stripe_charge_factory(
            charge,
            amount_refunded=charge.amount,
            refunded=True,
            refunds={
                "object": "list",
                "data": [
                    {
                        "id": refund_id,
                        "object": "refund",
                        "amount": charge.amount,
                        "balance_transaction": charge.balance_transaction.id,
                        "charge": charge.id,
                        "created": 1615026003,
                        "currency": "usd",
                        "metadata": {},
                        "payment_intent": charge.payment_intent.id,
                        "reason": 'requested_by_customer',
                        "receipt_number": None,
                        "source_transfer_reversal": None,
                        "status": "succeeded",
                        "transfer_reversal": None,
                    }
                ],
                "has_more": False,
                "url": f"/v1/charges/{charge.id}/refunds",
            },
        )

        with mocker.patch('stripe.Charge.retrieve', return_value=api_charge):
            with mocker.patch.object(stripe.Charge, 'refund', return_value=stripe_charge_refunded):
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
        refund = djstripe_models.Refund.objects.get(id=refund_id)
        assert refund.amount == charge.amount

    def test_return_error_without_succeeded_charges(
        self, charge_factory, customer, api_client_admin, user_factory, mocker, stripe_charge_factory
    ):
        failed_charge = charge_factory(failed=True, customer=customer)
        api_charge = stripe_charge_factory(failed_charge)

        with mocker.patch('stripe.Charge.retrieve', return_value=api_charge):
            user = user_factory(admin=True)
            api_client_admin.force_authenticate(user)

            url = reverse('payment-intent-refund', host='admin', kwargs={'pk': failed_charge.payment_intent.pk})
            response = api_client_admin.post(
                url,
                {
                    'amount': failed_charge.amount,
                    'reason': 'requested_by_customer',
                },
            )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
