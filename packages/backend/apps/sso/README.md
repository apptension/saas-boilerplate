# Enterprise SSO & Directory Sync

This Django app provides comprehensive Enterprise SSO capabilities for the SaaS Boilerplate.

## Features

- **SAML 2.0** - Industry-standard SSO protocol
- **OpenID Connect (OIDC)** - Modern OAuth-based SSO
- **SCIM 2.0** - Automated user provisioning
- **Just-in-Time (JIT) Provisioning** - Auto-create users on first SSO login
- **Group-to-Role Mapping** - Map IdP groups to tenant roles
- **Session Management** - View and revoke active sessions
- **Device Management** - Track and manage trusted devices
- **WebAuthn/Passkeys** - Passwordless authentication

## Quick Start

1. Ensure the app is in `INSTALLED_APPS` (already included):

```python
LOCAL_APPS = [
    # ...
    "apps.sso",
]
```

2. Run migrations:

```bash
uv run python manage.py makemigrations sso
uv run python manage.py migrate
```

3. Configure your identity provider (see documentation)

## Architecture

```
apps/sso/
├── __init__.py
├── admin.py              # Django admin configuration
├── apps.py               # App configuration
├── constants.py          # Enums and constants
├── managers.py           # Custom model managers
├── models.py             # Database models
├── schema.py             # GraphQL schema
├── serializers.py        # REST/GraphQL serializers
├── signals.py            # Django signals
├── urls.py               # URL routing
├── views.py              # REST API views
├── migrations/           # Database migrations
├── services/             # Business logic
│   ├── __init__.py
│   ├── saml.py          # SAML 2.0 implementation
│   ├── oidc.py          # OIDC implementation
│   ├── scim.py          # SCIM 2.0 implementation
│   ├── webauthn.py      # WebAuthn/Passkeys
│   ├── provisioning.py  # JIT provisioning
│   └── secrets.py       # AWS Secrets Manager
└── tests/               # Unit tests
```

## API Endpoints

### SAML

- `GET /api/sso/saml/{id}/metadata` - SP metadata
- `GET /api/sso/saml/{id}/login` - Initiate login
- `POST /api/sso/saml/{id}/acs` - Assertion consumer

### OIDC

- `GET /api/sso/oidc/{id}/login` - Initiate login
- `GET /api/sso/oidc/{id}/callback` - OAuth callback

### SCIM 2.0

- `GET/POST /api/sso/scim/v2/Users`
- `GET/PUT/PATCH/DELETE /api/sso/scim/v2/Users/{id}`
- `GET /api/sso/scim/v2/Groups`
- `GET /api/sso/scim/v2/Groups/{id}`

### WebAuthn

- `POST /api/sso/passkeys/register/options`
- `POST /api/sso/passkeys/register/verify`
- `POST /api/sso/passkeys/authenticate/options`
- `POST /api/sso/passkeys/authenticate/verify`
- `GET /api/sso/passkeys/`
- `DELETE /api/sso/passkeys/{id}`

## GraphQL

### Queries

- `ssoConnections` - List SSO connections (tenant owner)
- `scimTokens` - List SCIM tokens (tenant owner)
- `ssoAuditLogs` - View audit logs (tenant owner)
- `myPasskeys` - User's passkeys
- `mySessions` - User's active sessions
- `myDevices` - User's devices

### Mutations

- `createSsoConnection` - Create SSO connection
- `updateSsoConnection` - Update SSO connection
- `activateSsoConnection` - Activate connection
- `deactivateSsoConnection` - Deactivate connection
- `deleteSsoConnection` - Delete connection
- `createScimToken` - Create SCIM token
- `revokeScimToken` - Revoke SCIM token
- `revokeSession` - Revoke session
- `revokeAllSessions` - Revoke all sessions
- `renamePasskey` - Rename passkey
- `deletePasskey` - Delete passkey

## Security

- SAML certificates and OIDC client secrets can be stored in the database (per connection) or referenced by AWS Secrets Manager ARN. See [docs/AUDIT_SECRETS_STORAGE.md](docs/AUDIT_SECRETS_STORAGE.md) for an audit and recommendations.
- Comprehensive audit logging
- CSRF protection on all endpoints
- Rate limiting on authentication endpoints
- Sign count verification for passkeys

## Documentation

- **Secrets storage audit:** [docs/AUDIT_SECRETS_STORAGE.md](docs/AUDIT_SECRETS_STORAGE.md) – how certs/secrets are stored (DB vs AWS ARN), where they can be configured, and suggested improvements.
- Full documentation: `/docs/features/enterprise-sso/`.
