---
title: SSO general info
sidebar_label: General
---

We're using [social-auth-app-django](https://github.com/python-social-auth/social-app-django) package to implement
social logins which is a part of [python-social-auth ecosystem](https://github.com/python-social-auth/social-core).

Project documentation is available at http://python-social-auth.readthedocs.org/.

## What is custom?

We introduced one significant change in the default configuration of the Django Social App:
a custom `SOCIAL_AUTH_STRATEGY` named `DjangoJWTStrategy`.
We use it to set an authentication HTTP only cookies during the last redirection back to the web app.

## Running locally

Set environmental variables in the `services/backend/.env` file.
If it doesn't exist create it using `services/backend/.env.example` first.

```
SOCIAL_AUTH_ALLOWED_REDIRECT_HOSTS=localhost:3000
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
  "SOCIAL_AUTH_ALLOWED_REDIRECT_HOSTS": "<CHANGE_ME>"
}
```

### Removing the feature

- Delete `social_django` from `INSTALLED_APPS` Django setting.
- Delete all backends from `social_core` package from `AUTHENTICATION_BACKENDS` Django setting.
- Delete all settings prefixed with `SOCIAL_` from Django settings module.
- Remove `social-auth-app-django` from Pipfile.
- Remove `social-auth-core` from Pipfile.
