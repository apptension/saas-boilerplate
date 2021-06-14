from django.urls import include, path
from rest_framework.routers import SimpleRouter

from . import views

router = SimpleRouter()
router.register(r'crud-item', views.CrudDemoItemViewSet, basename='crud-demo-item')
router.register(r'contentful-item', views.ContentfulDemoItemFavoriteViewSet, basename='contentful-demo-item')
router.register(
    r'contentful-item-favorite',
    views.ContentfulDemoItemFavoriteListViewSet,
    basename='contentful-demo-item-favorite',
)

urlpatterns = [
    path('', include(router.urls)),
]
