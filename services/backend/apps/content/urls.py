from django.urls import path

from . import views

urlpatterns = [path("contentful-hook/", views.ContentfulWebhook.as_view(), name="contentful-webhook")]
