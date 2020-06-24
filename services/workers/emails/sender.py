import logging
from os import path

import boto3
import pystache
from botocore.exceptions import ClientError

import settings
from .config import email_handlers, EmailConfig

CHARSET = "UTF-8"

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def get_ses_client():
    return boto3.client('ses')


def send_email(name, data):
    email_handler = email_handlers.get(name)

    if not email_handler:
        raise Exception(f'Unknown email type {name}')

    email_config: EmailConfig = email_handler(data)

    template_dir = path.join(settings.LAMBDA_TASK_ROOT, 'src/emails/templates')
    with open(path.join(template_dir, email_config.template, '.html')) as f:
        template_html = ''.join([line.rstrip('\n') for line in f])

    rendered_html = pystache.render(template_html, email_config.template_vars)

    ses_client = get_ses_client()
    try:
        response = ses_client.send_email(
            Source=settings.FROM_EMAIL,
            Message={
                'Subject': {
                    'Data': email_config.subject,
                    'Charset': CHARSET,
                },
                'Body': {
                    'Html': {
                        'Data': rendered_html,
                        'Charset': CHARSET
                    }
                },
            },
            Destination={
                'ToAddresses': [email_config.to]
            }
        )
    except ClientError as e:
        logger.error(e.response['Error']['Message'])

    else:
        logger.info("Email sent! Message ID:"),
        logger.info(response['MessageId'])
