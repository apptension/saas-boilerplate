---
title: Initial setup
---

## Create a hosted zone

The app is HTTPs only so you will need at least one domain and a hosted zone in Route53.

Values to save:

- `id` of the hosted zone
- `name` of the hosted zone

## Create an [aws-vault](https://github.com/99designs/aws-vault) profile

This profile will be used by `Make` when running any commands that communicate with AWS platform.

Values to save:

- `name` of the aws-vault profile

## Bootstrap CDK

Switch to AWS context using aws-vault

```shell
make aws-vault ENV_STAGE=qa
```

Run CDK bootstrap

```shell
make setup-infra
```

## Deploy Global Infrastructure to AWS

Next up is the [global infrastructure](./infrastructure-components.md#global-infrastructure) CDK stack to create
the foundations of your system. Resources created in this step will be used by all environments that you'll create in the
future.

```shell
make deploy-global-infra
```

:::tip Dev Tools

This is also a good time to deploy our helper tools.
More info can be found [here](/features/dev-tools/global-tools)

:::
