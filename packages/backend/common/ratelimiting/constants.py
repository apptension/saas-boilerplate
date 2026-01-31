"""
Rate Limiting Constants.

Defines the keys and categories used for rate limiting across the application.
"""

from enum import Enum


class RateLimitKey(str, Enum):
    """
    Keys used to identify rate-limited entities.

    These determine HOW rate limits are tracked (by IP, user, tenant, etc.)
    """

    IP = 'ip'
    """Rate limit by client IP address. Best for anonymous/unauthenticated requests."""

    USER = 'user'
    """Rate limit by authenticated user ID. Requires authentication."""

    USER_OR_IP = 'user_or_ip'
    """Rate limit by user if authenticated, otherwise by IP. Good for mixed endpoints."""

    TENANT = 'tenant'
    """Rate limit by tenant ID. Applies limits per organization."""

    USER_TENANT = 'user_tenant'
    """Rate limit by user+tenant combination. Per-user limits within each tenant."""


class RateLimitCategory(str, Enum):
    """
    Categories of rate-limited operations.

    These define WHAT is being rate limited for configuration purposes.
    """

    # Authentication operations
    AUTH_LOGIN = 'auth.login'
    AUTH_SIGNUP = 'auth.signup'
    AUTH_PASSWORD_RESET = 'auth.password_reset'
    AUTH_OTP = 'auth.otp'
    AUTH_PASSKEY = 'auth.passkey'

    # GraphQL operations
    GRAPHQL_GLOBAL_ANON = 'graphql.global.anon'
    GRAPHQL_GLOBAL_USER = 'graphql.global.user'
    GRAPHQL_QUERY = 'graphql.query'
    GRAPHQL_MUTATION = 'graphql.mutation'

    # AI/MCP operations (expensive - external API calls)
    AI_CHAT_MESSAGE = 'ai.chat.message'
    AI_CHAT_HOURLY = 'ai.chat.hourly'
    AI_MCP_PROXY = 'ai.mcp.proxy'
    AI_PARSE = 'ai.parse'
    AI_DETECT = 'ai.detect'

    # Import operations (heavy DB operations)
    IMPORT_CSV = 'import.csv'
    IMPORT_EXCEL = 'import.excel'
    IMPORT_DAILY = 'import.daily'

    # File operations
    FILE_UPLOAD = 'file.upload'
    FILE_UPLOAD_LARGE = 'file.upload.large'

    # SSO operations
    SSO_LOGIN = 'sso.login'
    SSO_DISCOVERY = 'sso.discovery'
    SSO_SCIM = 'sso.scim'

    # General API
    API_GENERAL = 'api.general'


class UserTier(str, Enum):
    """
    User tiers for tiered rate limiting.

    Different user tiers can have different rate limits.
    """

    ANONYMOUS = 'anonymous'
    """Unauthenticated users - strictest limits."""

    FREE = 'free'
    """Free tier users - moderate limits."""

    STANDARD = 'standard'
    """Standard paid users - generous limits."""

    POWER = 'power'
    """Power users or API access - highest limits."""

    ADMIN = 'admin'
    """Platform admins - unlimited or very high limits."""


# Mapping of tier multipliers (relative to standard rate)
TIER_MULTIPLIERS = {
    UserTier.ANONYMOUS: 0.2,  # 20% of standard
    UserTier.FREE: 0.5,  # 50% of standard
    UserTier.STANDARD: 1.0,  # 100% (baseline)
    UserTier.POWER: 3.0,  # 300% of standard
    UserTier.ADMIN: 10.0,  # 1000% of standard (effectively unlimited)
}
