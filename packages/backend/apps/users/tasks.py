import importlib

from django.conf import settings

module_name, package = settings.LAMBDA_TASKS_BASE_HANDLER.rsplit(".", maxsplit=1)
LambdaTask = getattr(importlib.import_module(module_name), package)


class ExportUserData(LambdaTask):
    def __init__(self):
        super().__init__(name="EXPORT_USER_DATA", source='backend.export_user')
