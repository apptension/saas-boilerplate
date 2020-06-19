# 🍔 django-restauth

[![Build Status](https://travis-ci.org/apptension/django-restauth.svg?branch=master)](https://travis-ci.org/apptension/django-restauth)

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

AUTH_USER_MODEL = 'restauth.User'

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
    'JWT_ENCODE_HANDLER': 'restauth.jwt.encode_handler',
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
