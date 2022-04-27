---
title: SSO general info
sidebar_label: General
---

We're using [social-auth-app-django](https://github.com/python-social-auth/social-app-django) package to implement
social logins which is a part of [python-social-auth ecosystem](https://github.com/python-social-auth/social-core).

Project documentation is available at http://python-social-auth.readthedocs.org/.

## What is custom?

We introduced one significant change in the default configuration of the Django Social App:
a custom `SOCIAL_AUTH_STRATEGY` named `DjangoJWTStrategy`.
We use it to set an authentication HTTP only cookies during the last redirection back to the web app.

## Running locally

Set environmental variables in the `services/backend/.env` file.
If it doesn't exist create it using `services/backend/.env.example` first.

```
SOCIAL_AUTH_ALLOWED_REDIRECT_HOSTS=localhost:3000
```

## Running in AWS

##### Start AWS vault session

Run following command in the root of your project:

```shell
make aws-vault ENV_STAGE=<CHANGE_ME>
```

##### Set variables in AWS

First start the SSM editor tool by running following command in the root of your project:

```shell
make -C services/backend secrets
```

Variables are set in a JSON format so add following keys:

```json
{
  "SOCIAL_AUTH_ALLOWED_REDIRECT_HOSTS": "<CHANGE_ME>"
}
```

### Removing the feature

- Delete `social_django` from `INSTALLED_APPS` Django setting.
- Delete all backends from `social_core` package from `AUTHENTICATION_BACKENDS` Django setting.
- Delete all settings prefixed with `SOCIAL_` from Django settings module.
- Remove `social-auth-app-django` and `social-auth-core` from `pyproject.toml`:
    ```
    $ pdm remove social-auth-app-django social-auth-core
    ```
- Also:
```diff
diff --git a/services/backend/apps/users/strategy.py b/services/backend/apps/users/strategy.py
index 4c94870..e69de29 100644
--- a/services/backend/apps/users/strategy.py
+++ b/services/backend/apps/users/strategy.py
@@ -1,30 +0,0 @@
-from social_django.strategy import DjangoStrategy
-
-from . import utils
-
-
-class DjangoJWTStrategy(DjangoStrategy):
-    def __init__(self, storage, request=None, tpl=None):
-        self.token = None
-        super(DjangoJWTStrategy, self).__init__(storage, request, tpl)
-
-    def redirect(self, url):
-        """
-        This method is called multiple times by social_django in various situations.
-        One of such cases is when the OAuth2 flow is complete and we redirect user
-        back to the web app. In such case an HTTPOnly cookie should be set to a
-        JWT created during this step.
-        """
-        response = super(DjangoJWTStrategy, self).redirect(url)
-
-        if self.token:
-            # The token has a defined value, which means this is the
-            # last step of the OAuth flow – we can flush the session
-            self.session.flush()
-
-            utils.set_auth_cookie(response, {'access': str(self.token.access_token), 'refresh': str(self.token)})
-
-        return response
-
-    def set_jwt(self, token):
-        self.token = token
diff --git a/services/backend/apps/users/urls.py b/services/backend/apps/users/urls.py
index d1191a1..43ae4b3 100644
--- a/services/backend/apps/users/urls.py
+++ b/services/backend/apps/users/urls.py
@@ -1,22 +1,7 @@
 from django.urls import path, include
-from django.urls import re_path
-from social_django import views as django_social_views
 
 from . import views
 
-social_patterns = [
-    # authentication / association
-    re_path(r'^login/(?P<backend>[^/]+)/$', django_social_views.auth, name='begin'),
-    re_path(r'^complete/(?P<backend>[^/]+)/$', views.complete, name='complete'),
-    # disconnection
-    re_path(r'^disconnect/(?P<backend>[^/]+)/$', django_social_views.disconnect, name='disconnect'),
-    re_path(
-        r'^disconnect/(?P<backend>[^/]+)/(?P<association_id>\d+)/$',
-        django_social_views.disconnect,
-        name='disconnect_individual',
-    ),
-]
-
 user_patterns = [
     path("signup/", views.SignUpView.as_view(), name="signup"),
     path("token/", views.CookieTokenObtainPairView.as_view(), name="jwt_token"),
@@ -29,7 +14,6 @@ user_patterns = [
         views.UserAccountChangePasswordView.as_view(),
         name="change_password",
     ),
-    path('social/', include((social_patterns, 'social'), namespace='social')),
 ]
 
 password_reset_patterns = [
diff --git a/services/backend/apps/users/views.py b/services/backend/apps/users/views.py
index faa2099..a62afab 100644
--- a/services/backend/apps/users/views.py
+++ b/services/backend/apps/users/views.py
@@ -5,8 +5,6 @@ from rest_framework import generics, status
 from rest_framework.response import Response
 from rest_framework.throttling import AnonRateThrottle
 from rest_framework_simplejwt import views as jwt_views, tokens as jwt_tokens
-from social_core.actions import do_complete
-from social_django.utils import psa
 
 from common.acl import policies
 from . import serializers, utils
@@ -118,25 +116,3 @@ class CookieTokenRefreshView(jwt_views.TokenRefreshView):
         response = Response(serializer.validated_data, status=status.HTTP_200_OK)
         utils.set_auth_cookie(response, response.data)
         return response
-
-
-@never_cache
-@csrf_exempt
-@psa('social:complete')
-def complete(request, backend, *args, **kwargs):
-    """Authentication complete view"""
-
-    def _do_login(backend, user, social_user):
-        user.backend = '{0}.{1}'.format(backend.__module__, backend.__class__.__name__)
-        token = jwt_tokens.RefreshToken.for_user(user)
-        backend.strategy.set_jwt(token)
-
-    return do_complete(
-        request.backend,
-        _do_login,
-        user=request.user,
-        redirect_name=REDIRECT_FIELD_NAME,
-        request=request,
-        *args,
-        **kwargs
-    )
diff --git a/services/backend/config/settings.py b/services/backend/config/settings.py
index a45bd82..b74b43a 100644
--- a/services/backend/config/settings.py
+++ b/services/backend/config/settings.py
@@ -46,17 +46,15 @@ DJANGO_CORE_APPS = [
 
 THIRD_PARTY_APPS = [
     "django_extensions",
     "djstripe",
     "django_hosts",
     "drf_yasg",
     "rest_framework",
     "rest_framework_simplejwt.token_blacklist",
-    "social_django",
     "whitenoise",
     "graphene_django",
 ]
@@ -171,8 +169,6 @@ STATIC_URL = '/static/'
 AUTH_USER_MODEL = "users.User"
 
 AUTHENTICATION_BACKENDS = (
-    'social_core.backends.google.GoogleOAuth2',
-    'social_core.backends.facebook.FacebookOAuth2',
     'django.contrib.auth.backends.ModelBackend',
 )
 
@@ -198,32 +194,6 @@ SIMPLE_JWT = {
 ACCESS_TOKEN_COOKIE = 'token'
 REFRESH_TOKEN_COOKIE = 'refresh_token'
 
-SOCIAL_AUTH_USER_MODEL = "users.User"
-SOCIAL_AUTH_USER_FIELDS = ['email', 'username']
-SOCIAL_AUTH_STRATEGY = "apps.users.strategy.DjangoJWTStrategy"
-SOCIAL_AUTH_POSTGRES_JSONFIELD = True
-SOCIAL_AUTH_REDIRECT_IS_HTTPS = env.bool('SOCIAL_AUTH_REDIRECT_IS_HTTPS', default=True)
-SOCIAL_AUTH_PIPELINE = (
-    'social_core.pipeline.social_auth.social_details',
-    'social_core.pipeline.social_auth.social_uid',
-    'social_core.pipeline.social_auth.social_user',
-    'social_core.pipeline.user.get_username',
-    'social_core.pipeline.social_auth.associate_by_email',
-    'social_core.pipeline.user.create_user',
-    'social_core.pipeline.social_auth.associate_user',
-    'social_core.pipeline.social_auth.load_extra_data',
-    'social_core.pipeline.user.user_details',
-)
-SOCIAL_AUTH_ALLOWED_REDIRECT_HOSTS = env.list('SOCIAL_AUTH_ALLOWED_REDIRECT_HOSTS', default=[])
-SOCIAL_AUTH_GOOGLE_OAUTH2_KEY = env('SOCIAL_AUTH_GOOGLE_OAUTH2_KEY', default='')
-SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET = env('SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET', default='')
-SOCIAL_AUTH_FACEBOOK_KEY = env('SOCIAL_AUTH_FACEBOOK_KEY', default='')
-SOCIAL_AUTH_FACEBOOK_SECRET = env('SOCIAL_AUTH_FACEBOOK_SECRET', default='')
-SOCIAL_AUTH_FACEBOOK_SCOPE = ['email', 'public_profile']
-SOCIAL_AUTH_FACEBOOK_PROFILE_EXTRA_PARAMS = {
-    'fields': 'id, name, email',
-}
-
 SWAGGER_SETTINGS = {
     'DEFAULT_INFO': 'config.urls_api.api_info',
     "SECURITY_DEFINITIONS": {"api_key": {"type": "apiKey", "in": "header", "name": "Authorization"}},

```
