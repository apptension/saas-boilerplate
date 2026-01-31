"""
DRF Throttle Classes for Rate Limiting.

Provides throttle classes that integrate with Django REST Framework
and use the centralized rate limit configuration.

Usage:
    from common.ratelimiting import AIOperationThrottle

    class MyChatView(APIView):
        throttle_classes = [AIOperationThrottle]
"""

import logging
from typing import Optional

from rest_framework.throttling import SimpleRateThrottle
from rest_framework.request import Request

from .config import get_rate_limit, get_rate_limit_config
from .constants import RateLimitCategory, RateLimitKey, UserTier
from .utils import get_client_ip, get_user_id, get_tenant_id


logger = logging.getLogger(__name__)


class ConfigurableThrottle(SimpleRateThrottle):
    """
    Base throttle class that uses centralized configuration.

    Subclasses should set `rate_category` to a RateLimitCategory value.
    The actual rate is retrieved from configuration, allowing environment
    overrides without code changes.

    Example:
        class MyThrottle(ConfigurableThrottle):
            rate_category = RateLimitCategory.AI_CHAT_MESSAGE
            scope = 'ai_chat'
    """

    rate_category: Optional[str] = None
    scope = 'default'
    # Default rate - will be overridden from config in __init__
    rate = '60/min'

    def __init__(self):
        # Set rate from configuration BEFORE calling super().__init__()
        # because SimpleRateThrottle.__init__ calls self.get_rate()
        if self.rate_category:
            self.rate = get_rate_limit(self.rate_category)
        super().__init__()

    def get_cache_key(self, request: Request, view) -> Optional[str]:
        """Generate cache key based on configuration."""
        if not self.rate_category:
            return None

        config = get_rate_limit_config(self.rate_category)
        if not config:
            return None

        key_type = config.key

        # Determine identifier based on key type
        if key_type == RateLimitKey.IP:
            ident = get_client_ip(request)
        elif key_type == RateLimitKey.USER:
            ident = get_user_id(request)
            if not ident:
                ident = f"anon_{get_client_ip(request)}"
        elif key_type == RateLimitKey.USER_OR_IP:
            ident = get_user_id(request)
            ident = f"ip_{get_client_ip(request)}" if not ident else f"user_{ident}"
        elif key_type == RateLimitKey.TENANT:
            ident = get_tenant_id(request)
            if not ident:
                ident = f"notenant_{get_client_ip(request)}"
        elif key_type == RateLimitKey.USER_TENANT:
            user_id = get_user_id(request) or f"anon_{get_client_ip(request)}"
            tenant_id = get_tenant_id(request) or 'notenant'
            ident = f"{user_id}_{tenant_id}"
        else:
            ident = get_client_ip(request)

        return self.cache_format % {
            'scope': self.scope,
            'ident': ident,
        }


class TieredThrottle(ConfigurableThrottle):
    """
    Throttle that supports different rates for different user tiers.

    Automatically applies higher limits for power users and lower limits
    for free tier users.
    """

    def __init__(self):
        # Initialize _current_rate BEFORE calling super().__init__()
        # because get_rate() may be called during parent initialization
        if self.rate_category:
            self._current_rate = get_rate_limit(self.rate_category)
        else:
            self._current_rate = getattr(self, 'rate', '60/min')
        super().__init__()

    def get_user_tier(self, request: Request) -> UserTier:
        """
        Determine the user's tier.

        Override this method to implement custom tier logic based on
        subscription status, role, or other criteria.
        """
        user = getattr(request, 'user', None)

        if not user or not user.is_authenticated:
            return UserTier.ANONYMOUS

        # Check for admin status
        if getattr(user, 'is_superuser', False):
            return UserTier.ADMIN

        # TODO: Integrate with subscription/billing to determine tier
        # For now, all authenticated users are STANDARD
        # You can extend this to check:
        # - user.subscription.plan_tier
        # - user.organization.subscription_tier
        # - Feature flags or custom attributes

        return UserTier.STANDARD

    def get_rate(self):
        """Get rate based on request context (set during allow_request)."""
        # Return the current rate, which defaults to the base rate
        # and is updated per-request based on user tier in allow_request
        return getattr(self, '_current_rate', self.rate)

    def allow_request(self, request: Request, view) -> bool:
        """Check rate limit with tier-aware rates."""
        if not self.rate_category:
            return True

        # Get tier and appropriate rate
        tier = self.get_user_tier(request)
        self._current_rate = get_rate_limit(self.rate_category, tier=tier)

        # Parse rate for SimpleRateThrottle
        self.rate = self._current_rate
        self.num_requests, self.duration = self.parse_rate(self.rate)

        return super().allow_request(request, view)


class TieredAnonThrottle(TieredThrottle):
    """Tiered throttle for anonymous users."""

    def get_cache_key(self, request: Request, view) -> Optional[str]:
        if request.user and request.user.is_authenticated:
            return None  # Only throttle anonymous users

        return self.cache_format % {
            'scope': self.scope,
            'ident': get_client_ip(request),
        }


class TieredUserThrottle(TieredThrottle):
    """Tiered throttle for authenticated users."""

    def get_cache_key(self, request: Request, view) -> Optional[str]:
        if request.user and request.user.is_authenticated:
            return self.cache_format % {
                'scope': self.scope,
                'ident': str(request.user.pk),
            }
        return None  # Only throttle authenticated users


# =============================================================================
# Pre-configured Throttle Classes
# =============================================================================


class GlobalAnonThrottle(TieredAnonThrottle):
    """Global rate limit for anonymous GraphQL/API requests."""

    rate_category = RateLimitCategory.GRAPHQL_GLOBAL_ANON
    scope = 'global_anon'


class GlobalUserThrottle(TieredUserThrottle):
    """Global rate limit for authenticated GraphQL/API requests."""

    rate_category = RateLimitCategory.GRAPHQL_GLOBAL_USER
    scope = 'global_user'


class AIOperationThrottle(TieredUserThrottle):
    """Rate limit for AI chat and MCP operations."""

    rate_category = RateLimitCategory.AI_CHAT_MESSAGE
    scope = 'ai_operation'


class AIParsingThrottle(TieredUserThrottle):
    """Rate limit for AI parsing operations (expensive OpenAI calls)."""

    rate_category = RateLimitCategory.AI_PARSE
    scope = 'ai_parse'


class ImportOperationThrottle(ConfigurableThrottle):
    """Rate limit for CSV/Excel import operations."""

    rate_category = RateLimitCategory.IMPORT_CSV
    scope = 'import'


class FileUploadThrottle(ConfigurableThrottle):
    """Rate limit for file upload operations."""

    rate_category = RateLimitCategory.FILE_UPLOAD
    scope = 'file_upload'


class AuthenticationThrottle(ConfigurableThrottle):
    """Rate limit for authentication operations."""

    rate_category = RateLimitCategory.AUTH_LOGIN
    scope = 'auth'

    def get_cache_key(self, request: Request, view) -> Optional[str]:
        # Always use IP for auth operations
        return self.cache_format % {
            'scope': self.scope,
            'ident': get_client_ip(request),
        }


class MCPProxyThrottle(TieredUserThrottle):
    """Rate limit for MCP proxy requests."""

    rate_category = RateLimitCategory.AI_MCP_PROXY
    scope = 'mcp_proxy'


class MCPChatThrottle(TieredUserThrottle):
    """Rate limit for MCP chat requests."""

    rate_category = RateLimitCategory.AI_CHAT_MESSAGE
    scope = 'mcp_chat'


class SSOLoginThrottle(ConfigurableThrottle):
    """Rate limit for SSO login operations."""

    rate_category = RateLimitCategory.SSO_LOGIN
    scope = 'sso_login'

    def get_cache_key(self, request: Request, view) -> Optional[str]:
        return self.cache_format % {
            'scope': self.scope,
            'ident': get_client_ip(request),
        }


class SSODiscoveryThrottle(ConfigurableThrottle):
    """Rate limit for SSO discovery operations."""

    rate_category = RateLimitCategory.SSO_DISCOVERY
    scope = 'sso_discovery'

    def get_cache_key(self, request: Request, view) -> Optional[str]:
        return self.cache_format % {
            'scope': self.scope,
            'ident': get_client_ip(request),
        }


class SCIMApiThrottle(ConfigurableThrottle):
    """Rate limit for SCIM API operations."""

    rate_category = RateLimitCategory.SSO_SCIM
    scope = 'scim'
