from types import FunctionType
from typing import Iterable, Type, Union, Callable

import channels_graphql_ws
import graphene
from graphene.types import Field
from rest_framework.permissions import BasePermission

from . import types
from . import wrappers

permissions = Iterable[Type[BasePermission]]
resolve_fn_or_object_type = Union[Callable, Type[graphene.ObjectType], Field]


PERMISSION_DENIED_MESSAGE = "permission_denied"


def permission_classes(*perms: types.PermissionsClasses):
    """permission_classes is a decorator for graphene's ObjectType and Mutation classes or for resolver functions.
    It wraps default resolver functions with permission checking function.

    Example usage:

    ```python
    @permission_classes(IsAuthenticatedFullAccess)
    class Query(graphene.ObjectType):
        all_crud_demo_items = graphene.relay.ConnectionField(CrudDemoItemConnection)
        crud_demo_item_by_id = graphene.Field(CrudDemoItemType, id=graphene.String())

        @permission_classes(AnyoneFullAccess)
        def resolve_crud_demo_item_by_id(self, info, id):
            _, pk = from_global_id(id)
            return models.CrudDemoItem.objects.get(pk=pk)

        def resolve_all_crud_demo_items(self, info, **kwargs):
            return models.CrudDemoItem.objects.all()


    @permission_classes(IsAuthenticatedFullAccess)
    class Mutation(graphene.ObjectType):
        create_or_update_crud_demo_item = permission_classes(AnyoneFullAccess)(
            CreateOrUpdateCrudDemoItemMutation.Field()
        )
        delete_crud_demo_item = DeleteCrudDemoItemMutation.Field()
    ```

    Access to `resolve_crud_demo_item_by_id` will be allowed by anyone
    but other Fields/Connections declared in `Query` will be available only for authenticated users.
    """

    def permission_checker(obj: types.Resolver):
        if not perms:
            return obj

        if isinstance(obj, channels_graphql_ws.Subscription):
            raise Exception('permission_checker for channels_graphql_ws.Subscription type is not supported')

        if isinstance(obj, FunctionType):
            return wrappers.wraps_resolver_function(fn=obj, perms=perms)
        elif isinstance(obj, Field):
            return wrappers.wraps_field(obj, perms=perms)
        return wrappers.wraps_object_type(obj, perms=perms)

    return permission_checker
