# Rate Limiting Module

Centralized rate limiting for the SaaS Boilerplate, providing consistent protection across GraphQL, REST, and WebSocket endpoints.

## Overview

This module provides:

- **Configurable limits** via `settings.py` and environment variables
- **Tiered rate limiting** based on user subscription tier
- **Multiple key types**: IP, user, tenant, or combinations
- **GraphQL decorators** for resolver-level rate limiting
- **DRF throttle classes** for REST API endpoints
- **WebSocket rate limiters** for real-time connections

## Quick Start

### GraphQL Mutations

```python
from common.ratelimiting import graphql_ratelimit, RateLimitCategory

class MyMutation(graphene.Mutation):
    @classmethod
    @graphql_ratelimit(rate=RateLimitCategory.AUTH_LOGIN)
    def mutate_and_get_payload(cls, root, info, **input):
        ...
```

### REST API Views

```python
from common.ratelimiting import AIOperationThrottle

class MyChatView(APIView):
    throttle_classes = [AIOperationThrottle]
```

### WebSocket Consumers

```python
from common.ratelimiting import WebSocketRateLimiter, RateLimitCategory

class MyConsumer(AsyncJsonWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.rate_limiter = WebSocketRateLimiter(
            category=RateLimitCategory.AI_CHAT_MESSAGE,
            hourly_category=RateLimitCategory.AI_CHAT_HOURLY,
        )

    async def handle_message(self, message):
        result = await self.rate_limiter.check_async(
            user_id=str(self.user.id),
            tenant_id=self.tenant_id,
        )
        if not result.is_allowed:
            await self.send_json({
                'type': 'error',
                'message': result.message,
            })
            return
        # Process message...
```

## Configuration

### Environment Variables

All rate limits can be overridden via environment variables:

```bash
# Authentication
RATE_LIMIT_AUTH_LOGIN=30/min
RATE_LIMIT_AUTH_SIGNUP=10/min
RATE_LIMIT_AUTH_PASSWORD_RESET=5/hour

# GraphQL global limits
RATE_LIMIT_GQL_ANON=60/min
RATE_LIMIT_GQL_USER=300/min
RATE_LIMIT_GQL_USER_POWER=1000/min

# AI/MCP (expensive operations)
RATE_LIMIT_AI_CHAT=10/min
RATE_LIMIT_AI_CHAT_HOURLY=60/hour
RATE_LIMIT_AI_MCP=30/min
RATE_LIMIT_AI_PARSE=5/min

# Imports
RATE_LIMIT_IMPORT_CSV=3/min
RATE_LIMIT_IMPORT_EXCEL=3/min

# File uploads
RATE_LIMIT_FILE_UPLOAD=20/min
RATE_LIMIT_FILE_UPLOAD_LARGE=5/min
```

### Django Settings

You can also configure limits directly in `settings.py`:

```python
RATE_LIMITS = {
    'auth.login': {'rate': '50/min'},
    'ai.chat.message': {
        'rate': '15/min',
        'tier_rates': {
            'free': '5/min',
            'standard': '15/min',
            'power': '30/min',
        },
    },
}
```

## Rate Limit Categories

### Authentication (`auth.*`)

| Category              | Default | Description             |
| --------------------- | ------- | ----------------------- |
| `auth.login`          | 30/min  | Login attempts (by IP)  |
| `auth.signup`         | 10/min  | Signup requests (by IP) |
| `auth.password_reset` | 5/hour  | Password reset requests |
| `auth.otp`            | 10/min  | OTP validation attempts |
| `auth.passkey`        | 10/min  | Passkey authentication  |

### GraphQL (`graphql.*`)

| Category              | Default | Description                    |
| --------------------- | ------- | ------------------------------ |
| `graphql.global.anon` | 60/min  | Anonymous GraphQL requests     |
| `graphql.global.user` | 300/min | Authenticated GraphQL requests |
| `graphql.query`       | 200/min | Query operations               |
| `graphql.mutation`    | 100/min | Mutation operations            |

### AI/MCP (`ai.*`)

| Category          | Default | Description            |
| ----------------- | ------- | ---------------------- |
| `ai.chat.message` | 10/min  | AI chat messages       |
| `ai.chat.hourly`  | 60/hour | AI chat hourly limit   |
| `ai.mcp.proxy`    | 30/min  | MCP proxy requests     |
| `ai.parse`        | 5/min   | AI parsing (expensive) |
| `ai.detect`       | 10/min  | AI entity detection    |

### Import Operations (`import.*`)

| Category       | Default | Description                   |
| -------------- | ------- | ----------------------------- |
| `import.csv`   | 3/min   | CSV import operations         |
| `import.excel` | 3/min   | Excel import operations       |
| `import.daily` | 50/day  | Daily import limit per tenant |

### File Operations (`file.*`)

| Category            | Default | Description               |
| ------------------- | ------- | ------------------------- |
| `file.upload`       | 20/min  | File uploads              |
| `file.upload.large` | 5/min   | Large file uploads (>5MB) |

### SSO Operations (`sso.*`)

| Category        | Default | Description          |
| --------------- | ------- | -------------------- |
| `sso.login`     | 20/min  | SSO login initiation |
| `sso.discovery` | 60/min  | SSO domain discovery |
| `sso.scim`      | 100/min | SCIM API operations  |

## Key Types

Rate limits can be keyed by different identifiers:

| Key Type      | Description                    | Use Case                           |
| ------------- | ------------------------------ | ---------------------------------- |
| `IP`          | Client IP address              | Anonymous requests, auth endpoints |
| `USER`        | Authenticated user ID          | Per-user limits                    |
| `USER_OR_IP`  | User if authenticated, else IP | Mixed endpoints                    |
| `TENANT`      | Tenant/organization ID         | Per-organization limits            |
| `USER_TENANT` | User + tenant combination      | Per-user-per-org limits            |

## User Tiers

Tiered rate limiting allows different limits based on subscription:

| Tier        | Multiplier | Example           |
| ----------- | ---------- | ----------------- |
| `ANONYMOUS` | 0.2x       | 60/min → 12/min   |
| `FREE`      | 0.5x       | 60/min → 30/min   |
| `STANDARD`  | 1.0x       | 60/min (baseline) |
| `POWER`     | 3.0x       | 60/min → 180/min  |
| `ADMIN`     | 10.0x      | 60/min → 600/min  |

## Architecture

```
common/ratelimiting/
├── __init__.py          # Public exports
├── config.py            # Centralized configuration
├── constants.py         # Enums and constants
├── decorators.py        # GraphQL decorators
├── throttles.py         # DRF throttle classes
├── websocket.py         # WebSocket rate limiting
├── utils.py             # Helper functions
├── README.md            # This file
└── tests/
    └── test_ratelimiting.py
```

## Cache Backend

Rate limiting uses Django's cache framework. For distributed deployments with multiple backend instances, ensure Redis is configured:

```python
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://localhost:6379/0',
    }
}

# Use the default cache for rate limiting
RATELIMIT_USE_CACHE = 'default'
```

## Testing

Run the rate limiting tests:

```bash
pnpm nx run backend:test -- -k "test_ratelimiting"
```

## Monitoring

When rate limits are exceeded, the module:

1. Logs a warning with user/tenant context
2. Returns appropriate HTTP 429 / WebSocket error
3. Includes `retry_after` information when possible

Monitor rate limit violations in your logging/observability stack to identify potential abuse or the need to adjust limits.
