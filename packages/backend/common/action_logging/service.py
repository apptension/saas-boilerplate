"""
Action Logging Service.

Provides utilities for logging user and system actions with full audit trail,
including field-level change tracking (old/new values).
"""

import logging
from datetime import date, datetime
from decimal import Decimal
from typing import Any, Dict, List, Optional, Union

from django.db import models
from django.conf import settings

# Lazy import to avoid circular imports
ActionLog = None


def get_action_log_model():
    """Get ActionLog model lazily to avoid circular imports."""
    global ActionLog
    if ActionLog is None:
        from apps.multitenancy.models import ActionLog as AL

        ActionLog = AL
    return ActionLog


logger = logging.getLogger(__name__)


def serialize_value(value: Any) -> Any:
    """
    Serialize a value for JSON storage.
    Handles Django model fields, Decimal, date, datetime, etc.
    """
    if value is None:
        return None

    if isinstance(value, Decimal):
        return str(value)

    if isinstance(value, (date, datetime)):
        return value.isoformat()

    if isinstance(value, models.Model):
        # For ForeignKey relations, store the ID and string representation
        return {
            'id': str(value.pk),
            'display': str(value),
        }

    if isinstance(value, (list, tuple)):
        return [serialize_value(v) for v in value]

    if isinstance(value, dict):
        return {k: serialize_value(v) for k, v in value.items()}

    # For enum/choice fields, try to get the display value
    if hasattr(value, 'label'):
        return str(value.label)

    return value


def compute_changes(
    old_instance: Optional[models.Model],
    new_instance: models.Model,
    fields_to_track: Optional[List[str]] = None,
    exclude_fields: Optional[List[str]] = None,
) -> Dict[str, Dict[str, Any]]:
    """
    Compute field-level changes between old and new model instances.

    Args:
        old_instance: The instance before changes (None for CREATE)
        new_instance: The instance after changes
        fields_to_track: Optional list of field names to track. If None, tracks all fields.
        exclude_fields: Optional list of field names to exclude from tracking.

    Returns:
        Dictionary of changes: {field_name: {old: value, new: value}}
    """
    changes = {}

    # Default fields to exclude (timestamps, internal fields)
    default_exclude = {'created_at', 'updated_at', 'id', 'pk', 'tenant', 'tenant_id'}
    exclude_set = default_exclude.union(set(exclude_fields or []))

    # Get model fields
    model_fields = new_instance._meta.get_fields()

    for field in model_fields:
        # Skip reverse relations and many-to-many
        if field.is_relation and (field.one_to_many or field.many_to_many):
            continue

        field_name = field.name

        # Skip excluded fields
        if field_name in exclude_set:
            continue

        # If specific fields are requested, only track those
        if fields_to_track and field_name not in fields_to_track:
            continue

        try:
            new_value = getattr(new_instance, field_name, None)
            old_value = getattr(old_instance, field_name, None) if old_instance else None

            # Serialize values for comparison and storage
            new_serialized = serialize_value(new_value)
            old_serialized = serialize_value(old_value)

            # Only record if values differ
            if old_serialized != new_serialized:
                changes[field_name] = {
                    'old': old_serialized,
                    'new': new_serialized,
                }
        except Exception as e:
            logger.warning(f"Error computing change for field {field_name}: {e}")
            continue

    return changes


def is_logging_enabled(tenant_id: Union[str, int]) -> bool:
    """
    Check if action logging is enabled for the given tenant.

    Args:
        tenant_id: The tenant ID to check

    Returns:
        True if logging is enabled, False otherwise
    """
    from apps.multitenancy.models import Tenant

    try:
        tenant = Tenant.objects.filter(pk=tenant_id).first()
        return tenant.action_logging_enabled if tenant else False
    except Exception as e:
        logger.warning(f"Error checking logging status for tenant {tenant_id}: {e}")
        return False


def log_action(
    *,
    tenant_id: Union[str, int],
    action_type: str,
    entity_type: str,
    entity_id: str,
    entity_name: str = '',
    actor_user: Optional[settings.AUTH_USER_MODEL] = None,
    actor_type: str = 'USER',
    changes: Optional[Dict[str, Dict[str, Any]]] = None,
    metadata: Optional[Dict[str, Any]] = None,
    force_log: bool = False,
) -> Optional[models.Model]:
    """
    Log an action to the ActionLog table.

    Args:
        tenant_id: The tenant ID
        action_type: Type of action (CREATE, UPDATE, DELETE, etc.)
        entity_type: Type of entity affected (client, project, etc.)
        entity_id: ID of the affected entity
        entity_name: Human-readable name of the entity
        actor_user: User who performed the action (None for system actions)
        actor_type: Type of actor (USER, SYSTEM:sync, etc.)
        changes: Dictionary of field-level changes
        metadata: Additional context information
        force_log: If True, log even if logging is disabled for tenant

    Returns:
        ActionLog instance if logged, None otherwise
    """
    from apps.multitenancy.models import ActionLog

    # Check if logging is enabled (unless force_log is True)
    if not force_log and not is_logging_enabled(tenant_id):
        return None

    try:
        from apps.multitenancy.constants import ActionActorType

        actor_email = ''
        if actor_user and hasattr(actor_user, 'email'):
            actor_email = actor_user.email

        # Store actor_user for USER and AI_AGENT actions (the user who triggered the action)
        # For SYSTEM actions (sync, import, scheduled, migration), actor_user is typically None
        should_store_user = actor_type in (ActionActorType.USER, ActionActorType.AI_AGENT, 'USER', 'AI_AGENT')

        action_log = ActionLog.objects.create(
            tenant_id=tenant_id,
            action_type=action_type,
            entity_type=entity_type,
            entity_id=str(entity_id),
            entity_name=entity_name or '',
            actor_type=actor_type,
            actor_user=actor_user if should_store_user else None,
            actor_email=actor_email,
            changes=changes or {},
            metadata=metadata or {},
        )

        logger.debug(f"Action logged: {action_type} {entity_type} '{entity_name}' " f"by {actor_email or actor_type}")

        return action_log

    except Exception as e:
        logger.error(f"Failed to log action: {e}")
        return None


def log_create(
    *,
    tenant_id: Union[str, int],
    entity_type: str,
    instance: models.Model,
    actor_user: Optional[settings.AUTH_USER_MODEL] = None,
    actor_type: str = 'USER',
    metadata: Optional[Dict[str, Any]] = None,
    name_field: Optional[str] = 'name',
) -> Optional[models.Model]:
    """
    Convenience function to log a CREATE action.

    Args:
        tenant_id: The tenant ID
        entity_type: Type of entity created
        instance: The created model instance
        actor_user: User who performed the action
        actor_type: Type of actor
        metadata: Additional context
        name_field: Field name to use for entity_name (default: 'name'), or None to use str(instance)

    Returns:
        ActionLog instance if logged, None otherwise
    """
    from apps.multitenancy.constants import ActionType

    entity_name = (getattr(instance, name_field, '') if name_field else '') or str(instance)

    # For CREATE, all fields are "new" values
    changes = compute_changes(None, instance)

    return log_action(
        tenant_id=tenant_id,
        action_type=ActionType.CREATE,
        entity_type=entity_type,
        entity_id=str(instance.pk),
        entity_name=entity_name,
        actor_user=actor_user,
        actor_type=actor_type,
        changes=changes,
        metadata=metadata,
    )


def log_update(
    *,
    tenant_id: Union[str, int],
    entity_type: str,
    old_instance: models.Model,
    new_instance: models.Model,
    actor_user: Optional[settings.AUTH_USER_MODEL] = None,
    actor_type: str = 'USER',
    metadata: Optional[Dict[str, Any]] = None,
    name_field: str = 'name',
    fields_to_track: Optional[List[str]] = None,
) -> Optional[models.Model]:
    """
    Convenience function to log an UPDATE action.

    Args:
        tenant_id: The tenant ID
        entity_type: Type of entity updated
        old_instance: Instance before update
        new_instance: Instance after update
        actor_user: User who performed the action
        actor_type: Type of actor
        metadata: Additional context
        name_field: Field name to use for entity_name
        fields_to_track: Optional list of fields to track

    Returns:
        ActionLog instance if logged, None otherwise
    """
    from apps.multitenancy.constants import ActionType

    entity_name = getattr(new_instance, name_field, '') or str(new_instance)
    changes = compute_changes(old_instance, new_instance, fields_to_track=fields_to_track)

    # Don't log if there are no actual changes
    if not changes:
        return None

    return log_action(
        tenant_id=tenant_id,
        action_type=ActionType.UPDATE,
        entity_type=entity_type,
        entity_id=str(new_instance.pk),
        entity_name=entity_name,
        actor_user=actor_user,
        actor_type=actor_type,
        changes=changes,
        metadata=metadata,
    )


def log_delete(
    *,
    tenant_id: Union[str, int],
    entity_type: str,
    instance: models.Model,
    actor_user: Optional[settings.AUTH_USER_MODEL] = None,
    actor_type: str = 'USER',
    metadata: Optional[Dict[str, Any]] = None,
    name_field: Optional[str] = 'name',
) -> Optional[models.Model]:
    """
    Convenience function to log a DELETE action.

    Args:
        tenant_id: The tenant ID
        entity_type: Type of entity deleted
        instance: The instance being deleted
        actor_user: User who performed the action
        actor_type: Type of actor
        metadata: Additional context
        name_field: Field name to use for entity_name (default: 'name'), or None to use str(instance)

    Returns:
        ActionLog instance if logged, None otherwise
    """
    from apps.multitenancy.constants import ActionType

    entity_name = (getattr(instance, name_field, '') if name_field else '') or str(instance)

    # For DELETE, capture all current values as "old" values
    changes = {}
    for field in instance._meta.get_fields():
        if field.is_relation and (field.one_to_many or field.many_to_many):
            continue
        if field.name in {'created_at', 'updated_at', 'id', 'pk', 'tenant', 'tenant_id'}:
            continue
        try:
            value = getattr(instance, field.name, None)
            serialized = serialize_value(value)
            if serialized is not None:
                changes[field.name] = {
                    'old': serialized,
                    'new': None,
                }
        except Exception:
            continue

    return log_action(
        tenant_id=tenant_id,
        action_type=ActionType.DELETE,
        entity_type=entity_type,
        entity_id=str(instance.pk),
        entity_name=entity_name,
        actor_user=actor_user,
        actor_type=actor_type,
        changes=changes,
        metadata=metadata,
    )


def log_settings_change(
    *,
    tenant_id: Union[str, int],
    old_settings: models.Model,
    new_settings: models.Model,
    actor_user: Optional[settings.AUTH_USER_MODEL] = None,
    actor_type: str = 'USER',
    settings_name: str = 'Organization Settings',
    metadata: Optional[Dict[str, Any]] = None,
) -> Optional[models.Model]:
    """
    Log changes to settings.

    Args:
        tenant_id: The tenant ID
        old_settings: Settings before change
        new_settings: Settings after change
        actor_user: User who made the change
        actor_type: Type of actor (USER, AI_AGENT, etc.)
        settings_name: Display name for the settings
        metadata: Additional context

    Returns:
        ActionLog instance if logged, None otherwise
    """
    from apps.multitenancy.constants import ActionType

    changes = compute_changes(old_settings, new_settings)

    if not changes:
        return None

    return log_action(
        tenant_id=tenant_id,
        action_type=ActionType.SETTINGS_CHANGE,
        entity_type='settings',
        entity_id=str(new_settings.pk),
        entity_name=settings_name,
        actor_user=actor_user,
        actor_type=actor_type,
        changes=changes,
        metadata=metadata,
    )


def log_import(
    *,
    tenant_id: Union[str, int],
    entity_type: str,
    imported_count: int,
    updated_count: int = 0,
    skipped_count: int = 0,
    error_count: int = 0,
    actor_user: Optional[settings.AUTH_USER_MODEL] = None,
    import_session_id: Optional[str] = None,
    file_name: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> Optional[models.Model]:
    """
    Log an import operation.

    Args:
        tenant_id: The tenant ID
        entity_type: Type of entities imported
        imported_count: Number of records imported
        updated_count: Number of records updated
        skipped_count: Number of records skipped
        error_count: Number of errors
        actor_user: User who triggered the import
        import_session_id: Session ID for tracking
        file_name: Name of imported file
        metadata: Additional context

    Returns:
        ActionLog instance if logged, None otherwise
    """
    from apps.multitenancy.constants import ActionType, ActionActorType

    import_metadata = {
        'imported_count': imported_count,
        'updated_count': updated_count,
        'skipped_count': skipped_count,
        'error_count': error_count,
        **(metadata or {}),
    }

    if import_session_id:
        import_metadata['session_id'] = import_session_id
    if file_name:
        import_metadata['file_name'] = file_name

    return log_action(
        tenant_id=tenant_id,
        action_type=ActionType.IMPORT,
        entity_type=entity_type,
        entity_id=import_session_id or 'bulk',
        entity_name=f"Import: {file_name or entity_type}",
        actor_user=actor_user,
        actor_type=ActionActorType.SYSTEM_IMPORT if not actor_user else 'USER',
        changes={
            'summary': {
                'old': None,
                'new': {
                    'imported': imported_count,
                    'updated': updated_count,
                    'skipped': skipped_count,
                    'errors': error_count,
                },
            },
        },
        metadata=import_metadata,
    )


def log_bulk_delete(
    *,
    tenant_id: Union[str, int],
    entity_type: str,
    deleted_count: int,
    actor_user: Optional[settings.AUTH_USER_MODEL] = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> Optional[models.Model]:
    """
    Log a bulk delete operation.

    Args:
        tenant_id: The tenant ID
        entity_type: Type of entities deleted
        deleted_count: Number of records deleted
        actor_user: User who performed the deletion
        metadata: Additional context

    Returns:
        ActionLog instance if logged, None otherwise
    """
    from apps.multitenancy.constants import ActionType

    return log_action(
        tenant_id=tenant_id,
        action_type=ActionType.BULK_DELETE,
        entity_type=entity_type,
        entity_id='bulk',
        entity_name=f"Bulk Delete: {deleted_count} {entity_type}(s)",
        actor_user=actor_user,
        actor_type='USER',
        changes={
            'deleted_count': {
                'old': None,
                'new': deleted_count,
            },
        },
        metadata=metadata or {},
    )
