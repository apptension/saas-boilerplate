---
id: aws-deployment
title: Deploy to AWS
---

## Switch to aws-vault context

Always make sure you are in a proper aws-vault context when you run commands that use AWS CLI.
We created a `make` rule that simplifies this process:

```shell
make aws-vault
```

> Check out the [documentation](https://github.com/99designs/aws-vault) on how to set up aws-vault profile if you haven't done so already.

## Setup the infrastructure

Before you create any real AWS resources you need to bootstrap CDK first. You can do it by running the following command:

```shell
make setup-infra
```

## Deploy Global Infrastructure to AWS

Next up is the [global infrastructure](/docs/infrastructure-components.md#global-infrastructure) CDK stack to create
the foundations of your system. Resources created in this step will be used by all environments that you'll create in the
future.

```shell
make deploy-global-infra
```

## Setup a new environment

AWS boilerplate allows you to deploy multiple versions of your application. Those, for example, could be `qa`, `staging`
, `production` or whatever else you desire. You decide how to call them and how many you would like to have.

> For more detailed version of this step check [new environment docs](aws-environment.md)

```shell
make create-env
```

Let's say you created an environment named `qa`. Now you can switch to its aws-vault session:

```shell
make aws-vault ENV_STAGE=qa
```

Deploy environment's infrastructure:

```shell
make deploy-env-infra
```

Define necessary environmental variables in SSM:

```shell
make -C services/backend secrets
```

(Optional) Deploy app's code:

```shell
make build
make deploy-env-app
```
