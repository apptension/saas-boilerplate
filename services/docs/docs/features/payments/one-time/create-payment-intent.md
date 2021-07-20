---
title: Create payment intent
---

A PaymentIntent tracks the customer's payment lifecycle, keeping track of any failed payment attempts and ensuring the
customer is only charged once. Check out [official Stripe docs](https://stripe.com/docs/payments/payment-intents)
for in-depth understanding of everything related to payment intents.

### Backend reference

The backend part is pretty straightforward – call Stripe API to create the object and synchronize it with the DB.
An example of this code is already implemented in the `PaymentIntentSerializer`.

```python
from djstripe import models as djstripe_models

# First create the new payment intent in Stripe through the API
payment_intent_response = djstripe_models.PaymentIntent._api_create(
    # amount and currency should probably come from a Price object
    # in real life scenario
    amount=100,
    currency="usd",
    # The customer instance should be created prior to this operation
    customer="<STRIPE_CUSTOMER_ID>",
    setup_future_usage="off_session",
)

# The following line puts all the data received from Stripe into our DB and
# returns a Django model instance
djstripe_models.PaymentIntent.sync_from_stripe_data(payment_intent_response)
```

> You can find similar code in `apps.finances.serializers.PaymentIntentSerializer`.

### Web app reference

In order to create the Payment Intent instance and get its details you will need to send a following API request:

- URL: `api/finances/stripe/payment-intent/`
- Method: `POST`
- Success Response: `('id', 'amount', 'currency', 'client_secret')`

`client_secret` is the most important field; It is a unique string that you will need it to complete the payment.


#### React Hooks

In order to simplify the process we prepared a custom hook that calls the mentioned API endpoint.

##### `useStripePaymentIntent`

Returns:

```ts
{
    updateOrCreatePaymentIntent: async (product: TestProduct) => Promise<ApiFormSubmitResponse>
}
```

Example:

```tsx
const { updateOrCreatePaymentIntent } = useStripePaymentIntent();

// ...

updateOrCreatePaymentIntent(TestProduct.A);
```


> You can find similar code in `services/webapp/src/shared/components/finances/stripe/stripePaymentForm/stripePaymentForm.component.tsx`
