from typing import List

import graphql.execution.base
from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


def get_role_names(user: User) -> List[str]:
    return [group.name for group in user.groups.all()]


def get_user_avatar_url(user: User) -> str:
    field = serializers.FileField(default="")
    return field.to_representation(user.profile.avatar.thumbnail)


def get_user_from_resolver(info: graphql.execution.base.ResolveInfo):
    return info.context.user
