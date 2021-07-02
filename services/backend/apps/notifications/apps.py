from django.apps import AppConfig


class NotificationsConfig(AppConfig):
    name = 'apps.notifications'

    def ready(self):
        from . import signals  # noqa
