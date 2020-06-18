from django.conf.urls import url
from django.urls import include
from django.urls import path
from rest_framework_jwt.views import obtain_jwt_token
from rest_framework_swagger.views import get_swagger_view

from . import views

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
]

password_reset_patterns = [
    path("", views.PasswordResetView.as_view(), name="password_reset"),
    path(
        r"confirm/",
        views.PasswordResetConfirmationView.as_view(),
        name="password_reset_confirmation",
    ),
]

urlpatterns = [
    path("lbcheck", views.HealthCheckView.as_view(), name="health-check"),
    url(r"^doc/", get_swagger_view(title="Documentation")),
    path("auth/", include(user_patterns)),
    path("password-reset/", include(password_reset_patterns)),
]
