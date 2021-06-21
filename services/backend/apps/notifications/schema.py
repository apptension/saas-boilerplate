import graphene
from graphene import relay
from graphene.types.generic import GenericScalar
from graphene_django import DjangoObjectType

from . import models
from . import serializers
from common.graphql import mutations


class NotificationType(DjangoObjectType):
    data = GenericScalar()

    class Meta:
        model = models.Notification
        interfaces = (relay.Node,)


class NotificationConnection(graphene.Connection):
    class Meta:
        node = NotificationType


class UpdateNotificationMutation(mutations.UpdateModelMutation):
    class Meta:
        serializer_class = serializers.UpdateNotificationSerializer
        edge_class = NotificationConnection.Edge

    @classmethod
    def get_queryset(cls, model_class: models.Notification, root, info, **input):
        return model_class.objects.filter_by_user(info.context.user)


class Query(graphene.ObjectType):
    all_notifications = graphene.relay.ConnectionField(NotificationConnection)

    def resolve_all_notifications(self, info, **kwargs):
        return models.Notification.objects.filter_by_user(info.context.user)


class Mutation(graphene.ObjectType):
    update_notification = UpdateNotificationMutation.Field()
