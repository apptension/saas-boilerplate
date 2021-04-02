import importlib

from django.conf import settings

module_name, package = settings.TASKS_BASE_HANDLER.rsplit(".", maxsplit=1)
Task = getattr(importlib.import_module(module_name), package)


class SendEmail(Task):
    def __init__(self, name: str):
        super().__init__(name=name, source='backend.email')

    def apply(self, to: str, data, due_date=None):
        if data is None:
            data = {}

        super().apply(
            {
                "to": to,
                **data,
            },
            due_date,
        )


class BaseEmail:
    serializer_class = None

    def get_serializer(self, *args, **kwargs):
        serializer_class = self.get_serializer_class()
        if serializer_class is None:
            return None
        kwargs.setdefault('context', self.get_serializer_context())
        return serializer_class(*args, **kwargs)

    def get_serializer_class(self):
        return self.serializer_class

    def get_serializer_context(self):
        """
        Extra context provided to the serializer class.
        """
        return {}


class Email(BaseEmail):
    name = None

    def __init__(self, to, data=None):
        self.to = to
        self.data = data
        if data is None:
            self.data = {}

    def send(self, due_date=None):
        send_data = None

        serializer = self.get_serializer(data=self.data)
        if serializer:
            serializer.is_valid(raise_exception=True)
            send_data = serializer.data

        email_task = SendEmail(self.name)
        email_task.apply(to=self.to, data=send_data, due_date=due_date)
