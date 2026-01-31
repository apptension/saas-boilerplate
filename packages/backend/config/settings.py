import datetime
import json
import os
import warnings

import environ

# Suppress pkg_resources deprecation warnings from third-party packages
# (docutils, etc.) until they release fixes
warnings.filterwarnings(
    "ignore",
    message="pkg_resources is deprecated as an API",
    category=UserWarning,
)

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

# Tracing Backend Configuration
# Supported backends:
# - xray: AWS X-Ray (default, for AWS deployments)
# - otel: OpenTelemetry (for vendor-agnostic tracing)
# - none: Disable tracing
TRACING_BACKEND = env("TRACING_BACKEND", default="xray")

THIRD_PARTY_APPS = [
    "corsheaders",
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
]

# Conditionally add X-Ray app (only for AWS deployments)
if TRACING_BACKEND == 'xray':
    THIRD_PARTY_APPS.append("aws_xray_sdk.ext.django")

LOCAL_APPS = [
    "apps.content",
    "apps.demo",
    "apps.finances",
    "apps.users",
    "apps.notifications",
    "apps.websockets",
    "apps.integrations",
    "apps.multitenancy",
    "apps.sso",
    "apps.translations",
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
    "common.middleware.ManageCookiesMiddleware",
    "common.middleware.SetAuthTokenCookieMiddleware",
    "django_hosts.middleware.HostsRequestMiddleware",
    "django.middleware.security.SecurityMiddleware",
    'whitenoise.middleware.WhiteNoiseMiddleware',
    "corsheaders.middleware.CorsMiddleware",  # Must be before CommonMiddleware
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "django_hosts.middleware.HostsResponseMiddleware",
    "social_django.middleware.SocialAuthExceptionMiddleware",
]

# Conditionally add X-Ray middleware (only for AWS deployments)
if TRACING_BACKEND == 'xray':
    # Insert after HealthCheckMiddleware
    MIDDLEWARE.insert(1, "aws_xray_sdk.ext.django.middleware.XRayMiddleware")
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
#
# Supports two configuration formats:
# 1. DATABASE_URL (for Render, Heroku, Railway, etc.)
#    Example: postgresql://user:password@host:5432/dbname
# 2. DB_CONNECTION JSON (for AWS RDS, existing deployments)
#    Example: {"host": "...", "port": 5432, "dbname": "...", "username": "...", "password": "..."}

import dj_database_url

DATABASE_URL = env("DATABASE_URL", default=None)

# Database connection settings
# conn_max_age: How long to keep connections open (in seconds)
# - 0: Close after each request (safest for limited connection pools)
# - 60: Keep open for 1 minute (good balance for dedicated databases)
# - 600: Keep open for 10 minutes (too long for limited connection pools)
#
# IMPORTANT: For Render.com deployments with basic-1gb PostgreSQL (~22-25 max connections):
# - Set DB_CONN_MAX_AGE=0 for backend-api to close connections after each request
# - This prevents connection exhaustion when multiple services share the database
# - The slight overhead of reconnecting is worth it for stability
#
# Connection math for Render.com basic-1gb plan:
# - Backend API: 2 workers × 1 conn = 2 connections (or 2×concurrent requests with conn_max_age=0)
# - Celery Worker: 2 processes × 1 conn = 2 connections
# - Celery Beat: 1 connection
# - Health checks: Cached (1 conn per 30s), closed immediately after use
# - Headroom for superuser: 3 connections reserved
# - Total: ~8-10 connections during normal operation (safe margin from 22-25 limit)
DB_CONN_MAX_AGE = env.int("DB_CONN_MAX_AGE", default=60)

# Health check cache TTL (seconds)
# How long to cache the migration check result before rechecking.
# This reduces database connection pressure from frequent health checks.
# Default: 30 seconds (Render health checks run every 10-30 seconds)
HEALTH_CHECK_CACHE_TTL = env.int("HEALTH_CHECK_CACHE_TTL", default=30)

if DATABASE_URL:
    # Use DATABASE_URL format (Render, Heroku, Railway, etc.)
    # conn_health_checks=True: Verify connection health before use (Django 4.1+)
    DATABASES = {
        "default": dj_database_url.config(default=DATABASE_URL, conn_max_age=DB_CONN_MAX_AGE, conn_health_checks=True),
    }
    # Add connection timeout for Celery workers (prevents hanging on DB issues)
    # connect_timeout: Time in seconds to wait for connection (default: no limit)
    # statement_timeout: Time in ms to wait for query (0 = no limit)
    DATABASES['default'].setdefault('OPTIONS', {})
    DATABASES['default']['OPTIONS']['connect_timeout'] = 30  # 30 second connection timeout

    DB_PROXY_ENDPOINT = None  # Not used with DATABASE_URL
else:
    # Use DB_CONNECTION JSON format (AWS RDS)
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
#
# Supported backends (set via STORAGE_BACKEND env var):
# - s3: AWS S3 (default)
# - r2: Cloudflare R2
# - b2: Backblaze B2
# - minio: Self-hosted MinIO
# - local: Local filesystem
from common.storages import get_default_storage_backend

STORAGE_BACKEND = env("STORAGE_BACKEND", default="s3")

STORAGES = {
    "default": {
        "BACKEND": get_default_storage_backend(),
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

# Cloudflare R2 settings (used when STORAGE_BACKEND=r2)
R2_ENDPOINT_URL = env("R2_ENDPOINT_URL", default=None)
R2_ACCESS_KEY_ID = env("R2_ACCESS_KEY_ID", default=None)
R2_SECRET_ACCESS_KEY = env("R2_SECRET_ACCESS_KEY", default=None)
R2_BUCKET_NAME = env("R2_BUCKET_NAME", default=None)
R2_CUSTOM_DOMAIN = env("R2_CUSTOM_DOMAIN", default=None)

# Backblaze B2 settings (used when STORAGE_BACKEND=b2)
B2_ENDPOINT_URL = env("B2_ENDPOINT_URL", default=None)
B2_ACCESS_KEY_ID = env("B2_ACCESS_KEY_ID", default=None)
B2_SECRET_ACCESS_KEY = env("B2_SECRET_ACCESS_KEY", default=None)
B2_BUCKET_NAME = env("B2_BUCKET_NAME", default=None)

# MinIO settings (used when STORAGE_BACKEND=minio)
MINIO_ENDPOINT_URL = env("MINIO_ENDPOINT_URL", default=None)
MINIO_ACCESS_KEY_ID = env("MINIO_ACCESS_KEY_ID", default=None)
MINIO_SECRET_ACCESS_KEY = env("MINIO_SECRET_ACCESS_KEY", default=None)
MINIO_BUCKET_NAME = env("MINIO_BUCKET_NAME", default=None)

# Local/Media storage settings (used when STORAGE_BACKEND=local)
MEDIA_ROOT = env("MEDIA_ROOT", default=os.path.join(BASE_DIR, 'media'))
MEDIA_URL = env("MEDIA_URL", default='/media/')

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
    # Global throttle classes - applied to all DRF views unless overridden
    # See common/ratelimiting/ for detailed configuration
    "DEFAULT_THROTTLE_CLASSES": [
        "common.ratelimiting.GlobalAnonThrottle",
        "common.ratelimiting.GlobalUserThrottle",
    ],
    # Fallback rates for DRF's built-in throttle classes
    "DEFAULT_THROTTLE_RATES": {
        "anon": env("RATE_LIMIT_ANON", default="60/min"),
        "user": env("RATE_LIMIT_USER", default="300/min"),
        "mcp_proxy": env("RATE_LIMIT_MCP_PROXY", default="30/min"),
        "mcp_chat": env("RATE_LIMIT_MCP_CHAT", default="10/min"),
    },
}

# =============================================================================
# Rate Limiting Configuration
# =============================================================================
# Centralized rate limiting for both GraphQL and REST endpoints.
# All limits are environment-configurable.
#
# Usage:
#   - GraphQL: Use @graphql_ratelimit decorator from common.ratelimiting
#   - REST: Use throttle classes from common.ratelimiting.throttles
#   - WebSocket: Use WebSocketRateLimiter from common.ratelimiting.websocket
#
# For detailed documentation, see: common/ratelimiting/README.md
#
# Override specific limits via environment variables or this dict:
# RATE_LIMITS = {
#     'auth.login': {'rate': '50/min'},
#     'ai.chat.message': {'rate': '15/min', 'tier_rates': {'power': '30/min'}},
# }

RATE_LIMITS = {
    # Authentication - protect against credential stuffing and abuse
    'auth.login': {'rate': env('RATE_LIMIT_AUTH_LOGIN', default='30/min')},
    'auth.signup': {'rate': env('RATE_LIMIT_AUTH_SIGNUP', default='10/min')},
    'auth.password_reset': {'rate': env('RATE_LIMIT_AUTH_PASSWORD_RESET', default='5/hour')},
    'auth.otp': {'rate': env('RATE_LIMIT_AUTH_OTP', default='10/min')},
    'auth.passkey': {'rate': env('RATE_LIMIT_AUTH_PASSKEY', default='10/min')},
    # GraphQL - global limits
    'graphql.global.anon': {'rate': env('RATE_LIMIT_GQL_ANON', default='60/min')},
    'graphql.global.user': {
        'rate': env('RATE_LIMIT_GQL_USER', default='300/min'),
        'tier_rates': {
            'free': env('RATE_LIMIT_GQL_USER_FREE', default='150/min'),
            'standard': env('RATE_LIMIT_GQL_USER', default='300/min'),
            'power': env('RATE_LIMIT_GQL_USER_POWER', default='1000/min'),
        },
    },
    # AI/MCP - expensive OpenAI API calls
    'ai.chat.message': {
        'rate': env('RATE_LIMIT_AI_CHAT', default='10/min'),
        'tier_rates': {
            'free': env('RATE_LIMIT_AI_CHAT_FREE', default='5/min'),
            'standard': env('RATE_LIMIT_AI_CHAT', default='10/min'),
            'power': env('RATE_LIMIT_AI_CHAT_POWER', default='20/min'),
        },
    },
    'ai.chat.hourly': {
        'rate': env('RATE_LIMIT_AI_CHAT_HOURLY', default='60/hour'),
        'tier_rates': {
            'free': env('RATE_LIMIT_AI_CHAT_HOURLY_FREE', default='30/hour'),
            'standard': env('RATE_LIMIT_AI_CHAT_HOURLY', default='60/hour'),
            'power': env('RATE_LIMIT_AI_CHAT_HOURLY_POWER', default='150/hour'),
        },
    },
    'ai.mcp.proxy': {'rate': env('RATE_LIMIT_AI_MCP', default='30/min')},
    'ai.parse': {'rate': env('RATE_LIMIT_AI_PARSE', default='5/min')},
    'ai.detect': {'rate': env('RATE_LIMIT_AI_DETECT', default='10/min')},
    # Import operations - heavy DB operations
    'import.csv': {'rate': env('RATE_LIMIT_IMPORT_CSV', default='3/min')},
    'import.excel': {'rate': env('RATE_LIMIT_IMPORT_EXCEL', default='3/min')},
    'import.daily': {'rate': env('RATE_LIMIT_IMPORT_DAILY', default='50/day')},
    # File uploads
    'file.upload': {'rate': env('RATE_LIMIT_FILE_UPLOAD', default='20/min')},
    'file.upload.large': {'rate': env('RATE_LIMIT_FILE_UPLOAD_LARGE', default='5/min')},
    # SSO
    'sso.login': {'rate': env('RATE_LIMIT_SSO_LOGIN', default='20/min')},
    'sso.discovery': {'rate': env('RATE_LIMIT_SSO_DISCOVERY', default='60/min')},
    'sso.scim': {'rate': env('RATE_LIMIT_SSO_SCIM', default='100/min')},
}

# Cache backend for rate limiting (uses default cache, typically Redis)
# For distributed rate limiting across multiple instances, ensure Redis is configured
RATELIMIT_USE_CACHE = env('RATELIMIT_USE_CACHE', default='default')

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
SESSION_ID_COOKIE = 'session_id'  # For tracking active sessions
COOKIE_MAX_AGE = 3600 * 24 * 14  # 14 days

# Cookie security settings for cross-origin deployments (Render.com, etc.)
# For cross-origin (frontend and backend on different domains):
#   COOKIE_SAMESITE=None and COOKIE_SECURE=True are REQUIRED
# For same-origin (subdomains like app.example.com and api.example.com):
#   COOKIE_SAMESITE=Lax (default) and COOKIE_SECURE=True are recommended
COOKIE_SECURE = env.bool('COOKIE_SECURE', default=not DEBUG)  # True in production
_cookie_samesite_raw = env('COOKIE_SAMESITE', default='Lax')
# Handle edge cases: empty string, 'none' lowercase, or falsy values
if not _cookie_samesite_raw or _cookie_samesite_raw.lower() == 'none':
    COOKIE_SAMESITE = 'None'  # Proper capitalization required by Django
elif _cookie_samesite_raw.lower() in ('lax', 'strict'):
    COOKIE_SAMESITE = _cookie_samesite_raw.capitalize()
else:
    COOKIE_SAMESITE = 'Lax'  # Fallback to safe default

# Django's built-in CSRF cookie settings (must match our custom cookie settings for cross-origin)
CSRF_COOKIE_SECURE = COOKIE_SECURE  # Required for SameSite=None
CSRF_COOKIE_SAMESITE = COOKIE_SAMESITE  # Must be 'None' for cross-origin
CSRF_COOKIE_HTTPONLY = False  # CSRF token needs to be readable by JavaScript

# Django's session cookie settings (for social auth and admin)
SESSION_COOKIE_SECURE = COOKIE_SECURE  # Required for SameSite=None
SESSION_COOKIE_SAMESITE = COOKIE_SAMESITE  # Must be 'None' for cross-origin

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
    SILENCED_SYSTEM_CHECKS.extend(
        [
            "djstripe.C001",  # API keys not set
            "djstripe.I001",  # No API keys in database
            "djstripe.I002",  # Keys in settings, should use admin
        ]
    )

STRIPE_ENABLED = '<CHANGE_ME>' not in STRIPE_LIVE_SECRET_KEY or '<CHANGE_ME>' not in STRIPE_TEST_SECRET_KEY

SUBSCRIPTION_TRIAL_PERIOD_DAYS = env("SUBSCRIPTION_TRIAL_PERIOD_DAYS", default=7)

GRAPHENE = {
    "SCHEMA": "config.schema.schema",
    "DEFAULT_PERMISSION_CLASSES": ("common.acl.policies.IsAuthenticatedFullAccess",),
    "MIDDLEWARE": [
        # SECURITY: Disable introspection in production
        "common.graphql.security.DisableIntrospectionMiddleware",
        # SECURITY: Sanitize error messages in production
        "common.graphql.security.SanitizeErrorsMiddleware",
        "common.middleware.SentryMiddleware",
        "apps.multitenancy.middleware.TenantUserRoleMiddleware",
    ],
}

NOTIFICATIONS_STRATEGIES = ["InAppNotificationStrategy"]

SHELL_PLUS_IMPORTS = ["from config.schema import schema"]

WEB_SOCKET_API_ENDPOINT_URL = env("WEB_SOCKET_API_ENDPOINT_URL", default="")

AWS_STORAGE_BUCKET_NAME = env("AWS_STORAGE_BUCKET_NAME", default=None)
AWS_EXPORTS_STORAGE_BUCKET_NAME = env("AWS_EXPORTS_STORAGE_BUCKET_NAME", default=None)
AWS_S3_ENDPOINT_URL = AWS_ENDPOINT_URL
AWS_S3_CUSTOM_DOMAIN = env("AWS_S3_CUSTOM_DOMAIN", default=None)
AWS_S3_URL_PROTOCOL = env("AWS_S3_URL_PROTOCOL", default="https:")
AWS_QUERYSTRING_EXPIRE = env("AWS_QUERYSTRING_EXPIRE", default=60 * 60 * 24)
AWS_CLOUDFRONT_KEY = os.environ.get('AWS_CLOUDFRONT_KEY', '').encode('ascii')
AWS_CLOUDFRONT_KEY_ID = os.environ.get('AWS_CLOUDFRONT_KEY_ID', None)
USER_DATA_EXPORT_EXPIRY_SECONDS = env.int("USER_DATA_EXPORT_EXPIRY_SECONDS", 172800)  # 2 days default

DEFAULT_AUTO_FIELD = "django.db.models.AutoField"

# X-Ray Recorder configuration (only used when TRACING_BACKEND=xray)
if TRACING_BACKEND == 'xray':
    XRAY_RECORDER = {
        'AWS_XRAY_TRACING_NAME': f'{env("PROJECT_NAME", default="")}-{ENVIRONMENT_NAME}-backend',
        'AUTO_INSTRUMENT': not DEBUG,
        'AWS_XRAY_CONTEXT_MISSING': 'IGNORE_ERROR',
        'PLUGINS': ('ECSPlugin',),
    }

CSRF_TRUSTED_ORIGINS = env.list("CSRF_TRUSTED_ORIGINS", default=[])

# CORS Configuration for cross-origin deployments (e.g., Render.com)
# When webapp and backend are on different domains, CORS must be enabled
CORS_ALLOWED_ORIGINS = env.list("CORS_ALLOWED_ORIGINS", default=[])
CORS_ALLOW_CREDENTIALS = True  # Required for cookie-based authentication
CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]

RATELIMIT_IP_META_KEY = "common.utils.get_client_ip"

OTP_AUTH_ISSUER_NAME = env("OTP_AUTH_ISSUER_NAME", default="")
OTP_AUTH_TOKEN_COOKIE = 'otp_auth_token'
OTP_AUTH_TOKEN_LIFETIME_MINUTES = datetime.timedelta(minutes=env.int('OTP_AUTH_TOKEN_LIFETIME_MINUTES', default=5))
OTP_VALIDATE_PATH = "/auth/validate-otp"

OPENAI_API_KEY = env("OPENAI_API_KEY", default="")
# Use gpt-5.1 by default as it supports both vision (image parsing) and JSON mode
# Other options: gpt-4o, gpt-4o-mini, gpt-4-turbo
# Note: gpt-4 and gpt-4-vision-preview do NOT support JSON mode with vision
OPENAI_MODEL = env("OPENAI_MODEL", default="gpt-5.1")

# MCP Server Configuration for AI Assistant
# The MCP server exposes GraphQL operations as tools for AI models
MCP_SERVER_URL = env("MCP_SERVER_URL", default="http://mcp-server:4000")

# SSO Configuration
SSO_SP_ENTITY_ID_BASE = env("SSO_SP_ENTITY_ID_BASE", default="")  # e.g., https://api.yourdomain.com
WEB_APP_URL = env("WEB_APP_URL", default="http://localhost:3000")
API_URL = env("API_URL", default="http://localhost:5001")

# WebAuthn/Passkey Settings
# SECURITY: Set to True to temporarily skip signature verification for backwards compatibility
# This should be False in production once all passkeys have been re-registered
WEBAUTHN_SKIP_SIGNATURE_VERIFICATION = env.bool("WEBAUTHN_SKIP_SIGNATURE_VERIFICATION", default=True)
# Allow origin mismatch during development only
WEBAUTHN_ALLOW_ORIGIN_MISMATCH = env.bool("WEBAUTHN_ALLOW_ORIGIN_MISMATCH", default=IS_LOCAL_DEBUG)
# Strict sign count verification (detects cloned authenticators)
WEBAUTHN_STRICT_SIGN_COUNT = env.bool("WEBAUTHN_STRICT_SIGN_COUNT", default=False)

UPLOADED_DOCUMENT_SIZE_LIMIT = env.int("UPLOADED_DOCUMENT_SIZE_LIMIT", default=10 * 1024 * 1024)
USER_DOCUMENTS_NUMBER_LIMIT = env.int("USER_DOCUMENTS_NUMBER_LIMIT", default=10)

TENANT_INVITATION_TIMEOUT = env("TENANT_INVITATION_TIMEOUT", default=60 * 60 * 24 * 14)

# Task Backend Configuration
# Supported backends:
# - lambda: AWS Lambda + EventBridge (default, for AWS deployments)
# - celery: Celery (for Render, VPS, Railway, Fly.io, etc.)
TASK_BACKEND = env("TASK_BACKEND", default="lambda")

# Celery Configuration
CELERY_RESULT_BACKEND = 'django-db'
CELERY_BROKER_URL = f'{env("REDIS_CONNECTION")}/0'
CELERY_BROKER_TRANSPORT_OPTIONS = {
    'visibility_timeout': 3600,
}

# Celery worker settings for memory-constrained environments
# Close database connections after each task to prevent connection leaks
# (Also handled by signals in config/celery.py)
CELERY_WORKER_MAX_TASKS_PER_CHILD = env.int("CELERY_WORKER_MAX_TASKS_PER_CHILD", default=50)
CELERY_WORKER_PREFETCH_MULTIPLIER = 1  # Don't prefetch tasks (reduces memory usage)

# Celery Beat Schedule for periodic tasks
CELERY_BEAT_SCHEDULE = {
    # 'sync-fx-rates-every-4-hours': {
    #     'task': 'apps.example.tasks.example_sync',
    #     'schedule': 60 * 60 * 4,  # Every 4 hours (in seconds)
    # },
}

# Contentful CMS settings (optional)
CONTENTFUL_SPACE_ID = env("VITE_CONTENTFUL_SPACE", default=None)

# Only add Contentful sync to Celery Beat if:
# 1. Using Celery backend
# 2. Contentful is actually configured
# This prevents running a task every 5 minutes that does nothing
if TASK_BACKEND == 'celery' and CONTENTFUL_SPACE_ID:
    CELERY_BEAT_SCHEDULE['sync-contentful-every-5-minutes'] = {
        'task': 'common.task_backends.celery_tasks.synchronize_contentful_content',
        'schedule': 60 * 5,  # Every 5 minutes
    }

# Email configuration - supports multiple providers
# Supported backends:
# - django_ses.SESBackend (AWS SES - default)
# - sendgrid_backend.SendgridBackend (SendGrid)
# - django.core.mail.backends.smtp.EmailBackend (Generic SMTP)
# - django.core.mail.backends.console.EmailBackend (Development/Debug)
EMAIL_BACKEND = env("EMAIL_BACKEND", default="django_ses.SESBackend")
EMAIL_FROM_ADDRESS = env("EMAIL_FROM_ADDRESS", default=None)
EMAIL_REPLY_ADDRESS = env.list("EMAIL_REPLY_ADDRESS", default=(EMAIL_FROM_ADDRESS,))

# AWS SES settings (used when EMAIL_BACKEND=django_ses.SESBackend)
AWS_SES_REGION_NAME = env("AWS_SES_REGION_NAME", default=AWS_REGION)
USE_SES_V2 = env.bool("USE_SES_V2", default=True)

# SendGrid settings (used when EMAIL_BACKEND=sendgrid_backend.SendgridBackend)
SENDGRID_API_KEY = env("SENDGRID_API_KEY", default=None)
SENDGRID_SANDBOX_MODE_IN_DEBUG = env.bool("SENDGRID_SANDBOX_MODE_IN_DEBUG", default=False)

# Generic SMTP settings (used when EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend)
EMAIL_HOST = env("EMAIL_HOST", default=None)
EMAIL_PORT = env.int("EMAIL_PORT", default=587)
EMAIL_HOST_USER = env("EMAIL_HOST_USER", default=None)
EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD", default=None)
EMAIL_USE_TLS = env.bool("EMAIL_USE_TLS", default=True)
EMAIL_USE_SSL = env.bool("EMAIL_USE_SSL", default=False)

# Translations settings
# Translations use the same storage backend as the rest of the app (STORAGE_BACKEND)
# No additional configuration needed - uses R2_*, B2_*, MINIO_*, or AWS_* settings automatically
