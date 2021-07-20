--- 
title: Create new subscription plan
---

Available subscription plans are created by a custom django command
`init_subscriptions`. It is called automatically in both local development environment, and in remote AWS environment.

You can call this command manually if you want:
```sh
./manage.py init_subscriptions
```

## Backend reference

### Subscription plan definition

Subscription plan is a pair of a `Product` and `Price` Stripe instances. For 
simplicity, we call this pair a "subscription plan".

All subscription plan definitions are instances of a `SubscriptionPlanConfig`
dataclass and are located in `apps.finances.constants` python module.

#### Properties

- `name` – plan is created only if there's no other `Product` with the same
  `name` value in Stripe.

- `initial_price` – values used to create a `Price` object in Stripe.

> Changing `initial_price` field will not automatically update the plan!

Following is an example of how a subscription plan is defined:

```python
FREE_PLAN = SubscriptionPlanConfig(
    name='free_plan',
    initial_price=SubscriptionPlanPriceConfig(
        unit_amount=0,
        currency='usd',
        recurring={'interval': 'month'}
    ),
)
```

Make sure you update the `ALL_PLANS` constant to include the plan in the
`init_subscriptions` command.

### Update subscription plan price

If your plan has already been created in Stripe and you want to change the price,
the best approach is to just open the Stripe web console, create a new `Price`
instance with necessary values and attach it to the specific `Product`.

## Web app reference

### Subscription plan definition

In the webapp subscription plans are defined by their name in the
`SubscriptionPlanName` enum located in the `services/webapp/src/shared/services/api/subscription/types.ts` 
file.
