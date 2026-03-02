"""
Rate Limiting Module for SaaS Boilerplate.

This module provides a unified rate limiting system for both GraphQL and REST endpoints,
following the architecture patterns established in the boilerplate.

Usage:
    # For GraphQL mutations/queries:
    from common.ratelimiting import graphql_ratelimit, RateLimitKey

    @graphql_ratelimit(key=RateLimitKey.USER, rate='auth.login')
    def mutate_and_get_payload(cls, root, info, **input):
        ...

    # For DRF views:
    from common.ratelimiting import AIOperationThrottle

    class MyView(APIView):
        throttle_classes = [AIOperationThrottle]

    # For WebSocket consumers:
    from common.ratelimiting import WebSocketRateLimiter

    class MyConsumer(AsyncJsonWebsocketConsumer):
        rate_limiter = WebSocketRateLimiter('ai.chat.message')
"""

from .config import get_rate_limit, RateLimitConfig, RATE_LIMITS
from .constants import RateLimitKey, RateLimitCategory
from .decorators import graphql_ratelimit, graphql_ratelimit_by_config
from .throttles import (
    # Base throttles
    TieredAnonThrottle,
    TieredUserThrottle,
    # Specific throttles
    GlobalAnonThrottle,
    GlobalUserThrottle,
    AIOperationThrottle,
    AIParsingThrottle,
    ImportOperationThrottle,
    FileUploadThrottle,
    AuthenticationThrottle,
)
from .websocket import WebSocketRateLimiter
from .utils import get_client_ip, get_rate_limit_key

__all__ = [
    # Configuration
    "get_rate_limit",
    "RateLimitConfig",
    "RATE_LIMITS",
    # Constants
    "RateLimitKey",
    "RateLimitCategory",
    # Decorators
    "graphql_ratelimit",
    "graphql_ratelimit_by_config",
    # Throttles
    "TieredAnonThrottle",
    "TieredUserThrottle",
    "GlobalAnonThrottle",
    "GlobalUserThrottle",
    "AIOperationThrottle",
    "AIParsingThrottle",
    "ImportOperationThrottle",
    "FileUploadThrottle",
    "AuthenticationThrottle",
    # WebSocket
    "WebSocketRateLimiter",
    # Utils
    "get_client_ip",
    "get_rate_limit_key",
]
