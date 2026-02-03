from django.apps import AppConfig


class SsoConfig(AppConfig):
    default_auto_field = "django.db.models.AutoField"
    name = "apps.sso"
    verbose_name = "Enterprise SSO"

    def ready(self):
        from . import signals  # noqa: F401
