---
title: Subscriptions introduction
---

[Stripe](https://stripe.com/), besides payments is also able to handle customer
subscriptions.

Stripe has a great [documentation](https://stripe.com/docs/billing/subscriptions/overview)
explaining how subscriptions work so go check it out if you need more details.

## Available plans

- `free_plan` - A default plan, which every new customer is subscribed to.
  This plan that does not incur any payments. The customer does not
  need any payment methods attached. 
- `monthly_plan` – A paid plan that is renewed every month.
- `yearly_plan` – A paid plan that is renewed every year.

## Backend reference

There are three django models living in `dj-stripe` package that play the biggest
role in our subscription implementation.

- `Customer` – a mirror model of Stripe's customer with an field linking it
  back to our `User` instance. Almost every object in Stripe is in some way
  related to the customer.
- `Subscription` – a mirror model of Stripe's subscription; it is a real 
  representation of the customer's subscription. Having a valid subscription
  should give the user access to limited services.
- `SubscriptionSchedule` – this model allows us to define changes that should
  occur on specific time in the `Subscription` instance. For example – we can
  declare that in 3 months the subscription should be changed from a paid plan
  back to the free plan.

  Be sure to check out the official subscription schedule
  [documentation](https://stripe.com/docs/billing/subscriptions/subscription-schedules)
  for better understanding on how things work.
  
:::important

Important note: `SubscriptionSchedule` is used a lot in the backend code and it
may seem like it represents a valid `Subscription` but make sure you understand
that it is only a declarative way to change the original `Subscription`.

:::
