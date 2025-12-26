"""
JWT token generation utilities.
"""

from rest_framework_simplejwt.tokens import RefreshToken


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
