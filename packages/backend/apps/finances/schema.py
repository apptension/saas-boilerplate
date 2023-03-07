from datetime import datetime

import graphene
from django.db import transaction
from django.http import Http404
from djstripe import models as djstripe_models, enums as djstripe_enums
from graphene import relay, ObjectType
from graphene.types.generic import GenericScalar
from graphene_django import DjangoObjectType
from graphql_relay import to_global_id, from_global_id, offset_to_cursor
from rest_framework.generics import get_object_or_404
from stripe.error import InvalidRequestError

from common.acl.policies import AnyoneFullAccess
from common.graphql import mutations
from common.graphql.acl import permission_classes
from . import constants
from . import utils, serializers
from .services import subscriptions, customers


class SubscriptionItemProductType(DjangoObjectType):
    pk = graphene.String()

    @staticmethod
    def resolve_pk(parent, info):
        return parent.id

    class Meta:
        model = djstripe_models.Product
        interfaces = (relay.Node,)
        fields = "__all__"


class SubscriptionPlanType(DjangoObjectType):
    pk = graphene.String()

    @staticmethod
    def resolve_pk(parent, info):
        return parent.id

    class Meta:
        model = djstripe_models.Plan
        interfaces = (relay.Node,)
        fields = "__all__"


class StripeDjangoObjectType(DjangoObjectType):
    pk = graphene.String()

    @staticmethod
    def resolve_pk(parent, info):
        return parent.id

    class Meta:
        abstract = True


class StripeSubscriptionType(StripeDjangoObjectType):
    plan = graphene.Field(SubscriptionPlanType)

    class Meta:
        model = djstripe_models.Subscription
        interfaces = (relay.Node,)
        fields = (
            "id",
            "status",
            "start_date",
            "current_period_end",
            "current_period_start",
            "trial_start",
            "trial_end",
        )


class StripePriceType(StripeDjangoObjectType):
    class Meta:
        model = djstripe_models.Price
        interfaces = (relay.Node,)
        fields = "__all__"


class StripePriceConnection(graphene.Connection):
    class Meta:
        node = StripePriceType


class StripePaymentMethodType(StripeDjangoObjectType):
    card = GenericScalar()
    billing_details = GenericScalar()

    class Meta:
        model = djstripe_models.PaymentMethod
        interfaces = (relay.Node,)
        fields = ("id", "type", "card", "billing_details")


class StripeProductType(StripeDjangoObjectType):
    class Meta:
        model = djstripe_models.Product
        interfaces = (relay.Node,)
        fields = "__all__"


class SubscriptionSchedulePhaseItemType(ObjectType):
    price = graphene.Field(StripePriceType)
    quantity = graphene.Int()

    @staticmethod
    def resolve_price(parent, info):
        return djstripe_models.Price.objects.filter(id=parent["price"]).first()


class SubscriptionSchedulePhaseType(ObjectType):
    start_date = graphene.DateTime()
    end_date = graphene.String()
    trial_end = graphene.String()
    item = graphene.Field(SubscriptionSchedulePhaseItemType)

    @staticmethod
    def resolve_start_date(parent, info):
        return datetime.utcfromtimestamp(parent["start_date"])

    @staticmethod
    def resolve_end_date(parent, info):
        return datetime.utcfromtimestamp(parent["end_date"])

    @staticmethod
    def resolve_item(parent, info):
        return parent["items"][0]


class SubscriptionScheduleType(DjangoObjectType):
    subscription = graphene.Field(StripeSubscriptionType)
    default_payment_method = graphene.Field(StripePaymentMethodType)
    phases = graphene.List(of_type=SubscriptionSchedulePhaseType)
    can_activate_trial = graphene.Boolean()

    @staticmethod
    def resolve_subscription(parent, info):
        return parent.customer.subscription

    @staticmethod
    def resolve_default_payment_method(parent, info):
        return parent.customer.default_payment_method

    @staticmethod
    def resolve_phases(parent, info):
        return subscriptions.get_valid_schedule_phases(parent)

    @staticmethod
    def resolve_can_activate_trial(parent, info):
        return utils.customer_can_activate_trial(parent.customer)

    class Meta:
        model = djstripe_models.SubscriptionSchedule
        interfaces = (relay.Node,)
        fields = "__all__"


class PriceTypeConnection(graphene.Connection):
    class Meta:
        node = SubscriptionPlanType


class SubscriptionScheduleConnection(graphene.Connection):
    class Meta:
        node = SubscriptionScheduleType


class StripeChargeType(StripeDjangoObjectType):
    billing_details = GenericScalar()

    class Meta:
        model = djstripe_models.Charge
        interfaces = (relay.Node,)
        fields = "__all__"


class StripeInvoiceType(StripeDjangoObjectType):
    class Meta:
        model = djstripe_models.Invoice
        interfaces = (relay.Node,)
        fields = "__all__"


class ChargeConnection(graphene.Connection):
    class Meta:
        node = StripeChargeType


class ChangeActiveSubscriptionMutation(mutations.UpdateModelMutation):
    class Meta:
        serializer_class = serializers.UserSubscriptionScheduleSerializer
        edge_class = SubscriptionScheduleConnection.Edge
        require_id_field = False

    @classmethod
    def get_object(cls, model_class, root, info, **input):
        return subscriptions.get_schedule(user=info.context.user)


class CancelActiveSubscriptionMutation(mutations.UpdateModelMutation):
    class Meta:
        serializer_class = serializers.CancelUserActiveSubscriptionSerializer
        edge_class = SubscriptionScheduleConnection.Edge
        require_id_field = False

    @classmethod
    def get_object(cls, model_class, root, info, **input):
        return subscriptions.get_schedule(user=info.context.user)


class PaymentMethodConnection(graphene.Connection):
    class Meta:
        node = StripePaymentMethodType


class PaymentMethodGetObjectMixin:
    @classmethod
    def get_payment_method(cls, id, user):
        filter_kwargs = {"id": id, "customer__subscriber": user}
        queryset = djstripe_models.PaymentMethod.objects.filter(**filter_kwargs)
        if not queryset.exists():
            try:
                api_response = djstripe_models.PaymentMethod(id=id).api_retrieve()
                djstripe_models.PaymentMethod.sync_from_stripe_data(api_response)
            except InvalidRequestError:
                raise Http404
        return get_object_or_404(queryset, **filter_kwargs)


class StripePaymentIntentType(StripeDjangoObjectType):
    class Meta:
        model = djstripe_models.PaymentIntent
        interfaces = (relay.Node,)
        fields = ("pk", "id", "amount", "currency", "client_secret")


class StripeSetupIntentType(StripeDjangoObjectType):
    class Meta:
        model = djstripe_models.SetupIntent
        interfaces = (relay.Node,)
        exclude = ('setup_intents',)


class UpdateDefaultPaymentMethodMutation(PaymentMethodGetObjectMixin, mutations.SerializerMutation):
    active_subscription = graphene.Field(SubscriptionScheduleType)
    payment_method_edge = graphene.Field(PaymentMethodConnection.Edge)

    class Input:
        id = graphene.String()

    class Meta:
        serializer_class = serializers.UpdateDefaultPaymentMethodSerializer
        lookup_field = "id"
        model_class = djstripe_models.PaymentMethod
        edge_class = SubscriptionScheduleConnection.Edge

    @classmethod
    def get_object(cls, model_class, info, *args, **kwargs):
        return cls.get_payment_method(kwargs["id"], info.context.user)

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        super().mutate_and_get_payload(root, info, **input)
        return UpdateDefaultPaymentMethodMutation(
            active_subscription=subscriptions.get_schedule(user=info.context.user),
            payment_method_edge=SubscriptionScheduleConnection.Edge(
                cursor=offset_to_cursor(0),
                node=cls.get_payment_method(input["id"], info.context.user),
            ),
        )


class DeletePaymentMethodMutation(PaymentMethodGetObjectMixin, mutations.DeleteModelMutation):
    active_subscription = graphene.Field(SubscriptionScheduleType)

    class Meta:
        model = djstripe_models.PaymentMethod

    @classmethod
    @transaction.atomic
    def mutate_and_get_payload(cls, root, info, id):
        obj = cls.get_payment_method(id, info.context.user)
        pk = obj.pk
        customers.remove_payment_method(payment_method=obj)
        obj.delete()
        return cls(
            active_subscription=subscriptions.get_schedule(user=info.context.user),
            deleted_ids=[to_global_id("StripePaymentMethodType", str(pk))],
        )


class CreatePaymentIntentMutation(mutations.CreateModelMutation):
    class Meta:
        model = djstripe_models.PaymentIntent
        serializer_class = serializers.PaymentIntentSerializer


class UpdatePaymentIntentMutation(mutations.UpdateModelMutation):
    class Meta:
        model = djstripe_models.PaymentIntent
        serializer_class = serializers.PaymentIntentSerializer

    @classmethod
    def get_queryset(cls, model_class, root, info, **input):
        return djstripe_models.PaymentIntent.objects.filter(customer__subscriber=info.context.user)


class CreateSetupIntentMutation(mutations.CreateModelMutation):
    class Meta:
        model = djstripe_models.SetupIntent
        serializer_class = serializers.SetupIntentSerializer


class Query(graphene.ObjectType):
    all_subscription_plans = graphene.relay.ConnectionField(StripePriceConnection)
    active_subscription = graphene.Field(SubscriptionScheduleType)
    all_payment_methods = graphene.relay.ConnectionField(PaymentMethodConnection)
    all_charges = graphene.relay.ConnectionField(ChargeConnection)
    charge = graphene.Field(StripeChargeType, id=graphene.ID())
    payment_intent = graphene.Field(StripePaymentIntentType, id=graphene.ID())

    @staticmethod
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

    @staticmethod
    def resolve_active_subscription(root, info):
        return subscriptions.get_schedule(user=info.context.user)

    @staticmethod
    def resolve_all_payment_methods(root, info, **kwargs):
        return djstripe_models.PaymentMethod.objects.filter(customer__subscriber=info.context.user)

    @staticmethod
    def resolve_all_charges(root, info, **kwargs):
        customer, _ = djstripe_models.Customer.get_or_create(info.context.user)
        return customer.charges.filter(status=djstripe_enums.ChargeStatus.succeeded).order_by("-created")

    @staticmethod
    def resolve_charge(root, info, id):
        _, pk = from_global_id(id)
        customer, _ = djstripe_models.Customer.get_or_create(info.context.user)
        return customer.charges.get(status=djstripe_enums.ChargeStatus.succeeded, pk=pk)

    @staticmethod
    def resolve_payment_intent(root, info, id):
        _, pk = from_global_id(id)
        return djstripe_models.PaymentIntent.objects.get(customer__subscriber=info.context.user, pk=pk)


class Mutation(graphene.ObjectType):
    change_active_subscription = ChangeActiveSubscriptionMutation.Field()
    cancel_active_subscription = CancelActiveSubscriptionMutation.Field()
    update_default_payment_method = UpdateDefaultPaymentMethodMutation.Field()
    delete_payment_method = DeletePaymentMethodMutation.Field()
    create_payment_intent = CreatePaymentIntentMutation.Field()
    update_payment_intent = UpdatePaymentIntentMutation.Field()
    create_setup_intent = CreateSetupIntentMutation.Field()
