from django.urls import path, include

stripe_urls = [
    path("", include("djstripe.urls", namespace="djstripe")),
]

urlpatterns = [
    path("stripe/", include(stripe_urls)),
]
