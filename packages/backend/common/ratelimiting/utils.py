"""
Rate Limiting Utilities.

Helper functions for rate limiting operations.
"""

import logging
from typing import Optional, Union

from django.core.cache import cache
from django.http import HttpRequest

from .constants import RateLimitKey


logger = logging.getLogger(__name__)


def get_client_ip(request: HttpRequest) -> str:
    """
    Get client IP address from request.

    Handles common proxy headers (X-Forwarded-For, X-Real-IP) for
    deployments behind load balancers or reverse proxies.

    Args:
        request: Django HttpRequest object

    Returns:
        Client IP address string
    """
    # X-Forwarded-For header (most common)
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        # Take the first IP (client IP before any proxies)
        return x_forwarded_for.split(",")[0].strip()

    # X-Real-IP header (nginx)
    x_real_ip = request.META.get("HTTP_X_REAL_IP")
    if x_real_ip:
        return x_real_ip.strip()

    # CF-Connecting-IP (Cloudflare)
    cf_connecting_ip = request.META.get("HTTP_CF_CONNECTING_IP")
    if cf_connecting_ip:
        return cf_connecting_ip.strip()

    # Direct connection
    return request.META.get("REMOTE_ADDR", "127.0.0.1")


def get_user_id(request: HttpRequest) -> Optional[str]:
    """
    Get user ID from request if authenticated.

    Args:
        request: Django HttpRequest object

    Returns:
        User ID string or None if not authenticated
    """
    user = getattr(request, "user", None)
    if user and user.is_authenticated:
        return str(user.id)
    return None


def get_tenant_id(request: HttpRequest) -> Optional[str]:
    """
    Get tenant ID from request context.

    Args:
        request: Django HttpRequest object

    Returns:
        Tenant ID string or None if not in tenant context
    """
    # Try direct tenant attribute (set by middleware)
    tenant = getattr(request, "tenant", None)
    if tenant:
        return str(tenant.id)

    # Try from URL kwargs
    if hasattr(request, "resolver_match") and request.resolver_match:
        return request.resolver_match.kwargs.get("tenant_id")

    return None


def get_rate_limit_key(
    request: HttpRequest,
    key_type: Union[RateLimitKey, str],
    group: str = "",
) -> str:
    """
    Generate a cache key for rate limiting.

    Args:
        request: Django HttpRequest object
        key_type: How to identify the entity (IP, user, tenant, etc.)
        group: Optional group name for the rate limit

    Returns:
        Cache key string for rate limit tracking

    Example:
        >>> get_rate_limit_key(request, RateLimitKey.USER, 'auth.login')
        'ratelimit:auth.login:user:42'
    """
    key_type = RateLimitKey(key_type) if isinstance(key_type, str) else key_type

    # Determine the identifier based on key type
    if key_type == RateLimitKey.IP:
        identifier = get_client_ip(request)
    elif key_type == RateLimitKey.USER:
        identifier = get_user_id(request)
        if not identifier:
            # Fall back to IP if not authenticated
            identifier = f"anon:{get_client_ip(request)}"
    elif key_type == RateLimitKey.USER_OR_IP:
        identifier = get_user_id(request)
        identifier = f"ip:{get_client_ip(request)}" if not identifier else f"user:{identifier}"
    elif key_type == RateLimitKey.TENANT:
        identifier = get_tenant_id(request)
        if not identifier:
            identifier = f"no_tenant:{get_client_ip(request)}"
    elif key_type == RateLimitKey.USER_TENANT:
        user_id = get_user_id(request) or f"anon:{get_client_ip(request)}"
        tenant_id = get_tenant_id(request) or "no_tenant"
        identifier = f"{user_id}:{tenant_id}"
    else:
        identifier = get_client_ip(request)

    # Build the cache key
    parts = ["ratelimit"]
    if group:
        parts.append(group)
    parts.append(key_type.value)
    parts.append(identifier)

    return ":".join(parts)


def get_rate_limit_key_ws(
    user_id: Optional[str],
    tenant_id: Optional[str],
    key_type: Union[RateLimitKey, str],
    group: str = "",
    client_ip: str = "127.0.0.1",
) -> str:
    """
    Generate a cache key for WebSocket rate limiting.

    Similar to get_rate_limit_key but for WebSocket contexts
    where we don't have a standard HttpRequest.

    Args:
        user_id: User ID string or None
        tenant_id: Tenant ID string or None
        key_type: How to identify the entity
        group: Optional group name
        client_ip: Client IP address

    Returns:
        Cache key string
    """
    key_type = RateLimitKey(key_type) if isinstance(key_type, str) else key_type

    if key_type == RateLimitKey.IP:
        identifier = client_ip
    elif key_type == RateLimitKey.USER:
        identifier = user_id or f"anon:{client_ip}"
    elif key_type == RateLimitKey.USER_OR_IP:
        identifier = f"user:{user_id}" if user_id else f"ip:{client_ip}"
    elif key_type == RateLimitKey.TENANT:
        identifier = tenant_id or f"no_tenant:{client_ip}"
    elif key_type == RateLimitKey.USER_TENANT:
        u = user_id or f"anon:{client_ip}"
        t = tenant_id or "no_tenant"
        identifier = f"{u}:{t}"
    else:
        identifier = client_ip

    parts = ["ratelimit"]
    if group:
        parts.append(group)
    parts.append(key_type.value)
    parts.append(identifier)

    return ":".join(parts)


def parse_rate_string(rate: str) -> tuple[int, int]:
    """
    Parse a rate limit string into count and window.

    Args:
        rate: Rate string like '10/min', '100/hour', '1000/day'

    Returns:
        Tuple of (count, window_seconds)

    Example:
        >>> parse_rate_string('10/min')
        (10, 60)
        >>> parse_rate_string('100/hour')
        (100, 3600)
    """
    if "/" not in rate:
        raise ValueError(f"Invalid rate format: {rate}")

    count_str, period = rate.split("/")
    count = int(count_str)

    # Parse period
    period = period.lower().strip()
    if period in ("s", "sec", "second"):
        window = 1
    elif period in ("m", "min", "minute"):
        window = 60
    elif period in ("h", "hr", "hour"):
        window = 3600
    elif period in ("d", "day"):
        window = 86400
    else:
        # Try to parse as seconds
        try:
            window = int(period)
        except ValueError:
            raise ValueError(f"Unknown rate period: {period}")

    return count, window


def check_rate_limit(
    key: str,
    rate: str,
    increment: bool = True,
) -> tuple[bool, int, int]:
    """
    Check if a rate limit has been exceeded.

    Args:
        key: Cache key for the rate limit
        rate: Rate string (e.g., '10/min')
        increment: Whether to increment the counter

    Returns:
        Tuple of (is_limited, current_count, remaining)

    Example:
        >>> is_limited, count, remaining = check_rate_limit('ratelimit:auth:ip:1.2.3.4', '10/min')
        >>> if is_limited:
        ...     raise RateLimitExceeded()
    """
    count, window = parse_rate_string(rate)

    # Get current count
    current = cache.get(key, 0)

    if increment:
        # Use cache.incr for atomic increment, with fallback for new keys
        try:
            current = cache.incr(key)
        except ValueError:
            # Key doesn't exist, set it
            cache.set(key, 1, window)
            current = 1

    is_limited = current > count
    remaining = max(0, count - current)

    return is_limited, current, remaining


def get_remaining_requests(key: str, rate: str) -> int:
    """
    Get the number of remaining requests before rate limit is hit.

    Args:
        key: Cache key for the rate limit
        rate: Rate string

    Returns:
        Number of remaining requests
    """
    count, _ = parse_rate_string(rate)
    current = cache.get(key, 0)
    return max(0, count - current)


def reset_rate_limit(key: str):
    """
    Reset a rate limit counter.

    Args:
        key: Cache key for the rate limit
    """
    cache.delete(key)


def get_rate_limit_info(key: str, rate: str) -> dict:
    """
    Get detailed rate limit information.

    Args:
        key: Cache key for the rate limit
        rate: Rate string

    Returns:
        Dict with rate limit information
    """
    count, window = parse_rate_string(rate)
    current = cache.get(key, 0)

    return {
        "limit": count,
        "remaining": max(0, count - current),
        "used": current,
        "window_seconds": window,
        "is_limited": current > count,
    }
