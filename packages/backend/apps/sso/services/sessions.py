"""
Session management service for tracking user sessions.
"""

from datetime import timedelta
from typing import Optional, Tuple

from django.utils import timezone

from ..models import SSOSession


def parse_user_agent(user_agent: str) -> dict:
    """
    Parse user agent string to extract browser, OS, and device type.

    Uses simple regex patterns to avoid external dependencies.
    Returns dict with: browser, operating_system, device_type, device_name
    """
    if not user_agent:
        return {
            'browser': 'Unknown',
            'operating_system': 'Unknown',
            'device_type': 'desktop',
            'device_name': 'Unknown Device',
        }

    ua = user_agent.lower()

    # Detect device type
    device_type = 'desktop'
    if any(mobile in ua for mobile in ['mobile', 'android', 'iphone', 'ipod', 'blackberry', 'windows phone']):
        device_type = 'mobile'
    elif any(tablet in ua for tablet in ['ipad', 'tablet', 'kindle']):
        device_type = 'tablet'

    # Detect operating system
    operating_system = 'Unknown'
    if 'windows nt 10' in ua or 'windows nt 11' in ua or 'windows' in ua:
        operating_system = 'Windows'
    elif 'mac os x' in ua or 'macintosh' in ua:
        operating_system = 'macOS'
    elif 'iphone' in ua or 'ipad' in ua:
        operating_system = 'iOS'
    elif 'android' in ua:
        operating_system = 'Android'
    elif 'linux' in ua:
        operating_system = 'Linux'
    elif 'chrome os' in ua:
        operating_system = 'Chrome OS'

    # Detect browser (order matters - check specific before generic)
    browser = 'Unknown'
    if 'edg/' in ua or 'edge/' in ua:
        browser = 'Microsoft Edge'
    elif 'opr/' in ua or 'opera' in ua:
        browser = 'Opera'
    elif 'brave' in ua:
        browser = 'Brave'
    elif 'vivaldi' in ua:
        browser = 'Vivaldi'
    elif 'firefox' in ua:
        browser = 'Firefox'
    elif 'safari' in ua and 'chrome' not in ua:
        browser = 'Safari'
    elif 'chrome' in ua:
        browser = 'Chrome'
    elif 'msie' in ua or 'trident' in ua:
        browser = 'Internet Explorer'

    # Generate device name
    device_name = f"{browser} on {operating_system}"

    return {
        'browser': browser,
        'operating_system': operating_system,
        'device_type': device_type,
        'device_name': device_name,
    }


def get_client_ip(request) -> Optional[str]:
    """Extract client IP from request."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


class SessionService:
    """
    Service for managing user sessions.
    """

    DEFAULT_SESSION_TTL_DAYS = 30

    def __init__(self, user=None):
        self.user = user

    def create_session(
        self,
        request,
        sso_link=None,
        ttl_days: int = None,
    ) -> Tuple[SSOSession, str]:
        """
        Create a new session for the user.

        Args:
            request: The HTTP request object (for user agent and IP)
            sso_link: Optional SSOUserLink if logging in via SSO
            ttl_days: Session TTL in days (default 30)

        Returns:
            Tuple of (SSOSession, session_id)
        """
        if not self.user:
            raise ValueError("User is required to create a session")

        ttl = ttl_days or self.DEFAULT_SESSION_TTL_DAYS

        # Parse user agent
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        device_info = parse_user_agent(user_agent)

        # Get client IP
        ip_address = get_client_ip(request)

        # Generate session ID
        session_id = SSOSession.generate_session_id()

        # Create session
        session = SSOSession.objects.create(
            user=self.user,
            sso_link=sso_link,
            session_id=session_id,
            device_name=device_info['device_name'],
            device_type=device_info['device_type'],
            browser=device_info['browser'],
            operating_system=device_info['operating_system'],
            ip_address=ip_address,
            expires_at=timezone.now() + timedelta(days=ttl),
        )

        return session, session_id

    def get_user_sessions(self, mark_current: str = None):
        """
        Get all active sessions for the user.

        Args:
            mark_current: Session ID to mark as current

        Returns:
            QuerySet of SSOSession objects with is_current set appropriately
        """
        if not self.user:
            return SSOSession.objects.none()

        sessions = SSOSession.objects.filter(
            user=self.user,
            is_active=True,
            expires_at__gt=timezone.now(),
        ).order_by('-last_activity_at')

        # We'll handle is_current in the resolver since it's request-specific
        return sessions

    def update_session_activity(self, session_id: str) -> Optional[SSOSession]:
        """
        Update the last_activity_at for a session.

        Args:
            session_id: The session ID to update

        Returns:
            The updated session or None if not found
        """
        try:
            session = SSOSession.objects.get(
                session_id=session_id,
                is_active=True,
            )
            # last_activity_at auto-updates on save due to auto_now
            session.save(update_fields=['last_activity_at'])
            return session
        except SSOSession.DoesNotExist:
            return None

    def revoke_session(self, session_id: str, reason: str = 'User requested') -> bool:
        """
        Revoke a specific session.

        Args:
            session_id: The session ID to revoke
            reason: Reason for revocation

        Returns:
            True if session was revoked, False if not found
        """
        if not self.user:
            return False

        try:
            session = SSOSession.objects.get(
                user=self.user,
                session_id=session_id,
                is_active=True,
            )
            session.revoke(reason=reason)
            return True
        except SSOSession.DoesNotExist:
            return False

    def revoke_all_sessions(self, except_session_id: str = None) -> int:
        """
        Revoke all sessions for the user, optionally keeping one.

        Args:
            except_session_id: Session ID to keep (usually current session)

        Returns:
            Number of sessions revoked
        """
        if not self.user:
            return 0

        sessions = SSOSession.objects.filter(
            user=self.user,
            is_active=True,
        )

        if except_session_id:
            sessions = sessions.exclude(session_id=except_session_id)

        count = sessions.count()
        sessions.update(
            is_active=False,
            revoked_at=timezone.now(),
            revoked_reason='User revoked all sessions',
        )

        return count

    @staticmethod
    def cleanup_expired_sessions() -> int:
        """
        Delete expired sessions. Should be run periodically.

        Returns:
            Number of sessions deleted
        """
        expired = SSOSession.objects.filter(
            expires_at__lt=timezone.now(),
        )
        count = expired.count()
        expired.delete()
        return count
