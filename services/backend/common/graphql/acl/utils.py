import importlib
from typing import Iterable, Type

from django.conf import settings
from rest_framework.permissions import BasePermission


def get_default_permission_classes() -> Iterable[Type[BasePermission]]:
    permission_classes = []
    for perm_import_path in settings.GRAPHENE["DEFAULT_PERMISSION_CLASSES"]:
        module_name, package = perm_import_path.rsplit(".", maxsplit=1)
        permission_classes.append(getattr(importlib.import_module(module_name), package))
    return permission_classes
