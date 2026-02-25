"""
Email serializers for backup notifications.
"""

from rest_framework import serializers


class BackupReadyEmailSerializer(serializers.Serializer):
    """Serializer for backup ready email data."""

    tenant_name = serializers.CharField()
    backup_date = serializers.CharField()
    file_size = serializers.IntegerField()
    backup_settings_url = serializers.URLField()
    model_counts = serializers.DictField(allow_empty=True)
