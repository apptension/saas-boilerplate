from django.apps import AppConfig


class FinancesConfig(AppConfig):
    name = 'apps.finances'

    def ready(self):
        from . import signals  # noqa
        from . import webhooks  # noqa
