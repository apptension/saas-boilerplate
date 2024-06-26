import importlib

from django.conf import settings
from celery import shared_task
from .services.export.services import user as user_services

module_name, package = settings.LAMBDA_TASKS_BASE_HANDLER.rsplit(".", maxsplit=1)
LambdaTask = getattr(importlib.import_module(module_name), package)


class ExportUserData(LambdaTask):
    def __init__(self):
        super().__init__(name="EXPORT_USER_DATA", source='backend.export_user')


@shared_task(bind=True)
def export_user_data(self, user_ids, admin_email):
    user_services.process_user_data_export(user_ids=user_ids, admin_email=admin_email)
