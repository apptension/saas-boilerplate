from django.contrib import admin
from django.urls import path

from common.views import HealthCheckView

urlpatterns = [
    path("", admin.site.urls),
    path("lbcheck", HealthCheckView.as_view(), name="health-check"),
]
