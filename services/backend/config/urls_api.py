from django.urls import include, path, re_path
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import permissions
from django.conf import settings

from common.graphql.views import DRFAuthenticatedGraphQLView

api_info = openapi.Info(title="Documentation", default_version="v1")

schema_view = get_schema_view(api_info, public=True, permission_classes=(permissions.AllowAny,))

urlpatterns = [
    re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    re_path(r"^doc/", schema_view.with_ui("swagger")),
    re_path(r"^redoc/", schema_view.with_ui("redoc")),
    path(
        "api/",
        include(
            [
                path('graphql/', DRFAuthenticatedGraphQLView.as_view(graphiql=settings.DEBUG)),
                path("content/", include("apps.content.urls")),
                path("demo/", include("apps.demo.urls")),
                path("finances/", include("apps.finances.urls")),
                path("", include("apps.users.urls")),
            ]
        ),
    ),
]
