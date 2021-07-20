---
title: Google SSO
sidebar_label: Google
---

## Running locally

Set environmental variables in the `services/backend/.env` file.
If it doesn't exist create it using `services/backend/.env.example` first.

```
SOCIAL_AUTH_GOOGLE_OAUTH2_KEY=<CHANGE_ME>
SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET=<CHANGE_ME>
```

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
  "SOCIAL_AUTH_GOOGLE_OAUTH2_KEY": "<CHANGE_ME>",
  "SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET": "<CHANGE_ME>"
}
```

### Removing the feature

- Delete `social_core.backends.google.GoogleOAuth2` from `AUTHENTICATION_BACKENDS`
  setting in Django settings module.
- Delete all settings prefixed with `SOCIAL_AUTH_GOOGLE_OAUTH2_` from Django settings module.
