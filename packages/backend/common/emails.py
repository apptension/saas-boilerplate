import json
import os
import subprocess

from celery import shared_task, states
from celery.exceptions import Ignore
from django.conf import settings
from django.core.mail import EmailMessage


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

        # TODO: Handle due_date
        send_email.apply_async((self.to, self.name, send_data))


@shared_task(bind=True)
def send_email(self, to: str | list[str], email_type: str, email_data: dict):
    render_script = '''
    const { renderEmail } = require('./email');
    console.log(JSON.stringify(renderEmail('%s', %s)));
    process.exit(0);
    ''' % (
        email_type,
        json.dumps(email_data),
    )

    try:
        node_process = subprocess.run(
            ["node"],
            shell=True,
            input=bytes(render_script, 'utf-8'),
            capture_output=True,
            check=True,
            cwd='/app/scripts/runtime',
            # Environmental variables are mapped manually to avoid secret values from being exposed to email renderer
            # script that is usually maintained by non-backend developers
            env={
                'DEBUG': str(settings.DEBUG),
                'VITE_EMAIL_ASSETS_URL': os.environ.get('VITE_EMAIL_ASSETS_URL', ''),
                'VITE_WEB_APP_URL': os.environ.get('VITE_WEB_APP_URL', ''),
            },
        )
    except subprocess.CalledProcessError as e:
        self.update_state(
            state=states.FAILURE,
            meta={
                'return_code': e.returncode,
                'cmd': e.cmd,
                'output': e.output,
                'stderr': e.stderr,
            },
        )
        raise Ignore()

    if isinstance(to, str):
        to = (to,)

    rendered_email = json.loads(node_process.stdout)
    email = EmailMessage(
        rendered_email['subject'],
        rendered_email['html'],
        settings.EMAIL_FROM_ADDRESS,
        to,
        reply_to=settings.EMAIL_REPLY_ADDRESS,
    )
    email.content_subtype = 'html'
    return {'sent_emails_count': email.send()}
