from dataclasses import dataclass

from common import SendEmail, EmailParams


@dataclass
class WelcomeEmailParams(EmailParams):
    name: str


send_welcome_email = SendEmail("WelcomeEmail")
