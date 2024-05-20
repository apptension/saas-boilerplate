from django.apps import AppConfig


class MultitenancyConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.multitenancy'
