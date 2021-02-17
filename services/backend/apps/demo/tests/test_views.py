import pytest
from django.urls import reverse
from rest_framework import status

from .. import models

pytestmark = pytest.mark.django_db


class TestContentfulDemoItemViewSet:
    def test_user_profile_only_when_authenticated(self, api_client):
        response = api_client.get(reverse("profile"))
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_create_favorite(self, api_client, user, demo_item):
        api_client.force_authenticate(user)

        url = reverse('contentful-demo-item-favorite', kwargs={'pk': demo_item.id})
        response = api_client.post(url)

        assert response.status_code == status.HTTP_201_CREATED
        favorite_query = models.ContentfulDemoItemFavorite.objects.get(item=demo_item, user=user)
        assert favorite_query

    def test_return_error_when_favorite_already_exists(self, api_client, user, contentful_demo_item_favorite):
        api_client.force_authenticate(user)

        url = reverse('contentful-demo-item-favorite', kwargs={'pk': contentful_demo_item_favorite.item.id})
        response = api_client.post(url)

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_remove_favorite(self, api_client, user, contentful_demo_item_favorite):
        api_client.force_authenticate(user)

        url = reverse('contentful-demo-item-favorite', kwargs={'pk': contentful_demo_item_favorite.item.id})
        response = api_client.delete(url)

        assert response.status_code == status.HTTP_204_NO_CONTENT
        favorite_query = models.ContentfulDemoItemFavorite.objects.filter(
            item=contentful_demo_item_favorite.item, user=user
        )
        assert not favorite_query.exists()
