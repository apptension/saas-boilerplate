from functools import wraps
from types import FunctionType
from typing import Iterable, Type, Union, Callable, List

import channels_graphql_ws
import graphene
from graphene.types import Field
from graphql import GraphQLError
from rest_framework.permissions import BasePermission

from . import types
from . import wrappers
from apps.multitenancy.models import user_has_permission

permissions = Iterable[Type[BasePermission]]
resolve_fn_or_object_type = Union[Callable, Type[graphene.ObjectType], Field]


PERMISSION_DENIED_MESSAGE = "permission_denied"
PERMISSION_REQUIRED_MESSAGE = "You do not have permission to perform this action."


class RBACPermission(BasePermission):
    """
    Dynamic permission class that checks RBAC permission codes.

    This is used internally by permission_classes when string permission codes are passed.
    """

    def __init__(self, permission_codes: List[str], mode: str = "any"):
        self.permission_codes = permission_codes
        self.mode = mode

    def has_permission(self, request, view) -> bool:
        user = getattr(request, "user", None)
        tenant = getattr(request, "tenant", None)

        if not user or not user.is_authenticated:
            return False

        if not tenant:
            # No tenant context - allow (other policies should handle this)
            return True

        if self.mode == "all":
            return all(user_has_permission(user, tenant, perm) for perm in self.permission_codes)
        else:  # 'any' mode (default)
            return any(user_has_permission(user, tenant, perm) for perm in self.permission_codes)


def requires(*permission_codes: str, mode: str = "any") -> Type[BasePermission]:
    """
    Factory function to create an RBAC permission class from permission codes.

    This can be used with permission_classes for explicit permission requirements.

    Args:
        *permission_codes: One or more permission codes (e.g., 'members.view', 'org.settings.edit')
        mode: 'any' (default) - user needs at least one permission
              'all' - user needs all permissions

    Example usage:
        @permission_classes(requires('members.view'))
        def resolve_members(root, info):
            ...

        @permission_classes(requires('members.view', 'members.invite', mode='all'))
        def resolve_something(root, info):
            ...
    """
    codes = list(permission_codes)

    class DynamicRBACPermission(BasePermission):
        def has_permission(self, request, view) -> bool:
            user = getattr(request, "user", None)
            tenant = getattr(request, "tenant", None)

            if not user or not user.is_authenticated:
                return False

            if not tenant:
                return True

            if mode == "all":
                return all(user_has_permission(user, tenant, perm) for perm in codes)
            return any(user_has_permission(user, tenant, perm) for perm in codes)

    return DynamicRBACPermission


def _normalize_permissions(perms) -> List[Type[BasePermission]]:
    """
    Normalize permission arguments to a list of permission classes.

    Handles:
    - Traditional permission classes (pass through)
    - String permission codes (convert to RBACPermission)
    - Lists/tuples of permission codes (convert to single RBACPermission with OR logic)
    """
    normalized = []
    permission_codes = []

    for perm in perms:
        if isinstance(perm, str):
            # Single permission code string
            permission_codes.append(perm)
        elif isinstance(perm, (list, tuple)) and all(isinstance(p, str) for p in perm):
            # List/tuple of permission codes - treat as OR group
            permission_codes.extend(perm)
        elif isinstance(perm, type) and issubclass(perm, BasePermission):
            # Traditional permission class
            normalized.append(perm)
        else:
            # Assume it's a permission class instance or unknown type
            normalized.append(perm)

    # If we collected any permission codes, create a single RBACPermission class
    if permission_codes:
        normalized.append(requires(*permission_codes))

    return normalized


def permission_classes(*perms: types.PermissionsClasses):
    """
    Decorator for graphene's ObjectType and Mutation classes or resolver functions.

    Now supports both traditional permission classes AND RBAC permission codes!

    Example usage:

    ```python
    # Traditional permission class (still works)
    @permission_classes(IsAuthenticatedFullAccess)
    class Query(graphene.ObjectType):
        ...

    # NEW: Single permission code
    @permission_classes('members.view')
    def resolve_members(root, info):
        ...

    # NEW: Multiple permission codes (OR logic - user needs any one)
    @permission_classes('members.view', 'members.invite')
    def resolve_something(root, info):
        ...

    # NEW: Using requires() for explicit AND logic
    @permission_classes(requires('members.view', 'members.invite', mode='all'))
    def resolve_something_else(root, info):
        ...

    # NEW: Mix traditional classes with permission codes
    @permission_classes(IsAuthenticatedFullAccess, 'members.view')
    def resolve_mixed(root, info):
        ...
    ```
    """
    # Normalize permissions to handle both classes and string codes
    normalized_perms = _normalize_permissions(perms)

    def permission_checker(obj: types.Resolver):
        if not normalized_perms:
            return obj

        if isinstance(obj, channels_graphql_ws.Subscription):
            raise Exception("permission_checker for channels_graphql_ws.Subscription type is not supported")

        if isinstance(obj, FunctionType):
            return wrappers.wraps_resolver_function(fn=obj, perms=normalized_perms)
        elif isinstance(obj, Field):
            return wrappers.wraps_field(obj, perms=normalized_perms)
        return wrappers.wraps_object_type(obj, perms=normalized_perms)

    return permission_checker


def permission_required(permission_code: Union[str, List[str]], mode: str = "any"):
    """
    Decorator to check if the user has the required permission(s) for the tenant context.

    NOTE: Consider using the unified @permission_classes() decorator instead, which now
    supports RBAC permission codes directly:

        @permission_classes('features.crud.manage')  # Single permission
        @permission_classes('members.view', 'members.invite')  # Multiple (OR logic)
        @permission_classes(requires('members.view', 'members.invite', mode='all'))  # AND logic

    This decorator is kept for backward compatibility and cases where you need
    standalone permission checking without other access policies.

    Args:
        permission_code: Single permission code (string) or list of permission codes
        mode: 'any' (default) - user needs at least one permission
              'all' - user needs all permissions

    Example usage:

    ```python
    @permission_classes(IsTenantMemberAccess)
    @permission_required('features.crud.manage')
    def resolve_something(root, info, **kwargs):
        ...

    @permission_required(['management.clients.view', 'management.projects.view'], mode='any')
    class SomeMutation(mutations.CreateModelMutation):
        ...
    ```
    """
    permissions_list = [permission_code] if isinstance(permission_code, str) else permission_code

    def decorator(obj):
        if isinstance(obj, FunctionType):

            @wraps(obj)
            def wrapper(root, info, *args, **kwargs):
                user = info.context.user
                tenant = getattr(info.context, "tenant", None)

                if not user or not user.is_authenticated:
                    raise GraphQLError(PERMISSION_REQUIRED_MESSAGE)

                if not tenant:
                    # If no tenant context, check if user has permission in any of their tenants
                    # For now, allow access (the access policy should handle tenant access)
                    return obj(root, info, *args, **kwargs)

                # Check permissions
                if mode == "all":
                    has_permission = all(user_has_permission(user.id, tenant.pk, perm) for perm in permissions_list)
                else:  # 'any' mode
                    has_permission = any(user_has_permission(user.id, tenant.pk, perm) for perm in permissions_list)

                if not has_permission:
                    raise GraphQLError(PERMISSION_REQUIRED_MESSAGE)

                return obj(root, info, *args, **kwargs)

            return wrapper

        elif isinstance(obj, type) and issubclass(obj, graphene.Mutation):
            # For Mutation classes, wrap the mutate_and_get_payload method
            original_mutate = getattr(obj, "mutate_and_get_payload", None)
            if original_mutate:

                @classmethod
                @wraps(original_mutate.__func__)
                def wrapped_mutate(cls, root, info, *args, **kwargs):
                    user = info.context.user
                    tenant = getattr(info.context, "tenant", None)

                    if not user or not user.is_authenticated:
                        raise GraphQLError(PERMISSION_REQUIRED_MESSAGE)

                    if tenant:
                        # Check permissions
                        if mode == "all":
                            has_permission = all(
                                user_has_permission(user.id, tenant.pk, perm) for perm in permissions_list
                            )
                        else:  # 'any' mode
                            has_permission = any(
                                user_has_permission(user.id, tenant.pk, perm) for perm in permissions_list
                            )

                        if not has_permission:
                            raise GraphQLError(PERMISSION_REQUIRED_MESSAGE)

                    return original_mutate(root, info, *args, **kwargs)

                obj.mutate_and_get_payload = wrapped_mutate
            return obj

        else:
            # For other types (ObjectType classes), wrap all resolvers
            return obj

    return decorator
