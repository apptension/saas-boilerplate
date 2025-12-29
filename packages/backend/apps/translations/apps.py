from django.apps import AppConfig


class TranslationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.translations'
    verbose_name = 'Translations'

    def ready(self):
        pass
