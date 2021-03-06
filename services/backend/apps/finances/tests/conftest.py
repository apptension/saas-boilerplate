import pytest
import stripe


@pytest.fixture()
def stripe_api_key(faker):
    return f'sk_test_{faker.pystr(min_chars=30, max_chars=30)}'


@pytest.fixture(scope='function', autouse=True)
def stripe_account(mocker, stripe_api_key, faker):
    api_account = stripe.Account.construct_from(
        key=stripe_api_key,
        values={
            "id": f"acct_{faker.pystr()}",
            "object": "account",
            "business_profile": {
                "mcc": None,
                "name": "Stripe.com",
                "product_description": None,
                "support_address": None,
                "support_email": None,
                "support_phone": None,
                "support_url": None,
                "url": None,
            },
            "capabilities": {"card_payments": "active", "transfers": "active"},
            "charges_enabled": False,
            "country": "US",
            "default_currency": "usd",
            "details_submitted": False,
            "email": "site@stripe.com",
            "metadata": {},
            "payouts_enabled": False,
            "requirements": {
                "current_deadline": None,
                "currently_due": [
                    "business_profile.product_description",
                    "business_profile.support_phone",
                    "business_profile.url",
                    "external_account",
                    "tos_acceptance.date",
                    "tos_acceptance.ip",
                ],
                "disabled_reason": "requirements.past_due",
                "errors": [],
                "eventually_due": [
                    "business_profile.product_description",
                    "business_profile.support_phone",
                    "business_profile.url",
                    "external_account",
                    "tos_acceptance.date",
                    "tos_acceptance.ip",
                ],
                "past_due": [],
                "pending_verification": [],
            },
            "settings": {
                "bacs_debit_payments": {},
                "branding": {"icon": None, "logo": None, "primary_color": None, "secondary_color": None},
                "card_payments": {
                    "decline_on": {"avs_failure": True, "cvc_failure": False},
                    "statement_descriptor_prefix": None,
                },
                "dashboard": {"display_name": "Stripe.com", "timezone": "US/Pacific"},
                "payments": {
                    "statement_descriptor": None,
                    "statement_descriptor_kana": None,
                    "statement_descriptor_kanji": None,
                },
                "payouts": {
                    "debit_negative_balances": True,
                    "schedule": {"delay_days": 7, "interval": "daily"},
                    "statement_descriptor": None,
                },
                "sepa_debit_payments": {},
            },
            "type": "standard",
        },
    )

    with mocker.patch('stripe.Account.retrieve', return_value=api_account):
        yield api_account


@pytest.fixture()
def stripe_charge_factory(stripe_api_key):
    def fn(charge, **kwargs):
        values = {
            "id": charge.id,
            "object": "charge",
            "amount": charge.amount,
            "amount_captured": charge.amount,
            "amount_refunded": 0,
            "balance_transaction": None,
            "billing_details": charge.payment_method.billing_details,
            "captured": True,
            "created": 1615002221,
            "currency": "usd",
            "description": "Test Charge",
            "disputed": False,
            "fraud_details": {},
            "livemode": False,
            "metadata": {},
            "paid": True,
            "payment_intent": charge.payment_intent.id,
            "payment_method": charge.payment_method.id,
            "payment_method_details": charge.payment_method.billing_details,
            "receipt_url": "",
            "refunded": False,
            "refunds": {
                "object": "list",
                "data": [],
                "has_more": False,
                "url": f"/v1/charges/{charge.id}/refunds",
            },
            **kwargs,
        }

        if charge.balance_transaction:
            values['balance_transaction']: charge.balance_transaction.id

        return stripe.Charge.construct_from(
            key=stripe_api_key,
            values=values,
        )

    return fn
