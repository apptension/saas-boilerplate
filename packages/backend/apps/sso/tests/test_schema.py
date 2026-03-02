"""
Tests for SSO GraphQL schema.

Note: These tests verify that GraphQL types and queries are properly registered.
More comprehensive tests will be added as mutations are implemented.
"""

import pytest
from graphql_relay import to_global_id

from apps.multitenancy.constants import TenantUserRole
from apps.multitenancy.models import TenantMembership
from apps.sso import models, constants

from . import factories


pytestmark = pytest.mark.django_db


class TestSSOGraphQLTypes:
    """Tests for SSO GraphQL types registration."""

    def test_sso_connection_type_exists(self, graphene_client):
        """Test that SSOConnectionType is registered in schema."""
        query = """
            query {
                __type(name: "SSOConnectionType") {
                    name
                    kind
                }
            }
        """

        response = graphene_client.query(query)

        assert response.get('errors') is None
        assert response['data']['__type'] is not None
        assert response['data']['__type']['name'] == 'SSOConnectionType'

    def test_scim_token_type_exists(self, graphene_client):
        """Test that SCIMTokenType is registered in schema."""
        query = """
            query {
                __type(name: "SCIMTokenType") {
                    name
                    kind
                }
            }
        """

        response = graphene_client.query(query)

        assert response.get('errors') is None
        assert response['data']['__type'] is not None
        assert response['data']['__type']['name'] == 'SCIMTokenType'

    def test_passkey_type_exists(self, graphene_client):
        """Test that PasskeyType is registered in schema."""
        query = """
            query {
                __type(name: "PasskeyType") {
                    name
                    kind
                }
            }
        """

        response = graphene_client.query(query)

        assert response.get('errors') is None
        assert response['data']['__type'] is not None
        assert response['data']['__type']['name'] == 'PasskeyType'

    def test_sso_session_type_exists(self, graphene_client):
        """Test that SSOSessionType is registered in schema."""
        query = """
            query {
                __type(name: "SSOSessionType") {
                    name
                    kind
                }
            }
        """

        response = graphene_client.query(query)

        assert response.get('errors') is None
        assert response['data']['__type'] is not None
        assert response['data']['__type']['name'] == 'SSOSessionType'

    def test_sso_audit_log_type_exists(self, graphene_client):
        """Test that SSOAuditLogType is registered in schema."""
        query = """
            query {
                __type(name: "SSOAuditLogType") {
                    name
                    kind
                }
            }
        """

        response = graphene_client.query(query)

        assert response.get('errors') is None
        assert response['data']['__type'] is not None
        assert response['data']['__type']['name'] == 'SSOAuditLogType'


class TestSSOMutationsRegistration:
    """Tests for SSO mutations registration."""

    def test_create_sso_connection_mutation_exists(self, graphene_client):
        """Test that createSsoConnection mutation is registered."""
        query = """
            query {
                __type(name: "ApiMutation") {
                    fields {
                        name
                    }
                }
            }
        """

        response = graphene_client.query(query)

        assert response.get('errors') is None
        field_names = [f['name'] for f in response['data']['__type']['fields']]
        assert 'createSsoConnection' in field_names

    def test_create_scim_token_mutation_exists(self, graphene_client):
        """Test that createScimToken mutation is registered."""
        query = """
            query {
                __type(name: "ApiMutation") {
                    fields {
                        name
                    }
                }
            }
        """

        response = graphene_client.query(query)

        assert response.get('errors') is None
        field_names = [f['name'] for f in response['data']['__type']['fields']]
        assert 'createScimToken' in field_names
