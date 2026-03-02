"""
JWT token generation utilities.
"""

from typing import Optional

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken


def create_jwt_tokens(user, session_id: Optional[str] = None, auth_method: str = 'password') -> dict:
    """
    Create JWT access and refresh tokens for a user.

    Args:
        user: The user to create tokens for
        session_id: Optional session ID to include in the token for session tracking
        auth_method: How the user authenticated ('password' or 'sso')

    Returns:
        Dict with 'access', 'refresh' token strings, and 'session_id' if provided
    """
    refresh = RefreshToken.for_user(user)

    refresh['auth_method'] = auth_method
    refresh.access_token['auth_method'] = auth_method

    if session_id:
        refresh["session_id"] = session_id
        refresh.access_token["session_id"] = session_id

    result = {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }

    if session_id:
        result["session_id"] = session_id

    return result


def get_auth_method_from_token(request) -> str:
    """
    Extract auth_method from the current request's JWT token.

    Returns 'password' if the claim is missing (backward compatibility).
    """
    try:
        if hasattr(request, 'auth') and request.auth:
            return request.auth.get('auth_method', 'password')
    except (AttributeError, TypeError):
        pass
    return 'password'


def get_session_id_from_token(request) -> Optional[str]:
    """
    Extract session_id from the current request's JWT token.

    Args:
        request: The HTTP request object

    Returns:
        The session_id from the token, or None if not present
    """
    try:
        if hasattr(request, "auth") and request.auth:
            return request.auth.get("session_id")
    except (AttributeError, TypeError):
        pass
    return None


def blacklist_user_tokens(user):
    """
    Blacklist all outstanding tokens for a user.

    Args:
        user: The user whose tokens should be blacklisted
    """
    # Get all outstanding tokens for the user
    outstanding_tokens = OutstandingToken.objects.filter(user=user)

    # Blacklist each token
    for token in outstanding_tokens:
        BlacklistedToken.objects.get_or_create(token=token)
