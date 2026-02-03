"""
WebSocket Rate Limiting.

Provides rate limiting for WebSocket connections, particularly for
the AI Assistant chat functionality.

Usage:
    from common.ratelimiting import WebSocketRateLimiter

    class AiAssistantConsumer(AsyncJsonWebsocketConsumer):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, **kwargs)
            self.rate_limiter = WebSocketRateLimiter(
                RateLimitCategory.AI_CHAT_MESSAGE,
                hourly_category=RateLimitCategory.AI_CHAT_HOURLY,
            )

        async def handle_chat_message(self, message: str):
            # Check rate limits
            is_allowed, error_msg = await self.rate_limiter.check_async(
                user_id=str(self.user.id),
                tenant_id=self.tenant_id,
            )
            if not is_allowed:
                await self.send_json({
                    'type': 'error',
                    'message': error_msg,
                })
                return

            # Process message...
"""

import logging
import time
from dataclasses import dataclass
from typing import Optional, Tuple, Union

from django.core.cache import cache
from asgiref.sync import sync_to_async

from .config import get_rate_limit
from .constants import RateLimitCategory, RateLimitKey, UserTier
from .utils import parse_rate_string, get_rate_limit_key_ws


logger = logging.getLogger(__name__)


@dataclass
class RateLimitResult:
    """Result of a rate limit check."""

    is_allowed: bool
    """Whether the request is allowed."""

    current_count: int = 0
    """Current count in the window."""

    limit: int = 0
    """Maximum allowed requests."""

    remaining: int = 0
    """Remaining requests in window."""

    retry_after: Optional[int] = None
    """Seconds until rate limit resets (if blocked)."""

    message: str = ""
    """Human-readable message."""


class WebSocketRateLimiter:
    """
    Rate limiter for WebSocket connections.

    Supports both per-minute and per-hour limits, which is important
    for expensive operations like AI chat.

    Attributes:
        category: Primary rate limit category (e.g., per-minute)
        hourly_category: Optional secondary category for hourly limits
        key_type: How to identify the entity being rate limited

    Example:
        limiter = WebSocketRateLimiter(
            category=RateLimitCategory.AI_CHAT_MESSAGE,
            hourly_category=RateLimitCategory.AI_CHAT_HOURLY,
        )

        result = await limiter.check_async(user_id='123', tenant_id='456')
        if not result.is_allowed:
            # Handle rate limit exceeded
            pass
    """

    def __init__(
        self,
        category: Union[str, RateLimitCategory],
        hourly_category: Optional[Union[str, RateLimitCategory]] = None,
        key_type: RateLimitKey = RateLimitKey.USER,
    ):
        self.category = category
        self.hourly_category = hourly_category
        self.key_type = key_type

        # Cache parsed rates
        self._rate = get_rate_limit(category)
        self._hourly_rate = get_rate_limit(hourly_category) if hourly_category else None

    def _get_cache_key(
        self,
        user_id: Optional[str],
        tenant_id: Optional[str],
        client_ip: str,
        suffix: str = "",
    ) -> str:
        """Generate cache key for rate limiting."""
        category_str = self.category.value if isinstance(self.category, RateLimitCategory) else self.category
        group = f"ws:{category_str}"
        if suffix:
            group = f"{group}:{suffix}"

        return get_rate_limit_key_ws(
            user_id=user_id,
            tenant_id=tenant_id,
            key_type=self.key_type,
            group=group,
            client_ip=client_ip,
        )

    def check(
        self,
        user_id: Optional[str] = None,
        tenant_id: Optional[str] = None,
        client_ip: str = "127.0.0.1",
        tier: Optional[UserTier] = None,
    ) -> RateLimitResult:
        """
        Check if the rate limit allows another request.

        Args:
            user_id: User ID string
            tenant_id: Tenant ID string
            client_ip: Client IP address
            tier: Optional user tier for tiered limits

        Returns:
            RateLimitResult with check outcome
        """
        # Get rate for tier
        rate = get_rate_limit(self.category, tier=tier) if tier else self._rate
        limit, window = parse_rate_string(rate)

        # Primary rate limit check
        key = self._get_cache_key(user_id, tenant_id, client_ip)

        # Atomic increment
        try:
            current = cache.incr(key)
        except ValueError:
            # Key doesn't exist, create it
            cache.set(key, 1, window)
            current = 1

        # Check primary limit
        if current > limit:
            return RateLimitResult(
                is_allowed=False,
                current_count=current,
                limit=limit,
                remaining=0,
                retry_after=window,
                message=f"Rate limit exceeded. Maximum {limit} requests per {window} seconds.",
            )

        # Check hourly limit if configured
        if self._hourly_rate:
            hourly_limit, hourly_window = parse_rate_string(self._hourly_rate)
            hourly_key = self._get_cache_key(user_id, tenant_id, client_ip, "hourly")

            try:
                hourly_current = cache.incr(hourly_key)
            except ValueError:
                cache.set(hourly_key, 1, hourly_window)
                hourly_current = 1

            if hourly_current > hourly_limit:
                return RateLimitResult(
                    is_allowed=False,
                    current_count=hourly_current,
                    limit=hourly_limit,
                    remaining=0,
                    retry_after=hourly_window,
                    message=f"Hourly rate limit exceeded. Maximum {hourly_limit} requests per hour.",
                )

        return RateLimitResult(
            is_allowed=True,
            current_count=current,
            limit=limit,
            remaining=max(0, limit - current),
            message="OK",
        )

    async def check_async(
        self,
        user_id: Optional[str] = None,
        tenant_id: Optional[str] = None,
        client_ip: str = "127.0.0.1",
        tier: Optional[UserTier] = None,
    ) -> RateLimitResult:
        """
        Async version of check().

        Args:
            user_id: User ID string
            tenant_id: Tenant ID string
            client_ip: Client IP address
            tier: Optional user tier for tiered limits

        Returns:
            RateLimitResult with check outcome
        """
        return await sync_to_async(self.check)(
            user_id=user_id,
            tenant_id=tenant_id,
            client_ip=client_ip,
            tier=tier,
        )

    def get_remaining(
        self,
        user_id: Optional[str] = None,
        tenant_id: Optional[str] = None,
        client_ip: str = "127.0.0.1",
    ) -> int:
        """Get remaining requests in current window without incrementing."""
        limit, _ = parse_rate_string(self._rate)
        key = self._get_cache_key(user_id, tenant_id, client_ip)
        current = cache.get(key, 0)
        return max(0, limit - current)

    async def get_remaining_async(
        self,
        user_id: Optional[str] = None,
        tenant_id: Optional[str] = None,
        client_ip: str = "127.0.0.1",
    ) -> int:
        """Async version of get_remaining()."""
        return await sync_to_async(self.get_remaining)(
            user_id=user_id,
            tenant_id=tenant_id,
            client_ip=client_ip,
        )

    def reset(
        self,
        user_id: Optional[str] = None,
        tenant_id: Optional[str] = None,
        client_ip: str = "127.0.0.1",
    ):
        """Reset rate limit counters for an entity."""
        key = self._get_cache_key(user_id, tenant_id, client_ip)
        cache.delete(key)

        if self._hourly_rate:
            hourly_key = self._get_cache_key(user_id, tenant_id, client_ip, "hourly")
            cache.delete(hourly_key)


class InMemoryRateLimiter:
    """
    Simple in-memory rate limiter for single-instance deployments.

    This is useful for development or simple deployments where you don't
    need distributed rate limiting. For production with multiple instances,
    use WebSocketRateLimiter which uses Django's cache (Redis).

    Warning: This does NOT work across multiple server instances!
    """

    def __init__(
        self,
        rate: str,
        hourly_rate: Optional[str] = None,
    ):
        self.rate = rate
        self.hourly_rate = hourly_rate
        self._counters: dict = {}
        self._hourly_counters: dict = {}

    def _cleanup_old_entries(self, counters: dict, window: int):
        """Remove expired entries."""
        now = time.time()
        expired_keys = [k for k, (_, timestamp) in counters.items() if now - timestamp > window]
        for k in expired_keys:
            del counters[k]

    def check(self, identifier: str) -> Tuple[bool, str]:
        """
        Check if request is allowed.

        Args:
            identifier: Unique identifier for the entity

        Returns:
            Tuple of (is_allowed, error_message)
        """
        now = time.time()
        limit, window = parse_rate_string(self.rate)

        # Cleanup old entries periodically
        if len(self._counters) > 1000:
            self._cleanup_old_entries(self._counters, window)

        # Check and increment counter
        count, first_request = self._counters.get(identifier, (0, now))

        # Reset window if expired
        if now - first_request > window:
            count = 0
            first_request = now

        count += 1
        self._counters[identifier] = (count, first_request)

        if count > limit:
            return False, f"Rate limit exceeded. Maximum {limit} requests per {window} seconds."

        # Check hourly limit
        if self.hourly_rate:
            hourly_limit, hourly_window = parse_rate_string(self.hourly_rate)

            if len(self._hourly_counters) > 1000:
                self._cleanup_old_entries(self._hourly_counters, hourly_window)

            hourly_count, hourly_first = self._hourly_counters.get(identifier, (0, now))

            if now - hourly_first > hourly_window:
                hourly_count = 0
                hourly_first = now

            hourly_count += 1
            self._hourly_counters[identifier] = (hourly_count, hourly_first)

            if hourly_count > hourly_limit:
                return False, f"Hourly limit exceeded. Maximum {hourly_limit} requests per hour."

        return True, "OK"
