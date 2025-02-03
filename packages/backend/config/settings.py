import datetime
import json
import os

import environ

from . import monitoring

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = environ.Path(__file__) - 2

env = environ.Env(
    # set casting, default value
    DJANGO_DEBUG=(bool, False)
)

ASGI_APPLICATION = "config.asgi.application"

ENVIRONMENT_NAME = env("ENVIRONMENT_NAME", default="")

SENTRY_DSN = env("SENTRY_DSN", default=None)
SENTRY_TRACES_SAMPLE_RATE = env("SENTRY_TRACES_SAMPLE_RATE", default=0.2)
monitoring.init(SENTRY_DSN, ENVIRONMENT_NAME, SENTRY_TRACES_SAMPLE_RATE)

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.11/howto/deployment/checklist/

SECRET_KEY = env("DJANGO_SECRET_KEY")

DEBUG = env("DJANGO_DEBUG")
IS_LOCAL_DEBUG = DEBUG and ENVIRONMENT_NAME == "local"
ALLOWED_HOSTS = env.list("DJANGO_ALLOWED_HOSTS", default=[])

# Application definition

DJANGO_CORE_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

THIRD_PARTY_APPS = [
    "django_extensions",
    'django_celery_results',
    'django_celery_beat',
    "djstripe",
    "django_hosts",
    "drf_yasg",
    "rest_framework",
    "rest_framework_simplejwt.token_blacklist",
    "social_django",
    "whitenoise",
    "graphene_django",
    'channels',
    "aws_xray_sdk.ext.django",
]

LOCAL_APPS = [
    "apps.content",
    "apps.demo",
    "apps.finances",
    "apps.users",
    "apps.notifications",
    "apps.websockets",
    "apps.integrations",
    "apps.multitenancy",
]

INSTALLED_APPS = (
    [
        "daphne",
    ]
    + DJANGO_CORE_APPS
    + THIRD_PARTY_APPS
    + LOCAL_APPS
)

SILENCED_SYSTEM_CHECKS = []  # default django value

MIDDLEWARE = [
    #  HealthCheckMiddleware needs to be before the HostsRequestMiddleware
    "common.middleware.HealthCheckMiddleware",
    "aws_xray_sdk.ext.django.middleware.XRayMiddleware",
    "common.middleware.ManageCookiesMiddleware",
    "common.middleware.SetAuthTokenCookieMiddleware",
    "django_hosts.middleware.HostsRequestMiddleware",
    "django.middleware.security.SecurityMiddleware",
    'whitenoise.middleware.WhiteNoiseMiddleware',
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "django_hosts.middleware.HostsResponseMiddleware",
    "social_django.middleware.SocialAuthExceptionMiddleware",
]
ROOT_URLCONF = "config.urls_api"
ROOT_HOSTCONF = "config.hosts"
DEFAULT_HOST = "api"
PARENT_HOST = env('PARENT_HOST', default="")

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [os.path.join(BASE_DIR, "templates")],
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

PASSWORD_HASHERS = env.list(
    "DJANGO_PASSWORD_HASHERS",
    default=[
        'django.contrib.auth.hashers.PBKDF2PasswordHasher',
        'django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher',
        'django.contrib.auth.hashers.Argon2PasswordHasher',
        'django.contrib.auth.hashers.BCryptSHA256PasswordHasher',
    ],
)

WSGI_APPLICATION = "config.wsgi.application"

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': env('DJANGO_LOG_LEVEL', default='INFO'),
    },
    'loggers': {
        '*': {
            'handlers': ['console'],
            'level': env('DJANGO_LOG_LEVEL', default='INFO'),
            'propagate': False,
        },
    },
}

# Database
# https://docs.djangoproject.com/en/1.11/ref/settings/#databases

DB_CONNECTION = json.loads(env("DB_CONNECTION"))
DB_PROXY_ENDPOINT = env("DB_PROXY_ENDPOINT", default=None)

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": DB_CONNECTION["dbname"],
        "USER": DB_CONNECTION["username"],
        "PASSWORD": DB_CONNECTION["password"],
        "HOST": DB_PROXY_ENDPOINT or DB_CONNECTION["host"],
        "PORT": DB_CONNECTION["port"],
    },
    "channels_postgres": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": DB_CONNECTION["dbname"],
        "USER": DB_CONNECTION["username"],
        "PASSWORD": DB_CONNECTION["password"],
        "HOST": DB_PROXY_ENDPOINT or DB_CONNECTION["host"],
        "PORT": DB_CONNECTION["port"],
    },
}

REDIS_CONNECTION = env("REDIS_CONNECTION")

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [{"address": REDIS_CONNECTION}],
        },
    },
}

CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": REDIS_CONNECTION,
        "OPTIONS": {"CLIENT_CLASS": "django_redis.client.DefaultClient"},
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

USE_TZ = True

# Storages
# https://docs.djangoproject.com/en/4.2/ref/settings/#std-setting-STORAGES
STORAGES = {
    "default": {
        "BACKEND": "common.storages.CustomS3Boto3Storage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.11/howto/static-files/

STATIC_ROOT = os.path.join(BASE_DIR, 'static')
STATIC_URL = '/static/'

AUTH_USER_MODEL = "users.User"

AUTHENTICATION_BACKENDS = (
    'social_core.backends.google.GoogleOAuth2',
    'social_core.backends.facebook.FacebookOAuth2',
    'django.contrib.auth.backends.ModelBackend',
)

LOCALE_PATHS = []

REST_FRAMEWORK = {
    "EXCEPTION_HANDLER": "common.utils.custom_exception_handler",
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "apps.users.authentication.JSONWebTokenCookieAuthentication",
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        'rest_framework.authentication.SessionAuthentication',
    ),
    "DEFAULT_THROTTLE_RATES": {"anon": "100/day"},
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': datetime.timedelta(minutes=env.int('ACCESS_TOKEN_LIFETIME_MINUTES', default=5)),
    'REFRESH_TOKEN_LIFETIME': datetime.timedelta(days=env.int('REFRESH_TOKEN_LIFETIME_DAYS', default=7)),
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}
ACCESS_TOKEN_COOKIE = 'token'
REFRESH_TOKEN_COOKIE = 'refresh_token'
REFRESH_TOKEN_LOGOUT_COOKIE = 'refresh_token_logout'
COOKIE_MAX_AGE = 3600 * 24 * 14  # 14 days

SOCIAL_AUTH_USER_MODEL = "users.User"
SOCIAL_AUTH_USER_FIELDS = ['email', 'username']
SOCIAL_AUTH_STRATEGY = "apps.users.strategy.DjangoJWTStrategy"
SOCIAL_AUTH_JSONFIELD_ENABLED = True
SOCIAL_AUTH_REDIRECT_IS_HTTPS = env.bool('SOCIAL_AUTH_REDIRECT_IS_HTTPS', default=True)
SOCIAL_AUTH_PIPELINE = (
    'social_core.pipeline.social_auth.social_details',
    'social_core.pipeline.social_auth.social_uid',
    'social_core.pipeline.social_auth.social_user',
    'social_core.pipeline.user.get_username',
    'social_core.pipeline.social_auth.associate_by_email',
    'social_core.pipeline.user.create_user',
    'social_core.pipeline.social_auth.associate_user',
    'social_core.pipeline.social_auth.load_extra_data',
    'apps.multitenancy.pipeline.create_default_tenant',
    'social_core.pipeline.user.user_details',
)
SOCIAL_AUTH_ALLOWED_REDIRECT_HOSTS = env.list('SOCIAL_AUTH_ALLOWED_REDIRECT_HOSTS', default=[])
SOCIAL_AUTH_GOOGLE_OAUTH2_KEY = env('SOCIAL_AUTH_GOOGLE_OAUTH2_KEY', default='')
SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET = env('SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET', default='')
SOCIAL_AUTH_FACEBOOK_KEY = env('SOCIAL_AUTH_FACEBOOK_KEY', default='')
SOCIAL_AUTH_FACEBOOK_SECRET = env('SOCIAL_AUTH_FACEBOOK_SECRET', default='')
SOCIAL_AUTH_FACEBOOK_SCOPE = ['email', 'public_profile']
SOCIAL_AUTH_FACEBOOK_PROFILE_EXTRA_PARAMS = {
    'fields': 'id, name, email',
}
SOCIAL_AUTH_LOGIN_ERROR_URL = "/"
SOCIAL_AUTH_FIELDS_STORED_IN_SESSION = ["locale"]

SWAGGER_SETTINGS = {
    'DEFAULT_INFO': 'config.urls_api.api_info',
    "SECURITY_DEFINITIONS": {"api_key": {"type": "apiKey", "in": "header", "name": "Authorization"}},
}

HASHID_FIELD_SALT = env("HASHID_FIELD_SALT")

USER_NOTIFICATION_IMPL = "config.notifications.stdout"

WORKERS_EVENT_BUS_NAME = env("WORKERS_EVENT_BUS_NAME", default=None)

AWS_ENDPOINT_URL = env("AWS_ENDPOINT_URL", default=None)
AWS_REGION = env("AWS_REGION", default=None)

LAMBDA_TASKS_BASE_HANDLER = env("LAMBDA_TASKS_BASE_HANDLER", default="common.tasks.LambdaTask")
LAMBDA_TASKS_LOCAL_URL = env("LAMBDA_TASKS_LOCAL_URL", default=None)

STRIPE_LIVE_SECRET_KEY = env("STRIPE_LIVE_SECRET_KEY", default="sk_<CHANGE_ME>")
STRIPE_TEST_SECRET_KEY = env("STRIPE_TEST_SECRET_KEY", default="sk_test_<CHANGE_ME>")
STRIPE_LIVE_MODE = env.bool("STRIPE_LIVE_MODE", default=False)
DJSTRIPE_WEBHOOK_SECRET = env("DJSTRIPE_WEBHOOK_SECRET", default="")
DJSTRIPE_FOREIGN_KEY_TO_FIELD = "id"


def tenant_request_callback(request):
    return request.tenant


DJSTRIPE_SUBSCRIBER_MODEL_REQUEST_CALLBACK = tenant_request_callback
DJSTRIPE_SUBSCRIBER_MODEL = "multitenancy.Tenant"
# Disable stripe checks for keys on django application start
STRIPE_CHECKS_ENABLED = env.bool("STRIPE_CHECKS_ENABLED", default=True)
if not STRIPE_CHECKS_ENABLED:
    SILENCED_SYSTEM_CHECKS.append("djstripe.C001")

STRIPE_ENABLED = '<CHANGE_ME>' not in STRIPE_LIVE_SECRET_KEY or '<CHANGE_ME>' not in STRIPE_TEST_SECRET_KEY

SUBSCRIPTION_TRIAL_PERIOD_DAYS = env("SUBSCRIPTION_TRIAL_PERIOD_DAYS", default=7)

GRAPHENE = {
    "SCHEMA": "config.schema.schema",
    "DEFAULT_PERMISSION_CLASSES": ("common.acl.policies.IsAuthenticatedFullAccess",),
    "MIDDLEWARE": ["common.middleware.SentryMiddleware", "apps.multitenancy.middleware.TenantUserRoleMiddleware"],
}

NOTIFICATIONS_STRATEGIES = ["InAppNotificationStrategy"]

SHELL_PLUS_IMPORTS = ["from config.schema import schema"]

WEB_SOCKET_API_ENDPOINT_URL = env("WEB_SOCKET_API_ENDPOINT_URL", default="")

AWS_STORAGE_BUCKET_NAME = env("AWS_STORAGE_BUCKET_NAME", default=None)
AWS_EXPORTS_STORAGE_BUCKET_NAME = env("AWS_EXPORTS_STORAGE_BUCKET_NAME", default=None)
AWS_S3_ENDPOINT_URL = AWS_ENDPOINT_URL
AWS_S3_CUSTOM_DOMAIN = env("AWS_S3_CUSTOM_DOMAIN", default=None)
AWS_QUERYSTRING_EXPIRE = env("AWS_QUERYSTRING_EXPIRE", default=60 * 60 * 24)
AWS_CLOUDFRONT_KEY = os.environ.get('AWS_CLOUDFRONT_KEY', '').encode('ascii')
AWS_CLOUDFRONT_KEY_ID = os.environ.get('AWS_CLOUDFRONT_KEY_ID', None)
USER_DATA_EXPORT_EXPIRY_SECONDS = env.int("USER_DATA_EXPORT_EXPIRY_SECONDS", 172800)  # 2 days default

DEFAULT_AUTO_FIELD = "django.db.models.AutoField"

XRAY_RECORDER = {
    'AWS_XRAY_TRACING_NAME': f'{env("PROJECT_NAME", default="")}-{ENVIRONMENT_NAME}-backend',
    'AUTO_INSTRUMENT': not DEBUG,
    'AWS_XRAY_CONTEXT_MISSING': 'IGNORE_ERROR',
    'PLUGINS': ('ECSPlugin',),
}

CSRF_TRUSTED_ORIGINS = env("CSRF_TRUSTED_ORIGINS", default=[])
RATELIMIT_IP_META_KEY = "common.utils.get_client_ip"

OTP_AUTH_ISSUER_NAME = env("OTP_AUTH_ISSUER_NAME", default="")
OTP_AUTH_TOKEN_COOKIE = 'otp_auth_token'
OTP_AUTH_TOKEN_LIFETIME_MINUTES = datetime.timedelta(minutes=env.int('OTP_AUTH_TOKEN_LIFETIME_MINUTES', default=5))
OTP_VALIDATE_PATH = "/auth/validate-otp"

OPENAI_API_KEY = env("OPENAI_API_KEY", default="")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo-instruct")

UPLOADED_DOCUMENT_SIZE_LIMIT = env.int("UPLOADED_DOCUMENT_SIZE_LIMIT", default=10 * 1024 * 1024)
USER_DOCUMENTS_NUMBER_LIMIT = env.int("USER_DOCUMENTS_NUMBER_LIMIT", default=10)

TENANT_INVITATION_TIMEOUT = env("TENANT_INVITATION_TIMEOUT", default=60 * 60 * 24 * 14)

CELERY_RESULT_BACKEND = 'django-db'
CELERY_BROKER_URL = f'{env("REDIS_CONNECTION")}/0'
CELERY_BROKER_TRANSPORT_OPTIONS = {
    'visibility_timeout': 3600,
}

EMAIL_BACKEND = env("EMAIL_BACKEND", default="django_ses.SESBackend")
EMAIL_HOST = env("EMAIL_HOST", default=None)
EMAIL_PORT = env("EMAIL_PORT", default=None)
EMAIL_HOST_USER = env("EMAIL_HOST_USER", default=None)
EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD", default=None)
EMAIL_FROM_ADDRESS = env("EMAIL_FROM_ADDRESS", default=None)
EMAIL_REPLY_ADDRESS = env.list("EMAIL_REPLY_ADDRESS", default=(EMAIL_FROM_ADDRESS,))

AWS_SES_REGION_NAME = env("AWS_SES_REGION_NAME", default=AWS_REGION)

# If you want to use the SESv2 client
USE_SES_V2 = True
