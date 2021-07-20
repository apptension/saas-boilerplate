---
title: Payments introduction
---

## Stripe

Payments are handled through a provider called [Stripe](https://stripe.com/); it offers great developer
experience and delivers an awesome and extensive [documentation](https://stripe.com/docs).


## dj-stripe

We are using `dj-stripe` package to synchronize all stripe data with the
primary database. It implements all the Stripe models as Django models
allowing us to treat them as a primary source of truth instead of reaching 
out to Stripe API all the time. So far it proved to be a very useful and 
interesting way of working with a payments provider.

- [Github](https://github.com/dj-stripe/dj-stripe)
- [Official docs](https://dj-stripe.readthedocs.io/en/master/)

## Setup

### Stripe account setup

Create a Stripe account for every environment: qa, staging, production.

Additionally, every developer should have their own Stripe account! It is extremely simple to
do by clicking the "+" sign in the dropdown located in the top left corner of
the Stripe web panel. When you create the account just invite a particualr dev
to their account and let them copy the necessary secret keys on their own.

### Backend setup

#### Configure environmental variables

- `STRIPE_LIVE_SECRET_KEY` – A secret key necessary to access the production mode. Required only
  for production environment. You can find it in Stripe's web panel.
- `STRIPE_TEST_SECRET_KEY` – A secret key necessary to access the test mode. You can find it in 
  Stripe's web panel.
- `STRIPE_LIVE_MODE` – `True`/`False` (default: False); When equal to `False` all operations
  are run in a test mode.
- `DJSTRIPE_WEBHOOK_SECRET` – a signing secret used to validate the events coming from Stripe.
  You obtain it after you create a webhook in the Stripe's web panel.

#### Configure Stripe webhook

1. Open the Stripe web panel
2. Open the Developer > webhooks page
3. Press "Add endpoint button"
4. Enter `https://<YOUR_DOMAIN>/api/finances/stripe/webhook/` in the Endpoint URL 
   field.
5. Press the "receive all events" CTA.
6. Submit the form
7. Copy the Signing secret of the created webhook and put it into `DJSTRIPE_WEBHOOK_SECRET` 
   env variable.


### Web app setup

#### Configure environmental variables

- `REACT_APP_STRIPE_PUBLISHABLE_KEY` – a publishable key that you can find in Stripe's
  web panel
