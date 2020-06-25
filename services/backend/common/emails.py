from dataclasses import dataclass, asdict

from .tasks import Task


@dataclass
class EmailParams:
    to: str


class SendEmail(Task):
    def __init__(self, name: str):
        super().__init__(name=name, source='backend.email')

    def apply(self, data: EmailParams):
        super().apply(asdict(data))
