from typing import List

from django.contrib.auth import get_user_model
from graphql.type import GraphQLResolveInfo
from rest_framework import serializers

User = get_user_model()


def get_role_names(user: User) -> List[str]:
    return [group.name for group in user.groups.all()]


def get_user_avatar_url(user: User) -> str:
    field = serializers.FileField(default="")
    return field.to_representation(user.profile.avatar.thumbnail) if user.profile.avatar else None


def get_user_from_resolver(info: GraphQLResolveInfo):
    return info.context.user
