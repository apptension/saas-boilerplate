---
title: Complete the payment
---

Completing the payment is done fully on the web app's side using the stripe SDK. Backend is notified about the
successful payment through a webhook.

Before we can actually complete the payment we need to update the payment intent with specific product information –
amount and currency. This is true because often the client changes decisions before actually submitting.

### Backend reference

```python
from djstripe import models as djstripe_models

# First we need to retrieve the instance of dj-stripe django model
instance = djstripe_models.PaymentIntent.objects.get(id='<PAYMENT_INTENT_ID>')

# Next we update the model using Stripe API
payment_intent_response = instance._api_update(amount=150)

# Finally we synchronize back all the changes with our database
# This line also returns an updated django model instance
djstripe_models.PaymentIntent.sync_from_stripe_data(payment_intent_response)
```

> You can find similar code in `apps.finances.serializers.PaymentIntentSerializer`.

### Web app reference

#### React Hooks

##### `useStripePayment`

A custom hook that uses `@stripe/react-stripe-js` to confirm the Stripe payment.
It supports confirming payment by using a previously defined payment method and
creating a new payment method using Stripe Elements. The only requirement is for
the hook to be called in the Stripe Elements context.

Example:

```tsx
const { confirmPayment } = useStripePayment();

// ..

/* First, we need a payment method.
 * You would most likely create this object using some kind of a form control.
 */
const paymentMethod = {
  type: StripePaymentMethodSelectionType.NEW_CARD,
  data: {
    name: "Name on card",
    cardErrors: {},
    cardMissingFields: {},
  },
};

/*
 * Next, create or update the payment intent necessary to confirm the payment.
 * This will update the price of the product you are buying.
 */
const paymentIntentResponse = await updateOrCreatePaymentIntent(TestProduct.A);

/*
 * Confirm the payment combining previously created instances.
 */
await confirmPayment({
  paymentMethod: paymentMethod,
  paymentIntent: paymentIntentResponse,
});
```

> You can find similar code in `services/webapp/src/shared/components/finances/stripe/stripePaymentForm/stripePaymentForm.component.tsx`
