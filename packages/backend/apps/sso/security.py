"""
Security utilities for SSO module.

This module provides security-focused helper functions for:
- URL/redirect validation (preventing open redirects)
- Safe error handling (preventing information disclosure)
- Input validation and sanitization
- Rate limiting helpers

All functions follow the principle of secure-by-default.
"""

import hashlib
import logging
import re
import secrets
from typing import Optional, Dict, Any
from urllib.parse import urlparse


logger = logging.getLogger(__name__)


# ===================
# Open Redirect Prevention
# ===================


def validate_redirect_path(path: str, default: str = '/en/') -> str:
    """
    Validate that a redirect path is safe (relative, no protocol tricks).

    This prevents open redirect vulnerabilities by ensuring the path:
    - Starts with a single forward slash (relative URL)
    - Does not contain protocol specifiers
    - Does not contain URL encoding tricks
    - Does not use backslash variations

    Args:
        path: The path to validate
        default: Default path to return if validation fails

    Returns:
        The validated path, or the default if validation fails

    Examples:
        >>> validate_redirect_path('/dashboard')
        '/dashboard'
        >>> validate_redirect_path('//evil.com')
        '/en/'
        >>> validate_redirect_path('http://evil.com')
        '/en/'
        >>> validate_redirect_path('/\\\\evil.com')
        '/en/'
    """
    if not path or not isinstance(path, str):
        return default

    path = path.strip()

    # Must start with single forward slash (relative URL)
    if not path.startswith('/'):
        logger.warning(f"Redirect path rejected (not relative): {path[:50]}")
        return default

    # Block protocol-relative URLs (//evil.com)
    if path.startswith('//'):
        logger.warning(f"Redirect path rejected (protocol-relative): {path[:50]}")
        return default

    # Block absolute URLs embedded in path
    if '://' in path:
        logger.warning(f"Redirect path rejected (contains protocol): {path[:50]}")
        return default

    # Block backslash tricks (/\evil.com which some browsers interpret as //evil.com)
    if '\\' in path:
        logger.warning(f"Redirect path rejected (contains backslash): {path[:50]}")
        return default

    # Block null bytes and other control characters
    if '\x00' in path or any(ord(c) < 32 for c in path):
        logger.warning("Redirect path rejected (contains control characters)")
        return default

    # Block encoded variations that could bypass checks after URL decoding
    # Check for double-encoded or suspicious patterns
    suspicious_patterns = [
        '%00',  # Null byte
        '%2f%2f',  # //
        '%5c',  # \
        '%252f',  # Double-encoded /
        '%255c',  # Double-encoded \
        '@',  # user@host URL pattern
    ]
    path_lower = path.lower()
    for pattern in suspicious_patterns:
        if pattern in path_lower:
            logger.warning(f"Redirect path rejected (suspicious pattern '{pattern}'): {path[:50]}")
            return default

    # Validate the path doesn't try to escape with excessive ../
    # Normalize and check
    try:
        parsed = urlparse(path)
        # If urlparse finds a netloc, it's trying to be an absolute URL
        if parsed.netloc:
            logger.warning(f"Redirect path rejected (has netloc): {path[:50]}")
            return default
        # If scheme is present, it's trying to be absolute
        if parsed.scheme:
            logger.warning(f"Redirect path rejected (has scheme): {path[:50]}")
            return default
    except Exception:
        return default

    return path


def build_safe_redirect_url(base_url: str, path: str, default_path: str = '/en/') -> str:
    """
    Build a safe redirect URL by combining a base URL with a validated path.

    Args:
        base_url: The base URL (e.g., WEB_APP_URL)
        path: The path to append (will be validated)
        default_path: Default path if validation fails

    Returns:
        A safe full redirect URL
    """
    safe_path = validate_redirect_path(path, default_path)
    # Ensure base_url doesn't end with / to avoid double slashes
    base_url = base_url.rstrip('/')
    return f"{base_url}{safe_path}"


# ===================
# Safe Error Handling
# ===================

# Predefined safe error codes that map internal errors to user-friendly messages
SSO_ERROR_CODES = {
    'auth_failed': 'Authentication failed. Please try again.',
    'invalid_response': 'Invalid response from identity provider.',
    'missing_email': 'Email address not provided by identity provider.',
    'domain_not_allowed': 'Your email domain is not authorized for this organization.',
    'provisioning_disabled': 'Automatic account creation is disabled. Contact your administrator.',
    'session_expired': 'Your session has expired. Please sign in again.',
    'config_error': 'SSO is not properly configured. Contact your administrator.',
    'signature_invalid': 'Security validation failed. Please try again.',
    'state_mismatch': 'Security check failed. Please start the sign-in process again.',
    'rate_limited': 'Too many attempts. Please wait before trying again.',
    'generic': 'An error occurred during sign-in. Please try again or contact support.',
}


def get_safe_error_code(exception: Exception) -> str:
    """
    Map an internal exception to a safe, non-revealing error code.

    This prevents information disclosure by returning only predefined
    error codes instead of raw exception messages.

    Args:
        exception: The exception to map

    Returns:
        A safe error code key from SSO_ERROR_CODES
    """
    error_msg = str(exception).lower()

    # Log the actual error for debugging (server-side only)
    logger.error(f"SSO error mapped to safe code: {exception}")

    # Map common error patterns to safe codes
    if 'email' in error_msg and ('missing' in error_msg or 'not found' in error_msg or 'no email' in error_msg):
        return 'missing_email'

    if 'domain' in error_msg and ('not allowed' in error_msg or 'restricted' in error_msg):
        return 'domain_not_allowed'

    if 'provisioning' in error_msg or 'jit' in error_msg or 'disabled' in error_msg:
        return 'provisioning_disabled'

    if 'signature' in error_msg or 'certificate' in error_msg or 'verification' in error_msg:
        return 'signature_invalid'

    if 'state' in error_msg and ('mismatch' in error_msg or 'invalid' in error_msg or 'expired' in error_msg):
        return 'state_mismatch'

    if 'expired' in error_msg or 'timeout' in error_msg:
        return 'session_expired'

    if 'config' in error_msg or 'not configured' in error_msg:
        return 'config_error'

    if 'rate' in error_msg or 'throttle' in error_msg or 'too many' in error_msg:
        return 'rate_limited'

    if 'invalid' in error_msg and 'response' in error_msg:
        return 'invalid_response'

    # Default to generic error
    return 'generic'


def get_error_message(error_code: str) -> str:
    """
    Get the user-friendly error message for an error code.

    Args:
        error_code: The error code key

    Returns:
        User-friendly error message
    """
    return SSO_ERROR_CODES.get(error_code, SSO_ERROR_CODES['generic'])


# ===================
# Input Validation
# ===================


def validate_pagination_params(
    start_index: Any,
    count: Any,
    default_start: int = 1,
    default_count: int = 100,
    max_count: int = 1000,
) -> tuple:
    """
    Safely parse and validate pagination parameters.

    Prevents integer overflow and DoS via excessive page sizes.

    Args:
        start_index: The start index parameter (1-based)
        count: The count/page size parameter
        default_start: Default start index
        default_count: Default count
        max_count: Maximum allowed count

    Returns:
        Tuple of (validated_start_index, validated_count)
    """
    try:
        validated_start = max(1, int(start_index)) if start_index else default_start
    except (ValueError, TypeError, OverflowError):
        validated_start = default_start

    try:
        validated_count = min(max_count, max(1, int(count))) if count else default_count
    except (ValueError, TypeError, OverflowError):
        validated_count = default_count

    # Additional safety: cap start_index to prevent memory issues
    if validated_start > 1000000:
        validated_start = 1

    return validated_start, validated_count


def sanitize_scim_filter(filter_expr: str, max_length: int = 500) -> Optional[Dict[str, str]]:
    """
    Safely parse and validate SCIM filter expressions.

    Only supports a whitelist of safe filter operations to prevent
    injection attacks.

    Supported filters:
    - userName eq "value"
    - externalId eq "value"
    - email eq "value"
    - active eq true/false

    Args:
        filter_expr: The SCIM filter expression
        max_length: Maximum allowed filter length

    Returns:
        Dict with 'attribute' and 'value' keys, or None if invalid
    """
    if not filter_expr or not isinstance(filter_expr, str):
        return None

    if len(filter_expr) > max_length:
        logger.warning(f"SCIM filter rejected (too long): {len(filter_expr)} chars")
        return None

    filter_expr = filter_expr.strip()

    # Pattern for: attribute eq "value" or attribute eq 'value'
    # Attribute whitelist: userName, externalId, email, active
    eq_pattern = r'^(userName|externalId|email)\s+eq\s+["\']([^"\']{1,255})["\']$'
    match = re.match(eq_pattern, filter_expr, re.IGNORECASE)

    if match:
        attribute = match.group(1).lower()
        value = match.group(2)

        # Additional validation for email-like values
        if attribute in ('username', 'email') and '@' in value and not re.match(r'^[^@\s]+@[^@\s]+\.[^@\s]+$', value):
            logger.warning(f"SCIM filter rejected (invalid email format): {value[:50]}")
            return None

        return {'attribute': attribute, 'value': value}

    # Pattern for: active eq true/false
    bool_pattern = r'^active\s+eq\s+(true|false)$'
    bool_match = re.match(bool_pattern, filter_expr, re.IGNORECASE)

    if bool_match:
        return {'attribute': 'active', 'value': bool_match.group(1).lower() == 'true'}

    logger.warning(f"SCIM filter rejected (unsupported pattern): {filter_expr[:100]}")
    return None


# ===================
# Secure Logging
# ===================


def hash_for_logging(value: str, length: int = 8) -> str:
    """
    Create a short hash of a value for safe logging.

    This allows correlation in logs without exposing PII.

    Args:
        value: The value to hash
        length: Length of the hash prefix to return

    Returns:
        A short hash prefix safe for logging
    """
    if not value:
        return 'none'
    return hashlib.sha256(value.encode()).hexdigest()[:length]


def safe_log_user_identifier(email: str) -> str:
    """
    Create a safe user identifier for logging that doesn't expose the full email.

    Args:
        email: User's email address

    Returns:
        Safe identifier for logging
    """
    if not email or '@' not in email:
        return 'unknown'

    local, domain = email.rsplit('@', 1)
    # Show first 2 chars of local part + domain (only if local part is long enough)
    masked_local = local[:2] + '***' if len(local) > 3 else '***'

    return f"{masked_local}@{domain}"


# ===================
# Constant-Time Comparison
# ===================


def constant_time_compare(val1: str, val2: str) -> bool:
    """
    Compare two strings in constant time to prevent timing attacks.

    This is important for comparing tokens, signatures, etc.

    Args:
        val1: First value
        val2: Second value

    Returns:
        True if values are equal, False otherwise
    """
    return secrets.compare_digest(
        val1.encode() if isinstance(val1, str) else val1, val2.encode() if isinstance(val2, str) else val2
    )


# ===================
# SAML Security Helpers
# ===================


def validate_saml_response_basic(response_xml: bytes) -> bool:
    """
    Perform basic validation on SAML response before full parsing.

    This is a defense-in-depth measure to reject obviously invalid
    responses early.

    Args:
        response_xml: The raw SAML response bytes

    Returns:
        True if basic validation passes
    """
    if not response_xml:
        return False

    # Check reasonable size limits (SAML responses shouldn't be huge)
    if len(response_xml) > 1024 * 1024:  # 1MB max
        logger.warning("SAML response rejected (too large)")
        return False

    # Check for XML declaration or SAML namespace
    response_str = response_xml[:1000].decode('utf-8', errors='ignore').lower()
    if '<saml' not in response_str and '<response' not in response_str:
        logger.warning("SAML response rejected (not SAML XML)")
        return False

    return True
