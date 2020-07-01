import six
from django.contrib.auth.tokens import PasswordResetTokenGenerator


class AccountActivationTokenGenerator(PasswordResetTokenGenerator):
    def _make_hash_value(self, user, timestamp):
        return six.text_type(user.pk) + six.text_type(timestamp) + six.text_type(user.is_confirmed)


class PasswordResetTokenGenerator(PasswordResetTokenGenerator):
    def _make_hash_value(self, user, timestamp):
        last_login = "" if user.last_login is None else user.last_login.replace(microsecond=0, tzinfo=None)
        keys = [user.pk, user.password, last_login, timestamp, user.is_confirmed]
        return "".join(map(six.text_type, keys))


account_activation_token = AccountActivationTokenGenerator()
password_reset_token = PasswordResetTokenGenerator()
