import functools
import threading
from typing import Type, Callable

import graphene
from graphene.relay.node import NodeField
from graphene.types import Field
from rest_framework.request import Request
from rest_framework.exceptions import PermissionDenied

from . import types


PERMISSION_DENIED_MESSAGE = "permission_denied"
__wrapped_fns = threading.local()
__wrapped_fns.value = set()
__wrapped_field_names = threading.local()
__wrapped_field_names.value = set()


def check_permissions(perms: types.PermissionsClasses, request: Request, root):
    for permission_class in perms:
        permission = permission_class()
        if not permission.has_permission(request=request, view=root):
            raise PermissionDenied(PERMISSION_DENIED_MESSAGE)


def wraps_resolver_function(fn: Callable, perms: types.PermissionsClasses, node_resolver: bool = False) -> Callable:
    # Avoid wrapping function twice
    if fn in __wrapped_fns.value:
        return fn

    if node_resolver:

        @functools.wraps(fn)
        def wrapped(only_type, root, info, id):
            check_permissions(perms=perms, request=info.context, root=root)
            return fn(only_type, root, info, id)

    else:

        @functools.wraps(fn)
        def wrapped(root, info, *args, **kwargs):
            check_permissions(perms=perms, request=info.context, root=root)
            return fn(root, info, *args, **kwargs)

    __wrapped_fns.value.add(wrapped)
    return wrapped


def wraps_field(field: Field, perms: types.PermissionsClasses, parent_resolver=None) -> Field:
    resolver = parent_resolver or field.resolver
    if resolver:
        field.resolver = wraps_resolver_function(fn=resolver, perms=perms)
    elif type(field) == NodeField:
        field.node_type.node_resolver = wraps_resolver_function(
            fn=field.node_type.node_resolver, perms=perms, node_resolver=True
        )
    return field


def wraps_object_type(obj: Type[graphene.ObjectType], perms: types.PermissionsClasses) -> Type[graphene.ObjectType]:
    for field_name, field in obj._meta.fields.items():
        parent_resolver = getattr(obj, f"resolve_{field_name}", None)
        # for overwriting mutation's fields
        if field in __wrapped_field_names.value:
            continue
        wraps_field(field=field, perms=perms, parent_resolver=parent_resolver)
        __wrapped_field_names.value.add(field)
    return obj
