---
title: Creating application stage environment
---

## Configuration file

AWS boilerplate allows you to deploy multiple versions of your application. Those, for example, could be `qa`, `staging`
, `production` or whatever else you desire. You decide how to call them and how many you would like to have.

The very first thing you need to do is to generate a configuration file that will describe your
environment. AWS boilerplate expects such file to exist in a root directory and follow a specific naming pattern to be
able to discover it when running some `make` rules.

Let's say you want to create an environment named `qa`. The configuration file should be named `.awsboilerplate.qa.json`.
You can easily create it with the following `make` rule we've created for you:

```sh
make create-env
```

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

Those fields can be set at anytime so this step can be skipped in the initial phase.

:::
 
