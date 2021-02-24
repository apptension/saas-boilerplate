---
id: aws-setup
title: Setup AWS account
---

## Initial setup

### Create a hosted zone

The app is HTTPs only so you will need at least one domain and a hosted zone in Route53.

Values to save:

- `id` of the hosted zone
- `name` of the hosted zone

### Create an [aws-vault](https://github.com/99designs/aws-vault) profile

This profile will be used by `Make` when running any commands that communicate with AWS platform.

Values to save:

- `name` of the aws-vault profile

## Bootstrap CDK [^1]

Switch to AWS context using aws-vault

```shell
make aws-vault ENV_STAGE=qa
```

Run CDK bootstrap

```shell
make setup-infra
```

---

[^1]: Can be omitted during setup of local environment.
