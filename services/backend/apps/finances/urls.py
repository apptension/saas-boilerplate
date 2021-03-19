from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views

stripe_router = DefaultRouter()
stripe_router.register(r'payment-intent', views.StripePaymentIntentViewSet, basename='payment-intent')
stripe_router.register(r'setup-intent', views.StripeSetupIntentViewSet, basename='setup-intent')
stripe_router.register(r'payment-method', views.StripePaymentMethodViewSet, basename='payment-intent')

stripe_urls = [
    path("", include((stripe_router.urls, 'stripe_finances'), namespace='stripe_finances')),
    path("", include("djstripe.urls", namespace="djstripe")),
]

urlpatterns = [
    path("stripe/", include(stripe_urls)),
    path("subscription-plans/", views.SubscriptionPlansListView.as_view(), name='subscription-plans-list'),
    path("subscription/me/", views.UserActiveSubscriptionView.as_view(), name='user-active-subscription'),
    path(
        "subscription/me/cancel/",
        views.CancelUserActiveSubscriptionView.as_view(),
        name='user-active-subscription-cancel',
    ),
]
