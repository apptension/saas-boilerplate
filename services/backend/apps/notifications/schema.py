import graphene
from graphene import relay
from graphene.types.generic import GenericScalar
from graphene_django import DjangoObjectType

from . import models


class NotificationType(DjangoObjectType):
    data = GenericScalar()

    class Meta:
        model = models.Notification
        interfaces = (relay.Node,)


class NotificationConnection(graphene.Connection):
    class Meta:
        node = NotificationType


class Query(graphene.ObjectType):
    all_notifications = graphene.relay.ConnectionField(NotificationConnection)

    def resolve_all_notifications(self, info, **kwargs):
        return models.Notification.objects.filter(user=info.context.user)
