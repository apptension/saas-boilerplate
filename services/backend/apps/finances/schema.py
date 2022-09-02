import graphene
from djstripe import models as djstripe_models
from graphene import relay
from graphene_django import DjangoObjectType

from common.acl.policies import AnyoneFullAccess
from common.graphql.acl import permission_classes
from . import constants


class SubscriptionItemProductType(DjangoObjectType):
    pk = graphene.String()

    def resolve_pk(self, info):
        return self.id

    class Meta:
        model = djstripe_models.Product
        interfaces = (relay.Node,)


class SubscriptionPlanType(DjangoObjectType):
    pk = graphene.String()

    def resolve_pk(self, info):
        return self.id

    class Meta:
        model = djstripe_models.Price
        interfaces = (relay.Node,)


class SubscriptionPlanConnection(graphene.Connection):
    class Meta:
        node = SubscriptionPlanType


class Query(graphene.ObjectType):
    all_subscription_plans = graphene.relay.ConnectionField(SubscriptionPlanConnection)

    @permission_classes(AnyoneFullAccess)
    def resolve_all_subscription_plans(root, info, **kwargs):
        return djstripe_models.Price.objects.filter(
            product__name__in=[
                constants.FREE_PLAN.name,
                constants.MONTHLY_PLAN.name,
                constants.YEARLY_PLAN.name,
            ],
            product__active=True,
        )
