from django.conf.urls import url
from django.urls import path, include
from rest_framework_jwt.views import obtain_jwt_token
from social_django import views as django_social_views

from . import views

social_patterns = [
    # authentication / association
    url(r'^login/(?P<backend>[^/]+)/$', django_social_views.auth, name='begin'),
    url(r'^complete/(?P<backend>[^/]+)/$', views.complete, name='complete'),
    # disconnection
    url(r'^disconnect/(?P<backend>[^/]+)/$', django_social_views.disconnect, name='disconnect'),
    url(
        r'^disconnect/(?P<backend>[^/]+)/(?P<association_id>\d+)/$',
        django_social_views.disconnect,
        name='disconnect_individual',
    ),
]

user_patterns = [
    path("signup/", views.SignUpView.as_view(), name="signup"),
    path("token/", obtain_jwt_token, name="jwt_token"),
    path("me/", views.UserProfileView.as_view(), name="profile"),
    path("confirm/", views.UserAccountConfirmationView.as_view(), name="confirmation"),
    path(
        "change-password/",
        views.UserAccountChangePasswordView.as_view(),
        name="change_password",
    ),
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
