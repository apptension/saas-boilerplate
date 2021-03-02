from django.urls import include, path, re_path
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import permissions

schema_view = get_schema_view(
    openapi.Info(title="Documentation", default_version="v1"), public=True, permission_classes=(permissions.AllowAny,)
)

urlpatterns = [
    re_path(r"^doc/", schema_view.with_ui("swagger")),
    re_path(r"^redoc/", schema_view.with_ui("redoc")),
    path(
        "api/",
        include(
            [
                path("content/", include("apps.content.urls")),
                path("demo/", include("apps.demo.urls")),
                path("finances/", include("apps.finances.urls")),
                path("", include("apps.users.urls")),
            ]
        ),
    ),
]
