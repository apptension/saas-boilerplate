from dataclasses import dataclass

email_handlers = {}


@dataclass
class EmailConfig:
    to: str
    subject: str
    template: str
    template_vars: dict


@dataclass
class EmailParams:
    to: str


def email(name):
    def inner(func):
        email_handlers[name] = func
        return func

    return inner
