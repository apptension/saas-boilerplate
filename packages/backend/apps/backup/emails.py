"""
Email classes for backup notifications.
"""

from common import emails
from .email_serializers import BackupReadyEmailSerializer


class BackupReadyEmail(emails.Email):
    """Email sent when a backup is ready."""

    name = 'BACKUP_READY'
    serializer_class = BackupReadyEmailSerializer
