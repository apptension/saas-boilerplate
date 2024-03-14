from unittest.mock import MagicMock

import pytest
from django.conf import settings

from django.core import mail
from ..emails import send_email

pytestmark = pytest.mark.django_db


class TestSendEmail:
    def test_send_example_email(self):
        to = 'test@example.org'
        email_type = 'ACCOUNT_ACTIVATION'
        email_data = {'token': 'test-token', 'user_id': 'test-user'}
        send_email(to, email_type, email_data)

        assert len(mail.outbox) == 1

        sent_email = mail.outbox[0]
        assert sent_email.to == [to]
        assert sent_email.from_email == settings.EMAIL_FROM_ADDRESS
        assert f"http://localhost:3000/en/auth/confirm/{email_data['user_id']}/{email_data['token']}" in sent_email.body
