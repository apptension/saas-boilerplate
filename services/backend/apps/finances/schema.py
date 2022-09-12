from datetime import datetime

import graphene
from djstripe import models as djstripe_models
from graphene import relay, ObjectType
from graphene.types.generic import GenericScalar
from graphene_django import DjangoObjectType
from common.graphql import mutations
from common.acl.policies import AnyoneFullAccess
from common.graphql.acl import permission_classes

from . import constants
from . import utils, serializers
from .services import subscriptions


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


class StripeDjangoObjectType(DjangoObjectType):
    pk = graphene.String()

    def resolve_pk(self, info):
        return self.id

    class Meta:
        abstract = True


class StripeSubscriptionType(StripeDjangoObjectType):
    class Meta:
        model = djstripe_models.Subscription
        interfaces = (relay.Node,)
        fields = (
            'id',
            'status',
            'start_date',
            'current_period_end',
            'current_period_start',
            'trial_start',
            'trial_end',
        )


class StripePaymentMethodType(StripeDjangoObjectType):
    card = GenericScalar()
    billing_details = GenericScalar()

    class Meta:
        model = djstripe_models.PaymentMethod
        interfaces = (relay.Node,)
        fields = ('id', 'type', 'card', 'billing_details')


class StripeProductType(StripeDjangoObjectType):
    class Meta:
        model = djstripe_models.Product
        interfaces = (relay.Node,)


class SubscriptionSchedulePhaseItemType(ObjectType):
    price = graphene.Field(SubscriptionPlanType)
    quantity = graphene.Int()

    def resolve_price(self, info):
        return djstripe_models.Price.objects.filter(id=self['price']).first()


class SubscriptionSchedulePhaseType(ObjectType):
    start_date = graphene.DateTime()
    end_date = graphene.String()
    trial_end = graphene.String()
    item = graphene.Field(SubscriptionSchedulePhaseItemType)

    def resolve_start_date(self, info):
        return datetime.utcfromtimestamp(self["start_date"])

    def resolve_end_date(self, info):
        return datetime.utcfromtimestamp(self["end_date"])

    def resolve_item(self, info):
        return self["items"][0]


class SubscriptionScheduleType(DjangoObjectType):
    subscription = graphene.Field(StripeSubscriptionType)
    default_payment_method = graphene.Field(StripePaymentMethodType)
    phases = graphene.List(of_type=SubscriptionSchedulePhaseType)
    can_activate_trial = graphene.Boolean()

    def resolve_subscription(self, info):
        return self.customer.subscription

    def resolve_default_payment_method(self, info):
        return self.customer.default_payment_method

    def resolve_phases(self, info):
        return subscriptions.get_valid_schedule_phases(self)

    def resolve_can_activate_trial(self, info):
        return utils.customer_can_activate_trial(self.customer)

    class Meta:
        model = djstripe_models.SubscriptionSchedule
        interfaces = (relay.Node,)


class PriceTypeConnection(graphene.Connection):
    class Meta:
        node = SubscriptionPlanType


class SubscriptionScheduleConnection(graphene.Connection):
    class Meta:
        node = SubscriptionScheduleType


class ChangeActiveSubscriptionMutation(mutations.UpdateModelMutation):
    class Meta:
        serializer_class = serializers.UserSubscriptionScheduleSerializer
        edge_class = SubscriptionScheduleConnection.Edge
        require_id_field = False

    @classmethod
    def get_object(cls, model_class, root, info, **input):
        return subscriptions.get_schedule(user=info.context.user)


class Query(graphene.ObjectType):
    all_subscription_plans = graphene.relay.ConnectionField(SubscriptionPlanConnection)
    active_subscription = graphene.Field(SubscriptionScheduleType)

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

    def resolve_active_subscription(root, info):
        return subscriptions.get_schedule(user=info.context.user)


class Mutation(graphene.ObjectType):
    change_active_subscription = ChangeActiveSubscriptionMutation.Field()
