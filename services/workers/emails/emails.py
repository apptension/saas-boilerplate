import settings
from .config import email, EmailConfig


@email('account_activation')
def account_activation_email(data):
    return EmailConfig(
        to=data['to'],
        subject='Activate your account!',
        template='account_activation',
        template_vars={**data, "web_app_url": settings.WEB_APP_URL},
    )


@email('password_reset')
def password_reset_email(data):
    return EmailConfig(
        to=data['to'],
        subject='Reset password',
        template='password_reset',
        template_vars={**data, "web_app_url": settings.WEB_APP_URL},
    )
