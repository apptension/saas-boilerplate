"""
Extended tests for SSO views (SAML, OIDC, SCIM, helpers).
"""

import pytest
from unittest.mock import patch, MagicMock
from rest_framework.test import APIClient
from rest_framework import status

from apps.sso.views import (
    get_client_ip,
    decode_tenant_id,
    is_owner_or_admin,
    scim_auth_required,
)
from apps.sso.models import SCIMToken, TenantSSOConnection
from apps.sso.services.scim import SCIMError
from apps.sso import constants

from . import factories


pytestmark = pytest.mark.django_db


class TestGetClientIp:
    """Tests for get_client_ip helper."""

    def test_returns_x_forwarded_for_when_present(self):
        request = MagicMock()
        request.META = {
            "HTTP_X_FORWARDED_FOR": "192.168.1.1, 10.0.0.1",
            "REMOTE_ADDR": "127.0.0.1",
        }
        assert get_client_ip(request) == "192.168.1.1"

    def test_returns_remote_addr_when_no_forwarded_for(self):
        request = MagicMock()
        request.META = {"REMOTE_ADDR": "127.0.0.1"}
        assert get_client_ip(request) == "127.0.0.1"


class TestDecodeTenantId:
    """Tests for decode_tenant_id helper."""

    def test_returns_pk_for_graphql_global_id(self):
        from graphql_relay import to_global_id

        gid = to_global_id("TenantType", "abc123")
        result = decode_tenant_id(gid)
        assert result == "abc123"

    def test_returns_as_is_for_raw_id(self):
        result = decode_tenant_id("raw-tenant-id")
        assert result == "raw-tenant-id"


class TestIsOwnerOrAdmin:
    """Tests for is_owner_or_admin helper."""

    def test_returns_true_for_owner(self, tenant, user_factory, tenant_membership_factory):
        from apps.multitenancy.constants import TenantUserRole

        user = user_factory()
        membership = tenant_membership_factory(user=user, tenant=tenant, role=TenantUserRole.OWNER, is_accepted=True)
        assert is_owner_or_admin(membership) is True

    def test_returns_true_for_admin(self, tenant, user_factory, tenant_membership_factory):
        from apps.multitenancy.constants import TenantUserRole

        user = user_factory()
        membership = tenant_membership_factory(user=user, tenant=tenant, role=TenantUserRole.ADMIN, is_accepted=True)
        assert is_owner_or_admin(membership) is True

    def test_returns_false_for_member(self, tenant, user_factory, tenant_membership_factory):
        from apps.multitenancy.constants import TenantUserRole

        user = user_factory()
        membership = tenant_membership_factory(user=user, tenant=tenant, role=TenantUserRole.MEMBER, is_accepted=True)
        assert is_owner_or_admin(membership) is False


class TestScimAuthRequired:
    """Tests for scim_auth_required decorator."""

    def test_rejects_missing_auth_header(self):
        request = MagicMock()
        request.META = {}

        def view(self, request, *args, **kwargs):
            return "ok"

        wrapped = scim_auth_required(view)
        response = wrapped(None, request)
        assert response.status_code == 401

    def test_rejects_invalid_auth_header_format(self):
        request = MagicMock()
        request.META = {"HTTP_AUTHORIZATION": "InvalidFormat token"}

        def view(self, request, *args, **kwargs):
            return "ok"

        wrapped = scim_auth_required(view)
        response = wrapped(None, request)
        assert response.status_code == 401

    def test_rejects_invalid_token(self):
        request = MagicMock()
        request.META = {"HTTP_AUTHORIZATION": "Bearer invalid_token"}

        with patch.object(SCIMToken.objects, "verify_token", return_value=None):

            def view(self, request, *args, **kwargs):
                return "ok"

            wrapped = scim_auth_required(view)
            response = wrapped(None, request)
            assert response.status_code == 401


class TestSSODiscoverView:
    """Tests for SSO discovery endpoint."""

    def test_returns_false_when_no_email(self):
        client = APIClient()
        response = client.get("/api/sso/discover")
        assert response.status_code == 200
        assert response.data["sso_available"] is False
        assert response.data["connections"] == []

    def test_returns_false_for_invalid_email_format(self):
        client = APIClient()
        response = client.get("/api/sso/discover?email=invalid")
        assert response.status_code == 200
        assert response.data["sso_available"] is False


class TestSSOLoginOptionsView:
    """Tests for SSO login options."""

    def test_returns_email_discovery_flow(self):
        client = APIClient()
        response = client.get("/api/sso/login-options")
        assert response.status_code == 200
        assert "flow" in response.data
        assert response.data["flow"] == "email_discovery"
