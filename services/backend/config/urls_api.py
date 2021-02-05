from django.urls import re_path
from django.urls import include
from django.urls import path
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
    openapi.Info(title="Documentation", default_version="v1"), public=True, permission_classes=(permissions.AllowAny,)
)

urlpatterns = [
    re_path(r"^doc/", schema_view.with_ui("swagger")),
    re_path(r"^redoc/", schema_view.with_ui("redoc")),
    path("api/", include("apps.users.urls")),
]
