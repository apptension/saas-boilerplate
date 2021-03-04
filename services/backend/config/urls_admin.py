from django.contrib import admin
from django.urls import path, include

urlpatterns = [path("", admin.site.urls), path("finances/", include("apps.finances.urls_admin"))]
