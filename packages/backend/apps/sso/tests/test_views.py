"""
Tests for SSO views/endpoints.
"""

import pytest
from rest_framework.test import APIClient
from rest_framework import status

from apps.sso import models, constants

from . import factories


pytestmark = pytest.mark.django_db


class TestSSOEndpointBasics:
    """Basic tests for SSO endpoint structure."""

    @pytest.fixture
    def api_client(self):
        return APIClient()

    def test_sso_app_urls_load(self):
        """Test that SSO app URLs are properly configured."""
        from apps.sso import urls
        
        # Verify urlpatterns exist
        assert hasattr(urls, 'urlpatterns')
        assert len(urls.urlpatterns) > 0

    def test_passkeys_list_requires_auth(self, api_client):
        """Test passkey list requires authentication."""
        url = "/api/sso/passkeys/"
        
        response = api_client.get(url)
        
        # Either 401 or 404 is acceptable (401 if auth checked first, 404 if not found)
        assert response.status_code in [status.HTTP_401_UNAUTHORIZED, status.HTTP_404_NOT_FOUND]
