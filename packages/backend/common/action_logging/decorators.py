"""
Decorators for action logging on GraphQL mutations.

Provides the @action_logged decorator for automatic action logging on mutations.
"""

import functools
import logging
from typing import Callable, Optional, Type

from graphql_relay import from_global_id

logger = logging.getLogger(__name__)


def action_logged(
    entity_type: str,
    action_type: str,
    name_field: str = 'name',
    get_tenant_id: Optional[Callable] = None,
    get_entity_name: Optional[Callable] = None,
):
    """
    Decorator for GraphQL mutations to automatically log actions.

    Works with CreateTenantDependentModelMutation, UpdateTenantDependentModelMutation,
    DeleteTenantDependentModelMutation, and custom mutations.

    Args:
        entity_type: The type of entity being modified (e.g., 'client', 'project')
        action_type: The type of action (CREATE, UPDATE, DELETE, etc.)
        name_field: Field name to use for entity_name (default: 'name')
        get_tenant_id: Optional callable to extract tenant_id from input
        get_entity_name: Optional callable to get entity name from instance

    Example usage:
        @action_logged(entity_type='project', action_type='CREATE')
        class CreateProjectMutation(mutations.CreateTenantDependentModelMutation):
            class Meta:
                serializer_class = serializers.ProjectSerializer
    """

    def decorator(cls: Type):
        original_mutate = getattr(cls, 'mutate_and_get_payload', None) or getattr(cls, 'mutate', None)

        if original_mutate is None:
            logger.warning(f"No mutate method found on {cls.__name__}, skipping action logging")
            return cls

        # Determine which method to wrap
        method_name = 'mutate_and_get_payload' if hasattr(cls, 'mutate_and_get_payload') else 'mutate'

        @classmethod
        @functools.wraps(original_mutate.__func__ if hasattr(original_mutate, '__func__') else original_mutate)
        def wrapped_mutate(cls_inner, root, info, **input_data):
            from .service import (
                log_create,
                log_update,
                log_delete,
                is_logging_enabled,
            )
            from apps.multitenancy.constants import ActionType, ActionActorType

            # Extract tenant_id
            tenant_id = None
            if get_tenant_id:
                tenant_id = get_tenant_id(input_data)
            elif 'tenant_id' in input_data:
                raw_tenant_id = input_data.get('tenant_id')
                if raw_tenant_id:
                    try:
                        _, tenant_id = from_global_id(raw_tenant_id)
                    except Exception:
                        tenant_id = raw_tenant_id

            # Early exit if logging is not enabled
            if tenant_id and not is_logging_enabled(tenant_id):
                return original_mutate.__func__(cls_inner, root, info, **input_data)

            # Get user from context
            user = getattr(info.context, 'user', None)
            if user and not user.is_authenticated:
                user = None

            # Determine actor type - check if this is an AI Agent request
            is_ai_agent = getattr(info.context, 'is_ai_agent_request', False)
            actor_type = ActionActorType.AI_AGENT if is_ai_agent else ActionActorType.USER

            # For UPDATE and DELETE, capture old state
            old_instance = None
            if action_type in (ActionType.UPDATE, ActionType.DELETE):
                old_instance = _get_old_instance(cls_inner, info, input_data)

            # Execute the original mutation
            result = original_mutate.__func__(cls_inner, root, info, **input_data)

            # Skip logging if tenant_id couldn't be determined
            if not tenant_id:
                return result

            # Get the new instance from the result
            new_instance = _extract_instance_from_result(result, cls_inner)

            # Log the action
            try:
                if action_type == ActionType.CREATE and new_instance:
                    log_create(
                        tenant_id=tenant_id,
                        entity_type=entity_type,
                        instance=new_instance,
                        actor_user=user,
                        actor_type=actor_type,
                        name_field=name_field,
                    )

                elif action_type == ActionType.UPDATE and new_instance:
                    if old_instance:
                        log_update(
                            tenant_id=tenant_id,
                            entity_type=entity_type,
                            old_instance=old_instance,
                            new_instance=new_instance,
                            actor_user=user,
                            actor_type=actor_type,
                            name_field=name_field,
                        )

                elif action_type == ActionType.DELETE and old_instance:
                    log_delete(
                        tenant_id=tenant_id,
                        entity_type=entity_type,
                        instance=old_instance,
                        actor_user=user,
                        actor_type=actor_type,
                        name_field=name_field,
                    )

                elif action_type == ActionType.SETTINGS_CHANGE and old_instance and new_instance:
                    from .service import log_settings_change

                    log_settings_change(
                        tenant_id=tenant_id,
                        old_settings=old_instance,
                        new_settings=new_instance,
                        actor_user=user,
                        actor_type=actor_type,
                    )

            except Exception as e:
                logger.error(f"Failed to log action for {cls_inner.__name__}: {e}")

            return result

        # Set the wrapped method on the class
        setattr(cls, method_name, wrapped_mutate)

        return cls

    return decorator


def _get_old_instance(cls, info, input_data):
    """
    Get the instance before mutation for UPDATE/DELETE operations.
    """
    try:
        # Try to get the model class from the mutation's Meta
        model_class = None
        if hasattr(cls, '_meta'):
            model_class = getattr(cls._meta, 'model_class', None) or getattr(cls._meta, 'model', None)

        if not model_class and hasattr(cls, 'Meta'):
            meta = cls.Meta
            serializer_class = getattr(meta, 'serializer_class', None)
            if serializer_class and hasattr(serializer_class, 'Meta'):
                model_class = getattr(serializer_class.Meta, 'model', None)
            if not model_class:
                model_class = getattr(meta, 'model', None)

        if not model_class:
            return None

        # Get the instance ID
        instance_id = input_data.get('id')
        if not instance_id:
            return None

        # Decode global ID if necessary
        try:
            _, pk = from_global_id(instance_id)
        except Exception:
            pk = instance_id

        # Fetch the instance
        instance = model_class.objects.filter(pk=pk).first()

        if instance:
            # Create a deep copy to preserve old values
            # We need to copy the field values, not the instance itself
            old_instance = model_class()
            for field in instance._meta.get_fields():
                if field.is_relation and (field.one_to_many or field.many_to_many):
                    continue
                try:
                    value = getattr(instance, field.name, None)
                    setattr(old_instance, field.name, value)
                except Exception as e:
                    logger.debug(f"Failed to copy field {field.name} to old_instance: {e}")
                    continue
            old_instance.pk = instance.pk
            return old_instance

        return None

    except Exception as e:
        logger.warning(f"Could not get old instance: {e}")
        return None


def _extract_instance_from_result(result, cls):
    """
    Extract the model instance from a mutation result.
    """
    if result is None:
        return None

    # Try common attribute names for the returned instance
    model_class = None
    if hasattr(cls, '_meta'):
        model_class = getattr(cls._meta, 'model_class', None) or getattr(cls._meta, 'model', None)

    if not model_class and hasattr(cls, 'Meta'):
        meta = cls.Meta
        serializer_class = getattr(meta, 'serializer_class', None)
        if serializer_class and hasattr(serializer_class, 'Meta'):
            model_class = getattr(serializer_class.Meta, 'model', None)
        if not model_class:
            model_class = getattr(meta, 'model', None)

    if model_class:
        model_name = model_class.__name__
        # Try lowercase model name
        attr_name = model_name[0].lower() + model_name[1:]
        if hasattr(result, attr_name):
            return getattr(result, attr_name)

        # Try snake_case
        import re

        snake_name = re.sub(r'(?<!^)(?=[A-Z])', '_', model_name).lower()
        if hasattr(result, snake_name):
            return getattr(result, snake_name)

    # Try common attribute names
    for attr in ['instance', 'object', 'obj', 'item', 'node']:
        if hasattr(result, attr):
            return getattr(result, attr)

    # Check for edge attribute (for mutations returning edges)
    if hasattr(result, '_meta') and hasattr(result._meta, 'return_field_name'):
        return_field = result._meta.return_field_name
        if hasattr(result, return_field):
            return getattr(result, return_field)

    return None


def _get_entity_name(instance, name_field: str, get_entity_name: Optional[Callable]) -> str:
    """
    Get the entity name for logging.
    """
    if get_entity_name:
        try:
            return get_entity_name(instance)
        except Exception:
            pass

    if hasattr(instance, name_field):
        name = getattr(instance, name_field, None)
        if name:
            return str(name)

    # Try common name fields
    for field in ['name', 'full_name', 'title', 'label', 'code']:
        if hasattr(instance, field):
            value = getattr(instance, field, None)
            if value:
                return str(value)

    return str(instance)


def log_mutation_action(
    info,
    tenant_id,
    action_type: str,
    entity_type: str,
    entity_id: str,
    entity_name: str = '',
    changes: dict = None,
    metadata: dict = None,
):
    """
    Helper function to manually log an action from within a mutation.

    Use this for custom mutations that don't fit the standard CRUD pattern.
    Automatically detects if the request is from an AI Agent (MCP server).

    Args:
        info: GraphQL info object
        tenant_id: The tenant ID (can be global ID or raw ID)
        action_type: Type of action
        entity_type: Type of entity
        entity_id: ID of the entity
        entity_name: Human-readable name
        changes: Dictionary of changes
        metadata: Additional context

    Returns:
        ActionLog instance if logged, None otherwise
    """
    from .service import log_action, is_logging_enabled
    from apps.multitenancy.constants import ActionActorType

    # Decode tenant_id if it's a global ID
    try:
        _, decoded_tenant_id = from_global_id(tenant_id)
    except Exception:
        decoded_tenant_id = tenant_id

    if not is_logging_enabled(decoded_tenant_id):
        return None

    # Get user from context
    user = getattr(info.context, 'user', None)
    if user and not user.is_authenticated:
        user = None

    # Determine actor type - check if this is an AI Agent request
    is_ai_agent = getattr(info.context, 'is_ai_agent_request', False)
    actor_type = ActionActorType.AI_AGENT if is_ai_agent else ActionActorType.USER

    return log_action(
        tenant_id=decoded_tenant_id,
        action_type=action_type,
        entity_type=entity_type,
        entity_id=str(entity_id),
        entity_name=entity_name,
        actor_user=user,
        actor_type=actor_type,
        changes=changes or {},
        metadata=metadata or {},
    )
