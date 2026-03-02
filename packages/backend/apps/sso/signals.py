"""
SSO Signals for event handling and notifications.
"""

import logging
from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver

from .models import (
    TenantSSOConnection,
    UserPasskey,
    SSOAuditLog,
)
from .constants import SSOConnectionStatus, SSOAuditEventType, Notification

logger = logging.getLogger(__name__)


@receiver(post_save, sender=TenantSSOConnection)
def on_sso_connection_saved(sender, instance, created, **kwargs):
    """Handle SSO connection creation/updates."""
    update_fields = kwargs.get('update_fields') or set()

    if created:
        SSOAuditLog.log_event(
            event_type=SSOAuditEventType.IDP_CONFIG_CREATED,
            tenant=instance.tenant,
            sso_connection=instance,
            description=f'SSO connection "{instance.name}" created',
        )
        if instance.status == SSOConnectionStatus.ACTIVE:
            SSOAuditLog.log_event(
                event_type=SSOAuditEventType.IDP_CONFIG_ACTIVATED,
                tenant=instance.tenant,
                sso_connection=instance,
                description=f'SSO connection "{instance.name}" activated',
            )
            _notify_sso_status_change(instance, activated=True)
    # Only log/notify on status change (skip when only updating last_login_at, login_count, etc.)
    elif 'status' in update_fields:
        if instance.status == SSOConnectionStatus.ACTIVE:
            SSOAuditLog.log_event(
                event_type=SSOAuditEventType.IDP_CONFIG_ACTIVATED,
                tenant=instance.tenant,
                sso_connection=instance,
                description=f'SSO connection "{instance.name}" activated',
            )
            _notify_sso_status_change(instance, activated=True)
        elif instance.status == SSOConnectionStatus.INACTIVE:
            SSOAuditLog.log_event(
                event_type=SSOAuditEventType.IDP_CONFIG_DEACTIVATED,
                tenant=instance.tenant,
                sso_connection=instance,
                description=f'SSO connection "{instance.name}" deactivated',
            )
            _notify_sso_status_change(instance, activated=False)


@receiver(pre_delete, sender=TenantSSOConnection)
def on_sso_connection_deleted(sender, instance, **kwargs):
    """Handle SSO connection deletion."""
    SSOAuditLog.log_event(
        event_type=SSOAuditEventType.IDP_CONFIG_DELETED,
        tenant=instance.tenant,
        sso_connection=instance,
        description=f'SSO connection "{instance.name}" deleted',
    )


@receiver(post_save, sender=UserPasskey)
def on_passkey_created(sender, instance, created, **kwargs):
    """Handle passkey registration."""
    if created:
        # Notify user about new passkey
        _notify_passkey_registered(instance)


def _notify_sso_status_change(connection, activated: bool):
    """Send notification about SSO status change."""
    try:
        from apps.notifications import sender

        notification_type = (
            Notification.SSO_CONNECTION_ACTIVATED.value if activated else Notification.SSO_CONNECTION_DEACTIVATED.value
        )

        # Notify tenant owners
        for owner in connection.tenant.owners:
            sender.send_notification(
                user=owner,
                type=notification_type,
                data={
                    "connection_name": connection.name,
                    "connection_type": connection.get_connection_type_display(),
                    "tenant_name": connection.tenant.name,
                },
                issuer=None,
            )
    except Exception as e:
        logger.warning(f"Failed to send SSO notification: {e}")


def _notify_passkey_registered(passkey):
    """Send notification about new passkey registration."""
    try:
        from apps.notifications import sender

        sender.send_notification(
            user=passkey.user,
            type=Notification.PASSKEY_REGISTERED.value,
            data={
                "passkey_name": passkey.name,
                "authenticator_type": passkey.authenticator_type,
            },
            issuer=None,
        )
    except Exception as e:
        logger.warning(f"Failed to send passkey notification: {e}")
