---
title: Stripe webhooks
---

`dj-stripe` implements a view which interprets all webhook
event triggers coming from Stripe. It validates the data and
saves necessary data to DB.

:::note

Stripe has a built in retry mechanism for webhooks, which means 
that we don't have to implement handlers in asynchronous workers
just for this reason.
We can still use django!

:::

## Creating a new webhook handler

It's quite simple to define a custom webhook handler. All you need to do 
is to define a function in `apps.finances.webhooks`, and wrap it in 
`djstripe.webhooks.handler` decorator. Arguments of the decorator are a 
list of event types on which the handler will be called.



Example:

```python
from djstripe import webhooks, models as djstripe_models

@webhooks.handler('subscription_schedule.canceled')
def handler(event: djstripe_models.Event):
  """
  This code will be called on every subscription_schedule.canceled event 
  """
  pass
```

:::note

All handlers, including the built-in `dj-stripe` handlers, are run in an 
atomic transaction by default.

:::


## Webhooks on localhost

Stripe has a built-int tunneling solution! You don't need ngrok to receive
webhook events on your local machine. Check out the official [documentation](https://stripe.com/docs/webhooks/test)
for installation details.


:::tip

We highly recommend running the webhook listener in background all the time
so that you don't miss any remote events (e.g. attaching new payment methods,
failed payments, etc).

:::

Run the following command:
```sh
stripe listen --forward-to http://localhost:5000/api/finances/stripe/webhook/
```


