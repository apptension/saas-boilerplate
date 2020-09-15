from django.conf.urls import url
from django.urls import include
from django.urls import path
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

from common.views import HealthCheckView


schema_view = get_schema_view(
    openapi.Info(title="Documentation", default_version="v1"), public=True, permission_classes=(permissions.AllowAny,)
)

urlpatterns = [
    path("lbcheck", HealthCheckView.as_view(), name="health-check"),
    url(r"^doc/", schema_view.with_ui("swagger")),
    url(r"^redoc/", schema_view.with_ui("redoc")),
    path("", include("apps.users.urls")),
]
