import graphene

# The patch normalizes floating-point precision issues at the GraphQL parsing level
from common.graphql import scalars  # noqa: F401

from apps.demo import schema as demo_schema
from apps.finances import schema as finances_schema
from apps.notifications import schema as notifications_schema
from apps.users import schema as users_schema
from apps.integrations import schema as integrations_schema
from apps.integrations.ai_assistant import subscription as ai_assistant_subscription
from apps.multitenancy import schema as multitenancy_schema
from apps.sso import schema as sso_schema
from apps.translations import schema as translations_schema
from apps.backup import schema as backup_schema
from common.graphql.utils import graphql_query, graphql_mutation, graphql_subscription

schema = graphene.Schema(
    query=graphql_query(
        [
            demo_schema.Query,
            notifications_schema.Query,
            users_schema.Query,
            finances_schema.Query,
            multitenancy_schema.Query,
            sso_schema.Query,
            sso_schema.TenantSSOQuery,
            translations_schema.TranslationsQuery,
            backup_schema.BackupQuery,
        ]
    ),
    mutation=graphql_mutation(
        [
            demo_schema.Mutation,
            demo_schema.TenantMemberMutation,
            notifications_schema.Mutation,
            users_schema.AnyoneMutation,
            users_schema.AuthenticatedMutation,
            users_schema.Mutation,
            finances_schema.Mutation,
            integrations_schema.Mutation,
            ai_assistant_subscription.Mutation,
            multitenancy_schema.Mutation,
            multitenancy_schema.TenantOwnerMutation,
            sso_schema.Mutation,
            sso_schema.TenantOwnerMutation,
            translations_schema.TranslationsMutation,
            backup_schema.BackupMutation,
        ]
    ),
    subscription=graphql_subscription(
        [
            notifications_schema.Subscription,
            ai_assistant_subscription.Subscription,
        ]
    ),
)

subscriptions_schema = graphene.Schema(query=graphql_subscription(([notifications_schema.Subscription])))
