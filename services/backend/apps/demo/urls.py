from django.urls import include, path
from rest_framework.routers import SimpleRouter

from . import views

router = SimpleRouter()
router.register(r'crud-item', views.CrudDemoItemViewSet, basename='crud-demo-item')

urlpatterns = [path('', include(router.urls))]
