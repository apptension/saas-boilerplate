import importlib

from django.conf import settings

module_name, package = settings.TASKS_BASE_HANDLER.rsplit(".", maxsplit=1)
Task = getattr(importlib.import_module(module_name), package)


class ExportUserData(Task):
    def __init__(self):
        super().__init__(name="EXPORT_USER_DATA", source='backend.export_user')
