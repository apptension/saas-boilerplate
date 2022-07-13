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

In order to avoid any typos You can find a `secrets.example.json`, just replace the values and paste it into edited secrets file.

### Webapp

Secrets file for Web application can be set in exactly same way as for Backend.
There are no essential or required fields in this service however one needs to set 3 contentful related fields in order to use it.
```shell
REACT_APP_CONTENTFUL_SPACE
REACT_APP_CONTENTFUL_TOKEN
REACT_APP_CONTENTFUL_ENV
```
:::info

Webapp secret fields can be set at anytime so this step can be skipped in the initial phase.

:::
 
