from channels.db import database_sync_to_async
from django.conf import settings
from django.http import parse_cookie
from rest_framework import HTTP_HEADER_ENCODING
from rest_framework_simplejwt import authentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError


class JSONWebTokenCookieAuthentication(authentication.JWTAuthentication):
    """
    Custom JWT authentication that reads the token from cookies.

    Unlike the default JWTAuthentication, this class catches token validation
    errors (expired, invalid, etc.) and returns None instead of raising an
    exception. This allows endpoints with AllowAny permission to work for
    users with expired cookies - they'll be treated as unauthenticated instead
    of getting a 401 error.
    """

    def get_header(self, request):
        """
        Extracts the header containing the JSON web token from the given
        request.
        """
        header = request.COOKIES.get(settings.ACCESS_TOKEN_COOKIE)

        if isinstance(header, str):
            # Work around django test client oddness
            header = header.encode(HTTP_HEADER_ENCODING)

        return header

    def get_raw_token(self, header):
        return header

    def authenticate(self, request):
        """
        Override authenticate to catch token errors and return None.

        When a token is expired or invalid, we return None instead of raising
        an exception. This allows the permission classes to handle the request:
        - AllowAny endpoints will work (user treated as anonymous)
        - IsAuthenticated endpoints will still fail with 403

        This is important for the login page where we need to fetch translations
        and SSO options even if the user has expired cookies.
        """
        try:
            return super().authenticate(request)
        except (InvalidToken, TokenError):
            # Token is expired or invalid - treat as unauthenticated
            # rather than raising a 401 error
            return None


class JSONWebTokenChannelsAuthentication(authentication.JWTAuthentication):
    """
    JWT authentication for Django Channels WebSocket connections.
    Reads the token from cookies in the WebSocket connection scope.
    """

    def get_header(self, scope):
        for name, value in scope.get("headers", []):
            if name == b"cookie":
                cookies = parse_cookie(value.decode("latin1"))
                break
        else:
            # No cookie header found - add an empty default.
            cookies = {}

        """
        Extracts the header containing the JSON web token from the given
        request.
        """
        header = cookies.get(settings.ACCESS_TOKEN_COOKIE)

        if isinstance(header, str):
            # Work around django test client oddness
            header = header.encode(HTTP_HEADER_ENCODING)

        return header

    def get_raw_token(self, header):
        return header

    def authenticate(self, scope):
        """
        Override authenticate to catch token errors and return None.
        This prevents WebSocket connection errors when tokens are expired.
        """
        try:
            return super().authenticate(scope)
        except (InvalidToken, TokenError):
            # Token is expired or invalid - treat as unauthenticated
            return None


class JSONWebTokenCookieMiddleware:
    """
    ASGI middleware for JWT authentication on WebSocket connections.
    """

    def __init__(self, app):
        self.app = app

    @database_sync_to_async
    def authenticate(self, scope):
        auth_backend = JSONWebTokenChannelsAuthentication()
        try:
            return auth_backend.authenticate(scope)
        except (InvalidToken, TokenError):
            # Token is expired or invalid - proceed without user
            return None

    def _get_raw_token(self, scope):
        """Extract raw JWT token from cookies in scope headers."""
        for name, value in scope.get("headers", []):
            if name == b"cookie":
                cookies = parse_cookie(value.decode("latin1"))
                return cookies.get(settings.ACCESS_TOKEN_COOKIE)
        return None

    async def __call__(self, scope, receive, send):
        scope = dict(scope)
        result = await self.authenticate(scope)
        if result is not None:
            user, validated_token = result
            scope["user"] = user
            # Store the raw JWT token string for downstream use (e.g., AI assistant MCP)
            scope["jwt_token"] = self._get_raw_token(scope)

        return await self.app(scope, receive, send)
