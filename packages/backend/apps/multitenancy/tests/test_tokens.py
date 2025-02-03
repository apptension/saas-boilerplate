import pytest

from datetime import datetime, timedelta, timezone
from django.conf import settings
from ..tokens import tenant_invitation_token


pytestmark = pytest.mark.django_db


class TestTenantInvitationTokenGenerator:
    def test_make_token(self, user, tenant_membership):
        token = tenant_invitation_token.make_token(user.email, tenant_membership)
        assert isinstance(token, str)

    def test_check_token_valid(self, user, tenant_membership):
        token = tenant_invitation_token.make_token(user.email, tenant_membership)
        assert tenant_invitation_token.check_token(user.email, token, tenant_membership)

    def test_check_token_invalid_email(self, user, tenant_membership):
        token = tenant_invitation_token.make_token(user.email, tenant_membership)
        invalid_email = "invalid@example.com"
        assert not tenant_invitation_token.check_token(invalid_email, token, tenant_membership)

    def test_check_token_expired(self, mocker, user, tenant_membership):
        # Reduce timeout for testing purposes
        settings.TENANT_INVITATION_TIMEOUT = 1
        token = tenant_invitation_token.make_token(user.email, tenant_membership)

        # Sleep for more than the timeout
        expired_date = datetime.now(tz=timezone.utc) + timedelta(seconds=2)
        with mocker.patch.object(tenant_invitation_token, "_now", return_value=expired_date):
            assert not tenant_invitation_token.check_token(user.email, token, tenant_membership)
        # Restore original timeout value
        settings.TENANT_INVITATION_TIMEOUT = 2 * 24 * 3600

    def test_check_token_tampered(self, user, tenant_membership):
        token = tenant_invitation_token.make_token(user.email, tenant_membership)

        # Tamper with the token
        replace = token[2]
        if replace == token[0]:
            replace = '2' if token[0] == '1' else '1'
        tampered_token = token.replace(token[0], replace)

        assert not tenant_invitation_token.check_token(user.email, tampered_token, tenant_membership)

    def test_check_token_invalid_format(self, user, tenant_membership):
        invalid_token = "invalid_token_format"
        assert not tenant_invitation_token.check_token(user.email, invalid_token, tenant_membership)
