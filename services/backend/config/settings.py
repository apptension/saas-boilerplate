import json
import os

import environ

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = environ.Path(__file__) - 2


env = environ.Env(
    # set casting, default value
    DJANGO_DEBUG=(bool, False)
)

environ.Env.read_env(os.path.join(BASE_DIR, ".env"))


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.11/howto/deployment/checklist/

SECRET_KEY = env("DJANGO_SECRET_KEY")

DEBUG = env("DJANGO_DEBUG")
ALLOWED_HOSTS = env.list("DJANGO_ALLOWED_HOSTS", default=[])
ALLOWED_CIDR_NETS = env.list("DJANGO_ALLOWED_CIDR_NETS", default=[])


# Application definition

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "drf_yasg",
    "django_hosts",
    "rest_framework_jwt.blacklist",
    "whitenoise",
    "apps.users",
]


MIDDLEWARE = [
    "django_hosts.middleware.HostsRequestMiddleware",
    "django.middleware.security.SecurityMiddleware",
    'whitenoise.middleware.WhiteNoiseMiddleware',
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "allow_cidr.middleware.AllowCIDRMiddleware",
    "django_hosts.middleware.HostsResponseMiddleware",
]
ROOT_URLCONF = "config.urls_api"
ROOT_HOSTCONF = "config.hosts"
DEFAULT_HOST = "api"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"


# Database
# https://docs.djangoproject.com/en/1.11/ref/settings/#databases

DB_CONNECTION = json.loads(env("DB_CONNECTION"))

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": DB_CONNECTION["dbname"],
        "USER": DB_CONNECTION["username"],
        "PASSWORD": DB_CONNECTION["password"],
        "HOST": DB_CONNECTION["host"],
        "PORT": DB_CONNECTION["port"],
    }
}


# Password validation
# https://docs.djangoproject.com/en/1.11/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]


# Internationalization
# https://docs.djangoproject.com/en/1.11/topics/i18n/

LANGUAGE_CODE = "en"

TIME_ZONE = "UTC"

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.11/howto/static-files/

STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

STATIC_ROOT = os.path.join(BASE_DIR, 'static')
STATIC_URL = '/static/'

AUTH_USER_MODEL = "users.User"

LOCALE_PATHS = []

REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
    "DEFAULT_AUTHENTICATION_CLASSES": ("rest_framework_jwt.authentication.JSONWebTokenAuthentication",),
    "DEFAULT_THROTTLE_RATES": {"anon": "100/day"},
}

JWT_AUTH = {
    'JWT_ENCODE_HANDLER': 'apps.users.jwt.encode_handler',
}

SWAGGER_SETTINGS = {
    "SECURITY_DEFINITIONS": {"api_key": {"type": "apiKey", "in": "header", "name": "Authorization"}},
}

HASHID_FIELD_SALT = env("HASHID_FIELD_SALT")

USER_NOTIFICATION_IMPL = "config.notifications.stdout"

WORKERS_EVENT_BUS_NAME = env("WORKERS_EVENT_BUS_NAME", default=None)

AWS_ENDPOINT_URL = env("AWS_ENDPOINT_URL", default=None)

TASKS_BASE_HANDLER = env("TASKS_BASE_HANDLER", default="common.tasks.Task")
