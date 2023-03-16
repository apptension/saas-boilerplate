from config.settings import AUTH_USER_MODEL
from django.utils.translation import gettext as _
from functools import wraps


def context_user_required(cls):
    no_user_error_key = "no_user_in_request"
    no_user_error_msg = "No user provided in request"

    def _context_user(self) -> AUTH_USER_MODEL:
        request = getattr(self, 'context', {}).get('request', None)
        return getattr(request, 'user', None)

    cls.context_user = property(_context_user, None)

    if hasattr(cls, 'default_error_messages'):
        cls.default_error_messages[no_user_error_key] = _(no_user_error_msg)
    else:
        cls.default_error_messages = {no_user_error_key: _(no_user_error_msg)}

    original_validate = cls.validate

    @wraps(original_validate)
    def _validate(self, attrs):
        if not self.context_user:
            self.fail(no_user_error_key)
        return original_validate(self, attrs)

    cls.validate = _validate

    return cls
