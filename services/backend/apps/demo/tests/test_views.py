import pytest
from django.urls import reverse
from rest_framework import status

pytestmark = pytest.mark.django_db


class TestContentfulDemoItemViewSet:
    def test_user_profile_only_when_authenticated(self, api_client):
        response = api_client.get(reverse("profile"))
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
