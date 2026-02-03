"""
GraphQL Rate Limiting Decorators.

Provides decorators for rate limiting GraphQL resolvers and mutations,
following the pattern established in common/graphql/ratelimit.py.

Usage:
    from common.ratelimiting import graphql_ratelimit, RateLimitCategory

    class MyMutation(graphene.Mutation):
        @classmethod
        @graphql_ratelimit(rate=RateLimitCategory.AUTH_LOGIN)
        def mutate_and_get_payload(cls, root, info, **input):
            ...
"""

import logging
from functools import wraps
from typing import Optional, Union

from django.conf import settings
from django.utils.module_loading import import_string

from django_ratelimit import ALL
from django_ratelimit.exceptions import Ratelimited
from django_ratelimit.core import is_ratelimited

from .config import get_rate_limit, get_rate_limit_config
from .constants import RateLimitCategory, RateLimitKey


logger = logging.getLogger(__name__)

RATE_LIMIT_EXCEEDED_ERROR_MSG = "Rate limit exceeded. Please try again later."


def _get_request_from_info(info):
    """Extract Django request from GraphQL info context."""
    context = info.context
    # Handle different wrapper types
    if hasattr(context, "_request"):
        return context._request
    if hasattr(context, "request"):
        return context.request
    return context


def _get_rate_key_identifier(request, key_type: RateLimitKey) -> str:
    """Get the identifier string for rate limiting based on key type."""
    from .utils import get_client_ip, get_user_id, get_tenant_id

    if key_type == RateLimitKey.IP:
        return get_client_ip(request)
    elif key_type == RateLimitKey.USER:
        user_id = get_user_id(request)
        if user_id:
            return f"user:{user_id}"
        return f"anon:{get_client_ip(request)}"
    elif key_type == RateLimitKey.USER_OR_IP:
        user_id = get_user_id(request)
        if user_id:
            return f"user:{user_id}"
        return f"ip:{get_client_ip(request)}"
    elif key_type == RateLimitKey.TENANT:
        tenant_id = get_tenant_id(request)
        if tenant_id:
            return f"tenant:{tenant_id}"
        return f"notenant:{get_client_ip(request)}"
    elif key_type == RateLimitKey.USER_TENANT:
        user_id = get_user_id(request) or f"anon:{get_client_ip(request)}"
        tenant_id = get_tenant_id(request) or "notenant"
        return f"{user_id}:{tenant_id}"
    else:
        return get_client_ip(request)


def graphql_ratelimit(
    rate: Union[str, RateLimitCategory],
    key: Optional[Union[str, RateLimitKey]] = None,
    group: Optional[str] = None,
    method: str = ALL,
    block: bool = True,
):
    """
    Rate limit decorator for GraphQL resolvers and mutations.

    This decorator integrates with the centralized rate limiting configuration
    while maintaining compatibility with django-ratelimit.

    Args:
        rate: Rate limit string ('30/min') or RateLimitCategory enum.
              If a category is provided, the rate is retrieved from config.
        key: How to identify the rate-limited entity. If None, uses config default.
             Can be: 'ip', 'user', 'user_or_ip', 'tenant', 'user_tenant', or
             a callable that takes (group, request) and returns a string.
        group: Optional group name for the rate limit. Defaults to function name.
        method: HTTP methods to rate limit (default: all).
        block: Whether to raise an exception when limit exceeded (default: True).

    Returns:
        Decorated function with rate limiting applied.

    Example:
        @graphql_ratelimit(rate=RateLimitCategory.AUTH_LOGIN)
        def mutate_and_get_payload(cls, root, info, **input):
            ...

        @graphql_ratelimit(rate='10/min', key=RateLimitKey.IP)
        def resolve_something(root, info, **kwargs):
            ...
    """

    def decorator(fn):
        @wraps(fn)
        def _wrapped(root, *args, **kw):
            try:
                # Extract info from args (GraphQL resolver signature)
                # Could be (info, **kw) or (root, info, **kw) depending on context
                info = None
                for arg in args:
                    if hasattr(arg, "context"):
                        info = arg
                        break

                if not info:
                    # Can't extract info, allow request but log warning
                    logger.warning(f"Could not extract GraphQL info for rate limiting in {fn.__name__}")
                    return fn(root, *args, **kw)

                request = _get_request_from_info(info)

                # Resolve rate from category or use direct string
                actual_rate = rate
                actual_key = key

                if isinstance(rate, RateLimitCategory) or (isinstance(rate, str) and "/" not in rate):
                    # It's a category, get config
                    config = get_rate_limit_config(rate)
                    if config:
                        actual_rate = config.rate
                        if actual_key is None:
                            actual_key = config.key
                    else:
                        actual_rate = "60/min"  # Safe default

                # Default key type
                if actual_key is None:
                    actual_key = RateLimitKey.USER_OR_IP

                # Build the rate limit key function for django-ratelimit
                if callable(actual_key):
                    key_func = actual_key
                elif isinstance(actual_key, (RateLimitKey, str)):
                    key_type = RateLimitKey(actual_key) if isinstance(actual_key, str) else actual_key

                    def key_func(group, request):
                        return _get_rate_key_identifier(request, key_type)

                else:
                    key_func = lambda g, r: actual_key  # noqa: E731

                # Determine group name
                rate_group = group or fn.__name__

                # Check rate limit using django-ratelimit
                old_limited = getattr(request, "limited", False)
                ratelimited = is_ratelimited(
                    request=request,
                    group=rate_group,
                    fn=fn,
                    key=key_func,
                    rate=actual_rate,
                    method=method,
                    increment=True,
                )
                request.limited = ratelimited or old_limited

                if ratelimited and block:
                    cls = getattr(settings, "RATELIMIT_EXCEPTION_CLASS", Ratelimited)
                    exc_class = import_string(cls) if isinstance(cls, str) else cls
                    raise exc_class(RATE_LIMIT_EXCEEDED_ERROR_MSG)

            except Ratelimited:
                # Re-raise rate limit exceptions
                raise
            except Exception as e:
                # Log the error but allow the request to proceed
                # This prevents ratelimit misconfiguration from breaking the app
                logger.error(
                    f"Rate limit check failed for {fn.__name__}: {type(e).__name__}: {e}. "
                    f"Allowing request to proceed. Fix the rate limit configuration!"
                )

            return fn(root, *args, **kw)

        return _wrapped

    return decorator


def graphql_ratelimit_by_config(category: Union[str, RateLimitCategory]):
    """
    Simplified decorator that uses full configuration from a category.

    This is a convenience wrapper around graphql_ratelimit that pulls
    all settings from the centralized configuration.

    Args:
        category: RateLimitCategory enum or category string.

    Example:
        @graphql_ratelimit_by_config(RateLimitCategory.AUTH_LOGIN)
        def mutate_and_get_payload(cls, root, info, **input):
            ...
    """
    config = get_rate_limit_config(category)

    if config:
        return graphql_ratelimit(
            rate=config.rate,
            key=config.key,
            block=config.block,
        )
    else:
        # Fallback with safe defaults
        return graphql_ratelimit(
            rate="60/min",
            key=RateLimitKey.USER_OR_IP,
        )


# Alias for backwards compatibility with existing code
ratelimit = graphql_ratelimit


def ip_throttle_rate(group, request) -> str:
    """
    Dynamic rate function that returns rate based on configuration.

    This is for backwards compatibility with existing code that uses
    django-ratelimit's dynamic rate feature.
    """
    return get_rate_limit(RateLimitCategory.API_GENERAL)
