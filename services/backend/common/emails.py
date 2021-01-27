from dataclasses import asdict

import importlib
from django.conf import settings

module_name, package = settings.TASKS_BASE_HANDLER.rsplit(".", maxsplit=1)
Task = getattr(importlib.import_module(module_name), package)


class SendEmail(Task):
    def __init__(self, name: str):
        super().__init__(name=name, source='backend.email')

    def apply(self, to: str, data):
        super().apply(
            {"to": to, **asdict(data),}
        )
