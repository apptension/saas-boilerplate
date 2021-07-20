---
title: Sentry
---

## Running in AWS

##### Start AWS vault session

Run following command in the root of your project:

```shell
make aws-vault ENV_STAGE=<CHANGE_ME>
```

##### Set variables in AWS

First start the SSM editor tool by running following command in the root of your project:

```shell
make -C services/backend secrets
```

Variables are set in a JSON format so add following keys:

```json
{
  "SENTRY_DSN": "<CHANGE_ME>"
}
```

### Removing the feature

- Delete `sentry_sdk.init()` call in `services/backend/config/settings.py` module.
- Delete `sentry_sdk.init()` call in `services/workers/utils/monitoring.py`
- Remove `sentry-sdk` from Pipfile.
