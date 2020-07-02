from dataclasses import dataclass

from .config import email, EmailConfig, EmailParams


@dataclass
class WelcomeEmailParams(EmailParams):
    name: str


@email('WelcomeEmail')
def welcome_email(data):
    params = WelcomeEmailParams(**data)

    return EmailConfig(to=params.to, subject='Welcome!', template='welcome', template_vars={'name': params.name},)
