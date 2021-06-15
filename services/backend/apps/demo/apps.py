from django.apps import AppConfig


class DemoConfig(AppConfig):
    name = 'apps.demo'

    def ready(self):
        from . import signals  # noqa
