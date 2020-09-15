# 🍔 django-restauth

## Make rules

### `make install`
Runs installation of all required project dependencies.

### `make install-deploy`
This rule will be used by CodeBuild to install dependencies required to deploy previously built artifact.
This rule should most likely stay unchanged unless you know what you're doing!

### `make test`
Runs tests and linters inside docker container.

### `make build`
Builds docker images used by the backend and pushes them to AWS ECR repository.
Make sure you're logged into the AWS using `make aws-vault` command.

### `make deploy`
This rule deploys admin-panel, api, and migrations stacks.

## Running

```
pip install pipenv
pipenv install
pipenv run python manage.py runserver
```

## Usage

* Modify your settings

```python
# ..

AUTH_USER_MODEL = 'users.User'

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_jwt.authentication.JSONWebTokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
    ),
}

JWT_AUTH = {
    'JWT_ENCODE_HANDLER': 'apps.users.jwt.encode_handler',
}

HASHID_FIELD_SALT = ''
```

* Generate `HASHID_FIELD_SALT`

`from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())`

* Modify `urls.py`

## Features

- [x] Register user with profile in single API call
- [x] Login endpoint to return JWT token
- [x] User account activation endpoint
- [x] User profile endpoint
- [x] HashID for User primary key
- [x] Password reset & change endpoints
- [x] Add Swagger for API documentation
- [x] Ability to set user notification implementation
- [x] Health check endpoint with DB migrations validation
- [x] Two separate hosts, api & admin using django-hosts

