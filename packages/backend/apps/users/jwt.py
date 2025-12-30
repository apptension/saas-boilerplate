"""
JWT token generation utilities.
"""

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken


def create_jwt_tokens(user) -> dict:
    """
    Create JWT access and refresh tokens for a user.

    Args:
        user: The user to create tokens for

    Returns:
        Dict with 'access' and 'refresh' token strings
    """
    refresh = RefreshToken.for_user(user)

    return {
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    }


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
