from django.urls import path, include

from . import views

stripe_urls = [
    path(r"payment-intent/<str:pk>/refund/", views.AdminRefundView.as_view(), name='payment-intent-refund'),
]

urlpatterns = [
    path("stripe/", include(stripe_urls)),
]
