---
title: Creating application stage environment
---

## Configuration file

AWS boilerplate allows you to deploy multiple versions of your application. Those, for example, could be `qa`, `staging`
, `production` or whatever else you desire. You decide how to call them and how many you would like to have. 
The only exception is `local`, which is a special pre-created local environment (it's needed for example for running Serverless services locally).      

The very first thing you need to do is to generate a configuration file that will describe your
environment. AWS boilerplate expects such file to exist in a root directory and follow a specific naming pattern to be
able to discover it when running some `make` rules.

Let's say you want to create an environment named `qa`. The configuration file should be named `.awsboilerplate.qa.json`.
You can easily create it with the following `make` rule we've created for you:

```sh
make create-env
```

#### Configuration file specification

:::info
`hostedZone.id` and `hostedZone.name` can be skipped if you are using externally managed DNS. In that case, certificates for CloudFront distribution and Load Balancer should be already generated, and they ARNs provided in `certificates.cloudfrontCertificateArn` and `certificates.loadBalancerCertificateArn` parameters. As the last step, CNAME DNS records pointing to CloudFront distribution and Load Balancer need to be manually added.  
:::

##### `deployBranches`

A list of branches that will trigger automatic deployment of this environment.

Type: `Array<string>`

Example: `['master']`

##### `hostedZone.id`

Id of a AWS Route53 hosted zone of a domain used to host services of this env.

Type: `string`
Example: `Z1019320SEC473QW1LV2`

##### `hostedZone.name`

Name of a AWS Route53 hosted zone of a domain used to host services of this env.

Type: `string`

Example: `qa.awsb.apptoku.com`

##### `certificates.cloudfrontCertificateArn`

ARN of already generated certificate that should be attached to CloudFront distribution. This certificate needs to be generated in us-east-1 region.

Type: `string`
Example: `arn:aws:acm:us-east-1:account:certificate/certificate_id`

##### `certificates.loadBalancerCertificateArn`

ARN of already generated certificate that should be attached to Load Balancer. This certificate needs to be generated in the same region as the application.

Type: `string`
Example: `arn:aws:acm:region:account:certificate/certificate_id`

##### `certificates.domain`

The domain will be used to generate a certificate, if not provided will be used envStage and hosted zone name e.g. `qa.saas.apptoku.com` 

Type: `string`
Example: `qa.saas.apptoku.com`

##### `basicAuth`

This flag controls if basic auth should be used to access services via HTTP.

Type: `string`

Example: `username:password`

##### `domains.adminPanel`

A domain used to host an admin panel service.

Type: `string`

Example: `admin.qa.awsb.apptoku.com`

##### `domains.api`

A domain used to host an API backend service.

Type: `string`

Example: `api.qa.awsb.apptoku.com`

##### `domains.webApp`

A domain used to host the web app.

Type: `string`

Example: `app.qa.awsb.apptoku.com`

## Infrastructure deployment

Now that the configuration part is done you can switch to aws-vault session of this new environment:

```sh
make aws-vault ENV_STAGE=qa
```

Now you can deploy an actual infrastructure of your app by running following command:

```shell
make deploy-env-infra
```

When CDK finishes successfully you'll be almost ready to deploy your application!

## Set environmental variables

Every running app needs some environment specific runtime values to run properly. Those could either be some secret
keys for a 3rd party service, boolean flags enabling features, and much much more.

We chose AWS Systems Manager Parameter Store to keep such variables and utilize a tool named [`chamber`](https://github.com/segmentio/chamber)
to actually manage them with ease.

:::caution

Before you deploy your application's code you have to set all required environmental variables!

:::


### Backend

You can set backend variables in a JSON format using following `make` rule:

```shell
make -C services/backend secrets
```

It will download, open in Vim and re-upload (on save) a secrets file. This file have to be a json file.
Set of **required** fields is presented below:

| Name                   | Example                           | Description                                                                   |
| ---------------------- | --------------------------------- | ----------------------------------------------------------------------------- |
| DJANGO_DEBUG           | True                              | [docs](https://docs.djangoproject.com/en/3.0/ref/settings/#std:setting-DEBUG) |
| DJANGO_SECRET_KEY      | Zs639zRcb5!9om2@tW2H6XG#Znj^TB^I  | [docs](https://docs.djangoproject.com/en/3.0/ref/settings/#secret-key)        |
| HASHID_FIELD_SALT      | t5$^r\*xsMRXn1xjzhRSl8I5Hb3BUW$4U | [docs](https://github.com/nshafer/django-hashid-field#hashid_field_salt)      |
| ADMIN_EMAIL            | admin@exmaple.com                 | Will be used to create first super admin user                                 |
| ADMIN_DEFAULT_PASSWORD | AvPZpabgj9Z8                      | Will be used to create first super admin user                                 |

If you want to use Stripe, you also need to define:

| Name                    | Example                    | Description                                                              |
| ----------------------- | ---------------------------| ------------------------------------------------------------------------ |
| STRIPE_TEST_SECRET_KEY  | sk_test_4dEFRCLCgCb        | Use this one for Stripe test mode. [docs](https://stripe.com/docs/keys)  |
| STRIPE_LIVE_SECRET_KEY  | sk_4dEFRCLCgCbMy6O4FX      | Use this one for Stripe live mode. [docs](https://stripe.com/docs/keys)  |
| DJSTRIPE_WEBHOOK_SECRET | whsec_12345                | [docs](https://stripe.com/docs/webhooks/best-practices#endpoint-secrets) |


Below is the list of all optional environment variables:

| Name                               | Example                                    | Description                                                                                                                                                                                                              |
|------------------------------------|--------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| SENTRY_DSN                         | https://(...)@(...).ingest.sentry.io/(...) | [Sentry](https://sentry.io/) client key                                                                                                                                                                                  |
| SOCIAL_AUTH_ALLOWED_REDIRECT_HOSTS | app.demo.saas.apptoku.com                  | Allowed hosts for OAuth redirection. Check [Python Social Auth](https://python-social-auth.readthedocs.io/en/latest/configuration/settings.html#processing-redirects-and-urlopen) package documentation for more details |
| SOCIAL_AUTH_FACEBOOK_KEY           |                                            | Client key for Facebook OAuth integration                                                                                                                                                                                |
| SOCIAL_AUTH_FACEBOOK_SECRET        |                                            | Client secret for Facebook OAuth integration                                                                                                                                                                             |
| SOCIAL_AUTH_GOOGLE_OAUTH2_KEY      |                                            | Client key for Google OAuth integration                                                                                                                                                                                  |
| SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET   |                                            | Client secret for Google OAuth integration                                                                                                                                                                               |
| SUBSCRIPTION_TRIAL_PERIOD_DAYS     | 1                                          | Number of days for subscription trial. By default set to `7`                                                                                                                                                             |

In order to avoid any typos you can find a `secrets.example.json`, just replace the values and paste it into edited secrets file.


### Async workers

Secrets file for Async workers can be set in exactly same way as for Backend.

Set of **required** fields is presented below:

| Name         | Example                           | Description                                                                                                                         |
|--------------|-----------------------------------|-------------------------------------------------------------------------------------------------------------------------------------|
| FROM_EMAIL   | admin@exmaple.com                 | Email used in `From` email field                                                                                                    |
| HASHID_SALT  | t5$^r\*xsMRXn1xjzhRSl8I5Hb3BUW$4U | [docs](https://github.com/nshafer/django-hashid-field#hashid_field_salt)                                                            |
| JWT_SECRET   |                                   | Secret used to decode JWT used in subscriptions. The value needs to be the same as `DJANGO_SECRET_KEY` backend environment variable |
| WEB_APP_URL  | https://app.qa.saas.apptoku.com   |                                                                                                                                     |


In order to use contentful or sentry services one needs to set following additional variables:

| Name                    | Description                             |
|-------------------------|-----------------------------------------|
| CONTENTFUL_ACCESS_TOKEN | Contentful Space ID                     |
| CONTENTFUL_ENVIRONMENT  | Contentful API access token             |
| CONTENTFUL_SPACE_ID     | Contentful environment name             |
| SENTRY_DSN              | [Sentry](https://sentry.io/) client key |


### Webapp

Secrets file for Web application can be set in exactly same way as for Backend.
Set of **required** fields is presented below:

| Name                             | Example | Description                |
|----------------------------------|---------|----------------------------|
| REACT_APP_BASE_API_URL           | /api    | Path to access backend API |
| REACT_APP_EMAIL_ASSETS_URL       |         |                            |

In order to use contentful or stripe services one needs to set following additional variables:

| Name                             | Description                             |
|----------------------------------|-----------------------------------------|
| REACT_APP_CONTENTFUL_SPACE       | Contentful Space ID                     |
| REACT_APP_CONTENTFUL_TOKEN       | Contentful API access token             |
| REACT_APP_CONTENTFUL_ENV         | Contentful environment name             |
| REACT_APP_STRIPE_PUBLISHABLE_KEY | Stripe Publishable key                  |
| REACT_APP_SENTRY_DSN             | [Sentry](https://sentry.io/) client key |

:::info

Webapp secret fields can be set at anytime so this step can be skipped in the initial phase.

:::
 

### E2E

Secrets file for E2E tests can be set in exactly same way as for Backend.
Set of **required** fields is presented below:

| Name                            | Description                 |
|---------------------------------|-----------------------------|
| CYPRESS_CONTENTFUL_SPACE_ID     | Contentful Space ID         |
| CYPRESS_CONTENTFUL_ACCESS_TOKEN | Contentful API access token |
| CYPRESS_EMAIL                   |                             |
| CYPRESS_PASSWORD                |                             |
| GMAIL_ACCESS_TOKEN              |                             |
| GMAIL_CLIENT_ID                 |                             |
| GMAIL_CLIENT_SECRET             |                             |
| GMAIL_REDIRECT_URIS             |                             |