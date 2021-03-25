from django.urls import path, include

from . import views_admin

stripe_urls = [
    path(r"payment-intent/<str:pk>/refund/", views_admin.AdminRefundView.as_view(), name='payment-intent-refund'),
]

urlpatterns = [
    path("stripe/", include(stripe_urls)),
]
