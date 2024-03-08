import six

from datetime import datetime, timezone
from django.conf import settings
from django.utils.crypto import constant_time_compare, salted_hmac
from django.utils.http import base36_to_int, int_to_base36
from django.contrib.auth.tokens import PasswordResetTokenGenerator


class TenantInvitationTokenGenerator(PasswordResetTokenGenerator):
    def _make_hash_value(self, user_email, timestamp, tenant_membership_pk):
        return six.text_type(user_email) + six.text_type(timestamp) + six.text_type(str(tenant_membership_pk))

    def _make_token_with_timestamp(self, user_email, timestamp, tenant_membership_pk, secret):
        # timestamp is number of seconds since 2001-1-1. Converted to base 36,
        # this gives us a 6 digit string until about 2069.
        ts_b36 = int_to_base36(timestamp)
        hash_string = salted_hmac(
            self.key_salt,
            self._make_hash_value(user_email, timestamp, tenant_membership_pk),
            secret=secret,
            algorithm=self.algorithm,
        ).hexdigest()[
            ::2
        ]  # Limit to shorten the URL.
        return "%s-%s" % (ts_b36, hash_string)

    def make_token(self, user_email, tenant_membership):
        """
        Return a token that can be used once to make action on tenant invitation
        for the given user.
        """
        return self._make_token_with_timestamp(
            user_email,
            self._num_seconds(tenant_membership.created_at),
            tenant_membership.pk,
            self.secret,
        )

    def _num_seconds(self, dt):
        return int((dt - datetime(2001, 1, 1, tzinfo=timezone.utc)).total_seconds())

    def _now(self):
        # Used for mocking in tests
        return datetime.now(tz=timezone.utc)

    def check_token(self, user_email, token, tenant_membership):
        """
        Check that a tenant invitation token is correct for a given user.
        """
        if not (user_email and token):
            return False
        # Parse the token
        try:
            ts_b36, _ = token.split("-")
        except ValueError:
            return False

        try:
            ts = base36_to_int(ts_b36)
        except ValueError:
            return False

        # Check that the timestamp/uid has not been tampered with
        for secret in [self.secret, *self.secret_fallbacks]:
            if constant_time_compare(
                self._make_token_with_timestamp(user_email, ts, tenant_membership.pk, secret),
                token,
            ):
                break
        else:
            return False

        # Check the timestamp is within limit.
        if (self._num_seconds(self._now()) - ts) > settings.TENANT_INVITATION_TIMEOUT:
            return False

        return True


tenant_invitation_token = TenantInvitationTokenGenerator()
