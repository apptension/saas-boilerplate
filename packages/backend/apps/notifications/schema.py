import channels_graphql_ws
import graphene
from apps.users.models import User
from apps.users.services.users import get_user_avatar_url
from channels.db import database_sync_to_async
from common.acl.policies import IsAuthenticatedFullAccess
from common.graphql import mutations
from common.graphql.acl import permission_classes
from graphene import relay
from graphene.types.generic import GenericScalar
from graphene_django import DjangoObjectType
from . import models
from . import serializers
from . import services


class HasUnreadNotificationsMixin:
    has_unread_notifications = graphene.Boolean()

    @staticmethod
    def resolve_has_unread_notifications(parent, info):
        return services.NotificationService.user_has_unread_notifications(user=info.context.user)


class UserType(DjangoObjectType):
    first_name = graphene.String()
    last_name = graphene.String()
    avatar = graphene.String()

    class Meta:
        model = User
        fields = ("id", "email", "first_name", "last_name")

    @staticmethod
    def resolve_first_name(parent, info):
        return parent.profile.first_name

    @staticmethod
    def resolve_last_name(parent, info):
        return parent.profile.last_name

    @staticmethod
    def resolve_avatar(parent, info):
        return get_user_avatar_url(parent)


class NotificationType(DjangoObjectType):
    data = GenericScalar()
    issuer = graphene.Field(UserType)
    user = graphene.Field(UserType)

    class Meta:
        model = models.Notification
        interfaces = (relay.Node,)
        fields = "__all__"

    @staticmethod
    def resolve_issuer(parent, info):
        return parent.issuer

    @staticmethod
    def resolve_user(parent, info):
        return parent.user


class NotificationConnection(graphene.Connection):
    class Meta:
        node = NotificationType


class UpdateNotificationMutation(HasUnreadNotificationsMixin, mutations.UpdateModelMutation):
    class Meta:
        serializer_class = serializers.UpdateNotificationSerializer
        edge_class = NotificationConnection.Edge

    @classmethod
    def get_queryset(cls, model_class: models.Notification, root, info, **input):
        return model_class.objects.filter_by_user(info.context.user)


class MarkReadAllNotificationsMutation(graphene.ClientIDMutation):
    ok = graphene.Boolean()

    @classmethod
    def mutate_and_get_payload(cls, root, info, **kwargs):
        services.NotificationService.mark_read_all_user_notifications(user=info.context.user)
        return MarkReadAllNotificationsMutation(ok=True)


class Query(HasUnreadNotificationsMixin, graphene.ObjectType):
    all_notifications = graphene.relay.ConnectionField(NotificationConnection)

    @staticmethod
    def resolve_all_notifications(root, info, **kwargs):
        return models.Notification.objects.filter_by_user(info.context.user).order_by('-created_at')


class Mutation(graphene.ObjectType):
    update_notification = UpdateNotificationMutation.Field()
    mark_read_all_notifications = MarkReadAllNotificationsMutation.Field()

    @staticmethod
    def resolve_has_unread_notifications(root, info):
        return models.Notification.objects.filter(user=info.context.user, read_at=None).exists()


class NotificationCreatedSubscription(channels_graphql_ws.Subscription):
    """Simple GraphQL subscription."""

    # Leave only latest 64 messages in the server queue.
    notification_queue_limit = 64

    notification = graphene.Field(NotificationType)

    @staticmethod
    def subscribe(root, info):
        return [str(info.context.channels_scope['user'].id)]

    @staticmethod
    @database_sync_to_async
    def get_response(id: str):
        notification = models.Notification.objects.prefetch_related(
            'issuer', 'issuer__profile', 'issuer__profile__avatar'
        ).get(id=id)
        return NotificationCreatedSubscription(notification)

    @staticmethod
    async def publish(payload, info):
        return await NotificationCreatedSubscription.get_response(id=payload['id'])


@permission_classes(IsAuthenticatedFullAccess)
class Subscription(graphene.ObjectType):
    notification_created = NotificationCreatedSubscription.Field()
