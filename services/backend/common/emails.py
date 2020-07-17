import importlib
from dataclasses import dataclass, asdict

from django.conf import settings

module_name, package = settings.TASKS_BASE_HANDLER.rsplit(".", maxsplit=1)
Task = getattr(importlib.import_module(module_name), package)


@dataclass
class EmailParams:
    to: str


class SendEmail(Task):
    def __init__(self, name: str):
        super().__init__(name=name, source='backend.email')

    def apply(self, data: EmailParams):
        super().apply(asdict(data))
