from django.urls import path, include
from django.urls import re_path
from social_django import views as django_social_views

from . import views

social_patterns = [
    # authentication / association
    re_path(r'^login/(?P<backend>[^/]+)/$', django_social_views.auth, name='begin'),
    re_path(r'^complete/(?P<backend>[^/]+)/$', views.complete, name='complete'),
    # disconnection
    re_path(r'^disconnect/(?P<backend>[^/]+)/$', django_social_views.disconnect, name='disconnect'),
    re_path(
        r'^disconnect/(?P<backend>[^/]+)/(?P<association_id>\d+)/$',
        django_social_views.disconnect,
        name='disconnect_individual',
    ),
]

user_patterns = [
    path("token-refresh/", views.CookieTokenRefreshView.as_view(), name="jwt_token_refresh"),
    path("logout/", views.LogoutView.as_view(), name="logout"),
    path("confirm/", views.UserAccountConfirmationView.as_view(), name="confirmation"),
    path('social/', include((social_patterns, 'social'), namespace='social')),
]

password_reset_patterns = [
    path("", views.PasswordResetView.as_view(), name="password_reset"),
    path(
        "confirm/",
        views.PasswordResetConfirmationView.as_view(),
        name="password_reset_confirmation",
    ),
]

urlpatterns = [path("auth/", include(user_patterns)), path("password-reset/", include(password_reset_patterns))]
