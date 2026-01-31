import logging
from functools import wraps

from django.conf import settings
from django.utils.module_loading import import_string

from django_ratelimit import ALL
from django_ratelimit.exceptions import Ratelimited
from django_ratelimit.core import is_ratelimited


logger = logging.getLogger(__name__)

RATE_LIMIT_EXCEEDED_ERROR_MSG = "Rate limit exceeded."


def ratelimit(group=None, key=None, rate=None, method=ALL, block=True):
    def decorator(fn):
        @wraps(fn)
        def _wrapped(root, *args, **kw):
            try:
                _, info = args
                # Access the actual Django request object
                # info.context may be a wrapper with _request attribute
                request = getattr(info.context, '_request', info.context)

                old_limited = getattr(request, 'limited', False)
                ratelimited = is_ratelimited(
                    request=request, group=group, fn=fn, key=key, rate=rate, method=method, increment=True
                )
                request.limited = ratelimited or old_limited

                if ratelimited and block:
                    cls = getattr(settings, 'RATELIMIT_EXCEPTION_CLASS', Ratelimited)
                    raise (import_string(cls) if isinstance(cls, str) else cls)(RATE_LIMIT_EXCEEDED_ERROR_MSG)

            except Ratelimited:
                # Re-raise rate limit exceptions
                raise
            except Exception as e:
                # Log the error but allow the request to proceed
                # This prevents ratelimit misconfiguration from breaking the app
                logger.error(
                    f"Ratelimit check failed for {fn.__name__}: {type(e).__name__}: {e}. "
                    f"Allowing request to proceed. Fix the ratelimit configuration!"
                )

            return fn(root, *args, **kw)

        return _wrapped

    return decorator


def ip_throttle_rate(group, request):
    return "60/min"
