from typing import Iterable, Type, Union, Callable

import graphene
from graphene.types import Field
from rest_framework.permissions import BasePermission

PermissionsClasses = Iterable[Type[BasePermission]]
Resolver = Union[Callable, Type[graphene.ObjectType], Field]
