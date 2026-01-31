import json
import logging
import os
import subprocess

from celery import shared_task, states
from celery.exceptions import Ignore
from django.conf import settings
from django.core.mail import EmailMessage

logger = logging.getLogger(__name__)

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
    logger.info(f"Starting send_email task: type={email_type}, to={to}, lang={lang}")

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
        logger.debug(f"Running Node.js email renderer for {email_type}")
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
        logger.debug("Node.js renderer completed successfully")
    except subprocess.CalledProcessError as e:
        logger.error(
            f"Email rendering failed for {email_type}: "
            f"return_code={e.returncode}, "
            f"stdout={e.output.decode('utf-8', errors='replace') if e.output else 'None'}, "
            f"stderr={e.stderr.decode('utf-8', errors='replace') if e.stderr else 'None'}"
        )
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

    try:
        rendered_email = json.loads(node_process.stdout)
        logger.debug(f"Email rendered: subject='{rendered_email.get('subject', 'N/A')}'")
    except json.JSONDecodeError as e:
        logger.error(
            f"Failed to parse rendered email JSON for {email_type}: {e}. "
            f"stdout={node_process.stdout.decode('utf-8', errors='replace') if node_process.stdout else 'None'}"
        )
        raise

    email = EmailMessage(
        rendered_email['subject'],
        rendered_email['html'],
        settings.EMAIL_FROM_ADDRESS,
        to,
        reply_to=settings.EMAIL_REPLY_ADDRESS,
    )
    email.content_subtype = 'html'

    try:
        sent_count = email.send()
        logger.info(f"Email sent successfully: type={email_type}, to={to}, sent_count={sent_count}")
        return {'sent_emails_count': sent_count}
    except Exception as e:
        logger.error(f"Failed to send email via {settings.EMAIL_BACKEND}: {e}")
        raise
