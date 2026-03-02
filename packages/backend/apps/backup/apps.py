"""
Django app configuration for the backup system.
"""

from django.apps import AppConfig


class BackupConfig(AppConfig):
    """App configuration for the backup system."""

    name = 'apps.backup'
    verbose_name = 'Backup System'

    def ready(self):
        """Initialize the backup system when Django is ready."""
        # Auto-discover models for backup
        from .registry import BackupModelRegistry

        BackupModelRegistry.auto_discover_all()
