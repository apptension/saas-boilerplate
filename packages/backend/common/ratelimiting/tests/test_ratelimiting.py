"""
Tests for Rate Limiting Module.

Tests cover configuration, throttles, decorators, and WebSocket rate limiting.
"""

import pytest

pytestmark = pytest.mark.django_db
from unittest.mock import Mock, patch, MagicMock
from django.test import RequestFactory, override_settings
from django.core.cache import cache
from rest_framework.test import APIRequestFactory

from common.ratelimiting.config import (
    get_rate_limit,
    get_rate_limit_config,
    get_rate_limits,
    clear_config_cache,
    RateLimitConfig,
)
from common.ratelimiting.constants import (
    RateLimitCategory,
    RateLimitKey,
    UserTier,
    TIER_MULTIPLIERS,
)
from common.ratelimiting.utils import (
    get_client_ip,
    get_rate_limit_key,
    parse_rate_string,
    check_rate_limit,
)
from common.ratelimiting.throttles import (
    ConfigurableThrottle,
    TieredUserThrottle,
    AIOperationThrottle,
    GlobalAnonThrottle,
    GlobalUserThrottle,
)
from common.ratelimiting.websocket import (
    WebSocketRateLimiter,
    InMemoryRateLimiter,
    RateLimitResult,
)
from common.ratelimiting.decorators import (
    graphql_ratelimit,
    graphql_ratelimit_by_config,
)


@pytest.fixture
def request_factory():
    return RequestFactory()


@pytest.fixture
def api_request_factory():
    return APIRequestFactory()


@pytest.fixture(autouse=True)
def clear_cache():
    """Clear cache before each test."""
    cache.clear()
    clear_config_cache()
    yield
    cache.clear()


class TestRateLimitConfig:
    """Tests for rate limit configuration."""

    def test_get_default_rate_limit(self):
        """Should return default rate for known category."""
        rate = get_rate_limit(RateLimitCategory.AUTH_LOGIN)
        assert rate == '30/min'

    def test_get_rate_limit_by_string(self):
        """Should accept string category."""
        rate = get_rate_limit('auth.login')
        assert rate == '30/min'

    def test_get_rate_limit_unknown_category(self):
        """Should return safe default for unknown category."""
        rate = get_rate_limit('unknown.category')
        assert rate == '60/min'

    def test_get_rate_limit_with_tier(self):
        """Should return tier-specific rate when available."""
        rate = get_rate_limit(RateLimitCategory.GRAPHQL_GLOBAL_USER, tier=UserTier.POWER)
        assert rate == '1000/min'

    def test_get_rate_limit_config(self):
        """Should return full config object."""
        config = get_rate_limit_config(RateLimitCategory.AUTH_LOGIN)
        assert config is not None
        assert config.rate == '30/min'
        assert config.key == RateLimitKey.IP
        assert config.block is True

    @override_settings(RATE_LIMITS={'auth.login': {'rate': '50/min'}})
    def test_settings_override(self):
        """Should allow settings to override defaults."""
        clear_config_cache()
        rate = get_rate_limit(RateLimitCategory.AUTH_LOGIN)
        assert rate == '50/min'

    def test_rate_limit_config_tier_rates(self):
        """Should return tier-specific rate from config."""
        config = RateLimitConfig(
            rate='10/min',
            tier_rates={
                UserTier.FREE: '5/min',
                UserTier.POWER: '30/min',
            },
        )
        assert config.get_rate_for_tier(UserTier.FREE) == '5/min'
        assert config.get_rate_for_tier(UserTier.POWER) == '30/min'
        assert config.get_rate_for_tier(UserTier.STANDARD) == '10/min'  # Falls back to default


class TestRateLimitUtils:
    """Tests for rate limiting utilities."""

    def test_get_client_ip_direct(self, request_factory):
        """Should get IP from REMOTE_ADDR."""
        request = request_factory.get('/')
        request.META['REMOTE_ADDR'] = '192.168.1.1'
        assert get_client_ip(request) == '192.168.1.1'

    def test_get_client_ip_x_forwarded_for(self, request_factory):
        """Should prefer X-Forwarded-For header."""
        request = request_factory.get('/')
        request.META['HTTP_X_FORWARDED_FOR'] = '10.0.0.1, 192.168.1.1'
        request.META['REMOTE_ADDR'] = '127.0.0.1'
        assert get_client_ip(request) == '10.0.0.1'

    def test_get_client_ip_cf_connecting_ip(self, request_factory):
        """Should handle Cloudflare header."""
        request = request_factory.get('/')
        request.META['HTTP_CF_CONNECTING_IP'] = '203.0.113.1'
        request.META['REMOTE_ADDR'] = '127.0.0.1'
        assert get_client_ip(request) == '203.0.113.1'

    def test_parse_rate_string_minutes(self):
        """Should parse minute-based rates."""
        count, window = parse_rate_string('30/min')
        assert count == 30
        assert window == 60

    def test_parse_rate_string_hours(self):
        """Should parse hour-based rates."""
        count, window = parse_rate_string('100/hour')
        assert count == 100
        assert window == 3600

    def test_parse_rate_string_days(self):
        """Should parse day-based rates."""
        count, window = parse_rate_string('1000/day')
        assert count == 1000
        assert window == 86400

    def test_parse_rate_string_seconds(self):
        """Should parse second-based rates."""
        count, window = parse_rate_string('5/s')
        assert count == 5
        assert window == 1

    def test_parse_rate_string_invalid(self):
        """Should raise ValueError for invalid format."""
        with pytest.raises(ValueError):
            parse_rate_string('invalid')

    def test_get_rate_limit_key_ip(self, request_factory):
        """Should generate key based on IP."""
        request = request_factory.get('/')
        request.META['REMOTE_ADDR'] = '192.168.1.1'
        key = get_rate_limit_key(request, RateLimitKey.IP, 'test')
        assert 'ip' in key
        assert '192.168.1.1' in key

    def test_get_rate_limit_key_user(self, request_factory):
        """Should generate key based on user ID."""
        request = request_factory.get('/')
        user = Mock()
        user.is_authenticated = True
        user.id = 42
        request.user = user
        key = get_rate_limit_key(request, RateLimitKey.USER, 'test')
        assert 'user' in key
        assert '42' in key

    def test_check_rate_limit_allows_under_limit(self):
        """Should allow requests under the limit."""
        is_limited, count, remaining = check_rate_limit(
            'test:key:1',
            '10/min',
            increment=True,
        )
        assert not is_limited
        assert count == 1
        assert remaining == 9

    def test_check_rate_limit_blocks_over_limit(self):
        """Should block requests over the limit."""
        key = 'test:key:2'
        # Fill up the limit
        for i in range(10):
            check_rate_limit(key, '10/min', increment=True)

        # Next request should be blocked
        is_limited, count, remaining = check_rate_limit(key, '10/min', increment=True)
        assert is_limited
        assert count == 11
        assert remaining == 0


class TestThrottles:
    """Tests for DRF throttle classes."""

    def test_global_anon_throttle_scope(self):
        """Should have correct scope."""
        throttle = GlobalAnonThrottle()
        assert throttle.scope == 'global_anon'

    def test_global_user_throttle_scope(self):
        """Should have correct scope."""
        throttle = GlobalUserThrottle()
        assert throttle.scope == 'global_user'

    def test_ai_operation_throttle_scope(self):
        """Should have correct scope."""
        throttle = AIOperationThrottle()
        assert throttle.scope == 'ai_operation'

    def test_configurable_throttle_rate_from_config(self):
        """Should get rate from configuration."""
        throttle = AIOperationThrottle()
        assert throttle.rate == get_rate_limit(RateLimitCategory.AI_CHAT_MESSAGE)

    def test_tiered_throttle_get_user_tier_anonymous(self, api_request_factory):
        """Should return ANONYMOUS tier for unauthenticated users."""
        request = api_request_factory.get('/')
        request.user = None
        throttle = TieredUserThrottle()
        assert throttle.get_user_tier(request) == UserTier.ANONYMOUS

    def test_tiered_throttle_get_user_tier_admin(self, api_request_factory):
        """Should return ADMIN tier for superusers."""
        request = api_request_factory.get('/')
        user = Mock()
        user.is_authenticated = True
        user.is_superuser = True
        request.user = user
        throttle = TieredUserThrottle()
        assert throttle.get_user_tier(request) == UserTier.ADMIN

    def test_tiered_throttle_get_user_tier_standard(self, api_request_factory):
        """Should return STANDARD tier for regular authenticated users."""
        request = api_request_factory.get('/')
        user = Mock()
        user.is_authenticated = True
        user.is_superuser = False
        request.user = user
        throttle = TieredUserThrottle()
        assert throttle.get_user_tier(request) == UserTier.STANDARD


class TestWebSocketRateLimiter:
    """Tests for WebSocket rate limiting."""

    def test_create_rate_limiter(self):
        """Should create rate limiter with category."""
        limiter = WebSocketRateLimiter(RateLimitCategory.AI_CHAT_MESSAGE)
        assert limiter.category == RateLimitCategory.AI_CHAT_MESSAGE

    def test_check_allows_under_limit(self):
        """Should allow requests under the limit."""
        limiter = WebSocketRateLimiter(RateLimitCategory.AI_CHAT_MESSAGE)
        result = limiter.check(user_id='user1', tenant_id='tenant1')
        assert result.is_allowed
        assert result.current_count == 1

    def test_check_blocks_over_limit(self):
        """Should block requests over the limit."""
        # Use a low limit for testing
        with patch('common.ratelimiting.websocket.get_rate_limit', return_value='3/min'):
            limiter = WebSocketRateLimiter(RateLimitCategory.AI_CHAT_MESSAGE)
            limiter._rate = '3/min'  # Override cached rate

            # Make 3 allowed requests
            for _ in range(3):
                result = limiter.check(user_id='user2', tenant_id='tenant1')
                assert result.is_allowed

            # 4th request should be blocked
            result = limiter.check(user_id='user2', tenant_id='tenant1')
            assert not result.is_allowed
            assert 'Rate limit exceeded' in result.message

    def test_get_remaining(self):
        """Should return remaining requests."""
        with patch('common.ratelimiting.websocket.get_rate_limit', return_value='10/min'):
            limiter = WebSocketRateLimiter(RateLimitCategory.AI_CHAT_MESSAGE)
            limiter._rate = '10/min'

            # Make some requests
            limiter.check(user_id='user3', tenant_id='tenant1')
            limiter.check(user_id='user3', tenant_id='tenant1')

            remaining = limiter.get_remaining(user_id='user3', tenant_id='tenant1')
            assert remaining == 8

    def test_reset_clears_counters(self):
        """Should reset rate limit counters."""
        limiter = WebSocketRateLimiter(RateLimitCategory.AI_CHAT_MESSAGE)

        # Make some requests
        limiter.check(user_id='user4', tenant_id='tenant1')
        limiter.check(user_id='user4', tenant_id='tenant1')

        # Reset
        limiter.reset(user_id='user4', tenant_id='tenant1')

        # Should be back to full allowance
        with patch('common.ratelimiting.websocket.parse_rate_string', return_value=(10, 60)):
            remaining = limiter.get_remaining(user_id='user4', tenant_id='tenant1')
            assert remaining == 10


class TestInMemoryRateLimiter:
    """Tests for in-memory rate limiter."""

    def test_allows_under_limit(self):
        """Should allow requests under the limit."""
        limiter = InMemoryRateLimiter('5/min')
        is_allowed, _ = limiter.check('user1')
        assert is_allowed

    def test_blocks_over_limit(self):
        """Should block requests over the limit."""
        limiter = InMemoryRateLimiter('3/min')

        for _ in range(3):
            is_allowed, _ = limiter.check('user2')
            assert is_allowed

        is_allowed, message = limiter.check('user2')
        assert not is_allowed
        assert 'Rate limit exceeded' in message

    def test_hourly_limit(self):
        """Should enforce hourly limit."""
        limiter = InMemoryRateLimiter('10/min', hourly_rate='5/hour')

        for _ in range(5):
            is_allowed, _ = limiter.check('user3')
            assert is_allowed

        is_allowed, message = limiter.check('user3')
        assert not is_allowed
        assert 'Hourly limit exceeded' in message


class TestGraphQLRateLimitDecorator:
    """Tests for GraphQL rate limit decorator."""

    def test_decorator_applies_rate_limit(self, request_factory):
        """Should apply rate limit to decorated function."""

        @graphql_ratelimit(rate='5/min', key=RateLimitKey.IP)
        def my_resolver(root, info):
            return 'success'

        request = request_factory.get('/')
        request.META['REMOTE_ADDR'] = '192.168.1.100'

        info = Mock()
        info.context = request

        # Should work under limit
        for _ in range(5):
            result = my_resolver(None, info)
            assert result == 'success'

    def test_decorator_by_config(self, request_factory):
        """Should use config for decorated function."""

        @graphql_ratelimit_by_config(RateLimitCategory.AUTH_LOGIN)
        def my_mutation(root, info):
            return 'success'

        request = request_factory.get('/')
        request.META['REMOTE_ADDR'] = '192.168.1.101'

        info = Mock()
        info.context = request

        result = my_mutation(None, info)
        assert result == 'success'


class TestRateLimitConstants:
    """Tests for rate limit constants."""

    def test_rate_limit_key_values(self):
        """Should have correct string values."""
        assert RateLimitKey.IP.value == 'ip'
        assert RateLimitKey.USER.value == 'user'
        assert RateLimitKey.TENANT.value == 'tenant'

    def test_rate_limit_category_values(self):
        """Should have hierarchical string values."""
        assert RateLimitCategory.AUTH_LOGIN.value == 'auth.login'
        assert RateLimitCategory.AI_CHAT_MESSAGE.value == 'ai.chat.message'

    def test_user_tier_values(self):
        """Should have correct string values."""
        assert UserTier.ANONYMOUS.value == 'anonymous'
        assert UserTier.POWER.value == 'power'

    def test_tier_multipliers(self):
        """Should have sensible multipliers."""
        assert TIER_MULTIPLIERS[UserTier.ANONYMOUS] < TIER_MULTIPLIERS[UserTier.STANDARD]
        assert TIER_MULTIPLIERS[UserTier.STANDARD] < TIER_MULTIPLIERS[UserTier.POWER]
        assert TIER_MULTIPLIERS[UserTier.POWER] < TIER_MULTIPLIERS[UserTier.ADMIN]
