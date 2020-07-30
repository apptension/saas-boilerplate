import logging
from os import path

import boto3
import pystache
from botocore.exceptions import ClientError

import settings
from . import emails  # noqa
from .config import email_handlers, EmailConfig

CHARSET = "UTF-8"

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def get_ses_client():
    return boto3.client('ses', endpoint_url=settings.AWS_ENDPOINT_URL)


def send_local(email_config, rendered_html):
    import smtplib
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart

    message = MIMEMultipart()
    message["Subject"] = email_config.subject
    message["From"] = settings.FROM_EMAIL
    message["To"] = email_config.to

    message.attach(MIMEText(rendered_html, 'plain'))

    smtp_client = smtplib.SMTP(host=settings.SMTP_HOST, port=1025)
    smtp_client.send_message(message)

    print("Successfully sent email")


def send(email_config, rendered_html):
    if not settings.EMAIL_ENABLED:
        send_local(email_config, rendered_html)
    else:
        ses_client = get_ses_client()
        try:
            response = ses_client.send_email(
                Source=settings.FROM_EMAIL,
                Message={
                    'Subject': {'Data': email_config.subject, 'Charset': CHARSET},
                    'Body': {'Html': {'Data': rendered_html, 'Charset': CHARSET}},
                },
                Destination={'ToAddresses': [email_config.to]},
            )
        except ClientError as e:
            logger.error(e.response['Error']['Message'])
        else:
            logger.info("Email sent! Message ID:"),
            logger.info(response['MessageId'])


def send_email(data):
    type_ = data.pop("type")

    try:
        email_handler = email_handlers[type_]
    except AttributeError:
        raise Exception(f'Unknown email type {type_}')

    email_config: EmailConfig = email_handler(data)

    template_dir = path.join(settings.LAMBDA_TASK_ROOT, 'emails/templates')
    with open(path.join(template_dir, f'{email_config.template}.html')) as f:
        template_html = ''.join([line.rstrip('\n') for line in f])

    rendered_html = pystache.render(template_html, email_config.template_vars)

    send(email_config, rendered_html)
