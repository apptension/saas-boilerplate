from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("finances/", include("apps.finances.urls_admin")),
    # Translations API for admin panel AI translation feature
    path("api/translations/", include("apps.translations.urls")),
    path("", admin.site.urls),
]
