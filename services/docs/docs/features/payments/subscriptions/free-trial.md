---
title: Subscriptions Free Trial
---

Free trial is a period during which the client is able to try out 
the service without actually paying for it. It is automatically
started for a first subscription to a paid plan for every customer.

## Rules and edge cases

- free trial can only be active once,
- free trial does not require any payment method attached to a customer,
- failed payment after free trial causes downgrade back to a free plan,
- free trial duration is configurable with environmental variable


## Backend reference

### Environmental variables

`SUBSCRIPTION_TRIAL_PERIOD_DAYS` – free trial duration in days (default: 7)
