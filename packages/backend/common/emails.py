import json
import os
import subprocess

from celery import shared_task, states
from celery.exceptions import Ignore
from django.conf import settings
from django.core.mail import EmailMessage

# Default language for emails
DEFAULT_EMAIL_LANGUAGE = 'en'


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

    def __init__(self, to, data=None, lang=None):
        self.to = to
        self.data = data
        self.lang = lang or DEFAULT_EMAIL_LANGUAGE
        if data is None:
            self.data = {}

    def send(self, due_date=None):
        send_data = None

        serializer = self.get_serializer(data=self.data)
        if serializer:
            serializer.is_valid(raise_exception=True)
            send_data = serializer.data

        # TODO: Handle due_date
        send_email.apply_async((self.to, self.name, send_data, self.lang))


def get_email_translations(lang: str) -> dict:
    """
    Get translations for the specified language from the database.
    Falls back to empty dict if translations service is not available.
    """
    try:
        from apps.translations.services import get_translations_for_locale

        translations = get_translations_for_locale(lang)
        if translations:
            return translations
    except Exception:
        pass
    return {}


@shared_task(bind=True)
def send_email(self, to: str | list[str], email_type: str, email_data: dict, lang: str = DEFAULT_EMAIL_LANGUAGE):
    # Fetch translations from database
    translations = get_email_translations(lang)

    render_script = '''
    const { renderEmail } = require('./email');
    console.log(JSON.stringify(renderEmail('%s', %s, '%s', %s)));
    process.exit(0);
    ''' % (
        email_type,
        json.dumps(email_data),
        lang,
        json.dumps(translations),
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
