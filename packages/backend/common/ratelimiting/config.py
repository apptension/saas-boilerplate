"""
Rate Limiting Configuration.

Centralized configuration for all rate limits in the application.
All limits are environment-configurable via Django settings.

Usage:
    from common.ratelimiting import get_rate_limit, RateLimitCategory

    # Get a configured rate limit
    rate = get_rate_limit(RateLimitCategory.AUTH_LOGIN)  # Returns '30/min'

    # Get rate limit for a specific tier
    rate = get_rate_limit(RateLimitCategory.AI_CHAT_MESSAGE, tier='power')  # Returns '20/min'
"""

import logging
from dataclasses import dataclass, field
from typing import Dict, Optional

from django.conf import settings

from .constants import RateLimitCategory, RateLimitKey, UserTier


logger = logging.getLogger(__name__)


@dataclass
class RateLimitConfig:
    """
    Configuration for a single rate limit.

    Attributes:
        rate: The rate limit string (e.g., '30/min', '100/hour', '1000/day')
        key: How to identify the rate-limited entity (IP, user, tenant)
        block: Whether to block requests that exceed the limit (vs just marking them)
        tier_rates: Optional dict of rates per UserTier for tiered limits
        description: Human-readable description of what this limit protects
    """

    rate: str
    key: RateLimitKey = RateLimitKey.USER_OR_IP
    block: bool = True
    tier_rates: Dict[UserTier, str] = field(default_factory=dict)
    description: str = ""

    def get_rate_for_tier(self, tier: UserTier) -> str:
        """Get the rate limit for a specific user tier."""
        if self.tier_rates and tier in self.tier_rates:
            return self.tier_rates[tier]
        return self.rate


# Default rate limit configurations
# These can be overridden via RATE_LIMITS setting in Django settings
DEFAULT_RATE_LIMITS: Dict[str, RateLimitConfig] = {
    # ===================
    # Authentication
    # ===================
    RateLimitCategory.AUTH_LOGIN: RateLimitConfig(
        rate="30/min",
        key=RateLimitKey.IP,
        description="Login attempts per IP to prevent credential stuffing",
    ),
    RateLimitCategory.AUTH_SIGNUP: RateLimitConfig(
        rate="10/min",
        key=RateLimitKey.IP,
        description="Signup requests per IP to prevent spam accounts",
    ),
    RateLimitCategory.AUTH_PASSWORD_RESET: RateLimitConfig(
        rate="5/hour",
        key=RateLimitKey.IP,
        description="Password reset requests per IP to prevent abuse",
    ),
    RateLimitCategory.AUTH_OTP: RateLimitConfig(
        rate="10/min",
        key=RateLimitKey.IP,
        description="OTP validation attempts to prevent brute force",
    ),
    RateLimitCategory.AUTH_PASSKEY: RateLimitConfig(
        rate="10/min",
        key=RateLimitKey.IP,
        description="Passkey authentication attempts",
    ),
    # ===================
    # GraphQL Global
    # ===================
    RateLimitCategory.GRAPHQL_GLOBAL_ANON: RateLimitConfig(
        rate="60/min",
        key=RateLimitKey.IP,
        description="Total GraphQL requests for anonymous users",
    ),
    RateLimitCategory.GRAPHQL_GLOBAL_USER: RateLimitConfig(
        rate="300/min",
        key=RateLimitKey.USER,
        tier_rates={
            UserTier.FREE: "150/min",
            UserTier.STANDARD: "300/min",
            UserTier.POWER: "1000/min",
            UserTier.ADMIN: "5000/min",
        },
        description="Total GraphQL requests for authenticated users",
    ),
    RateLimitCategory.GRAPHQL_QUERY: RateLimitConfig(
        rate="200/min",
        key=RateLimitKey.USER,
        description="GraphQL query operations",
    ),
    RateLimitCategory.GRAPHQL_MUTATION: RateLimitConfig(
        rate="100/min",
        key=RateLimitKey.USER,
        description="GraphQL mutation operations",
    ),
    # ===================
    # AI/MCP Operations (Expensive - OpenAI API calls)
    # ===================
    RateLimitCategory.AI_CHAT_MESSAGE: RateLimitConfig(
        rate="10/min",
        key=RateLimitKey.USER,
        tier_rates={
            UserTier.FREE: "5/min",
            UserTier.STANDARD: "10/min",
            UserTier.POWER: "20/min",
        },
        description="AI chat messages per minute (each costs OpenAI tokens)",
    ),
    RateLimitCategory.AI_CHAT_HOURLY: RateLimitConfig(
        rate="60/hour",
        key=RateLimitKey.USER,
        tier_rates={
            UserTier.FREE: "30/hour",
            UserTier.STANDARD: "60/hour",
            UserTier.POWER: "150/hour",
        },
        description="AI chat messages per hour (cost control)",
    ),
    RateLimitCategory.AI_MCP_PROXY: RateLimitConfig(
        rate="30/min",
        key=RateLimitKey.USER,
        description="MCP proxy requests (tool calls from AI)",
    ),
    RateLimitCategory.AI_PARSE: RateLimitConfig(
        rate="5/min",
        key=RateLimitKey.USER,
        tier_rates={
            UserTier.FREE: "3/min",
            UserTier.STANDARD: "5/min",
            UserTier.POWER: "15/min",
        },
        description="AI CSV/image parsing (expensive, uses vision API)",
    ),
    RateLimitCategory.AI_DETECT: RateLimitConfig(
        rate="10/min",
        key=RateLimitKey.USER,
        description="AI entity type detection",
    ),
    # ===================
    # Import Operations (Heavy DB operations)
    # ===================
    RateLimitCategory.IMPORT_CSV: RateLimitConfig(
        rate="3/min",
        key=RateLimitKey.USER,
        description="CSV import operations",
    ),
    RateLimitCategory.IMPORT_EXCEL: RateLimitConfig(
        rate="3/min",
        key=RateLimitKey.USER,
        description="Excel import operations",
    ),
    RateLimitCategory.IMPORT_DAILY: RateLimitConfig(
        rate="50/day",
        key=RateLimitKey.TENANT,
        description="Daily import operations per tenant",
    ),
    # ===================
    # File Operations
    # ===================
    RateLimitCategory.FILE_UPLOAD: RateLimitConfig(
        rate="20/min",
        key=RateLimitKey.USER,
        description="File upload operations",
    ),
    RateLimitCategory.FILE_UPLOAD_LARGE: RateLimitConfig(
        rate="5/min",
        key=RateLimitKey.USER,
        description="Large file uploads (>5MB)",
    ),
    # ===================
    # SSO Operations
    # ===================
    RateLimitCategory.SSO_LOGIN: RateLimitConfig(
        rate="20/min",
        key=RateLimitKey.IP,
        description="SSO login initiation",
    ),
    RateLimitCategory.SSO_DISCOVERY: RateLimitConfig(
        rate="60/min",
        key=RateLimitKey.IP,
        description="SSO domain discovery",
    ),
    RateLimitCategory.SSO_SCIM: RateLimitConfig(
        rate="100/min",
        key=RateLimitKey.USER,
        description="SCIM provisioning API operations",
    ),
    # ===================
    # General API
    # ===================
    RateLimitCategory.API_GENERAL: RateLimitConfig(
        rate="100/min",
        key=RateLimitKey.USER_OR_IP,
        description="General API endpoint rate limit",
    ),
}


def _get_settings_rate_limits() -> Dict[str, dict]:
    """
    Get rate limit overrides from Django settings.

    Settings format:
        RATE_LIMITS = {
            'auth.login': {'rate': '50/min'},
            'ai.chat.message': {'rate': '15/min', 'tier_rates': {'power': '30/min'}},
        }
    """
    return getattr(settings, "RATE_LIMITS", {})


def _merge_rate_limit_config(default: RateLimitConfig, override: Optional[dict]) -> RateLimitConfig:
    """Merge override dict into default RateLimitConfig."""
    if not override:
        return default

    return RateLimitConfig(
        rate=override.get("rate", default.rate),
        key=RateLimitKey(override.get("key", default.key)),
        block=override.get("block", default.block),
        tier_rates={UserTier(k): v for k, v in override.get("tier_rates", default.tier_rates).items()}
        if override.get("tier_rates")
        else default.tier_rates,
        description=override.get("description", default.description),
    )


# Cached merged configuration
_merged_config: Optional[Dict[str, RateLimitConfig]] = None


def get_rate_limits() -> Dict[str, RateLimitConfig]:
    """
    Get the complete rate limit configuration, merging defaults with settings overrides.

    Returns:
        Dict mapping category strings to RateLimitConfig objects.
    """
    global _merged_config

    if _merged_config is not None:
        return _merged_config

    overrides = _get_settings_rate_limits()
    merged = {}

    for category, default_config in DEFAULT_RATE_LIMITS.items():
        category_key = category.value if isinstance(category, RateLimitCategory) else category
        override = overrides.get(category_key)
        merged[category_key] = _merge_rate_limit_config(default_config, override)

    # Add any custom categories from settings that aren't in defaults
    for category_key, override_config in overrides.items():
        if category_key not in merged:
            merged[category_key] = RateLimitConfig(**override_config)

    _merged_config = merged
    return merged


def get_rate_limit(
    category: str,
    tier: Optional[UserTier] = None,
) -> str:
    """
    Get the rate limit string for a category.

    Args:
        category: The rate limit category (string or RateLimitCategory enum)
        tier: Optional user tier for tiered rate limits

    Returns:
        Rate limit string (e.g., '30/min')

    Example:
        >>> get_rate_limit('auth.login')
        '30/min'
        >>> get_rate_limit(RateLimitCategory.AI_CHAT_MESSAGE, tier=UserTier.POWER)
        '20/min'
    """
    category_key = category.value if isinstance(category, RateLimitCategory) else category
    config = get_rate_limits().get(category_key)

    if not config:
        logger.warning(f"Unknown rate limit category: {category_key}, using default")
        return "60/min"  # Safe default

    if tier:
        return config.get_rate_for_tier(tier)

    return config.rate


def get_rate_limit_config(category: str) -> Optional[RateLimitConfig]:
    """
    Get the full rate limit configuration for a category.

    Args:
        category: The rate limit category (string or RateLimitCategory enum)

    Returns:
        RateLimitConfig object or None if category not found
    """
    category_key = category.value if isinstance(category, RateLimitCategory) else category
    return get_rate_limits().get(category_key)


def clear_config_cache():
    """Clear the cached configuration. Useful for testing."""
    global _merged_config
    _merged_config = None


# Export for backwards compatibility and convenience
RATE_LIMITS = DEFAULT_RATE_LIMITS
