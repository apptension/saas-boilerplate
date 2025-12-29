"""
SSO Tests Package

This package contains comprehensive tests for the Enterprise SSO feature:

- test_models.py: Unit tests for SSO models (TenantSSOConnection, SCIMToken, 
                  SSOUserLink, SSOSession, UserDevice, UserPasskey, etc.)

- test_services.py: Unit tests for SSO services (SAMLService, OIDCService,
                    SCIMService, JITProvisioningService, WebAuthnService, etc.)

- test_views.py: Tests for REST API endpoints (SAML, OIDC, SCIM, WebAuthn,
                 Session management endpoints)

- test_schema.py: GraphQL schema tests (queries and mutations for SSO 
                  connections, SCIM tokens, passkeys, sessions, audit logs)

- test_integration.py: End-to-end integration tests for complete SSO flows
                       (SAML login, OIDC login, SCIM provisioning, session
                       management, passkey flows)

- factories.py: Factory Boy factories for creating test data

- fixtures.py: Pytest fixtures for common test setup

- conftest.py: Pytest configuration and fixture registration
"""
