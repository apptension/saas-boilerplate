---
title: Deploy to AWS
---

## Switch to aws-vault context

Always make sure you are in a proper aws-vault context when you run commands that use AWS CLI.
We created a `make` rule that simplifies this process:

```shell
make aws-vault
```

> Check out the [documentation](https://github.com/99designs/aws-vault) on how to set up aws-vault profile if you haven't done so already.

## Setup a new environment

AWS boilerplate allows you to deploy multiple versions of your application. Those, for example, could be `qa`, `staging`
, `production` or whatever else you desire. You decide how to call them and how many you would like to have.

> For more detailed version of this step check [new environment docs](guides/aws-environment.md)

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
