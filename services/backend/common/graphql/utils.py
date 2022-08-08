import graphene

from . import acl as graphql_acl


def graphql_query(queries):
    @graphql_acl.permission_classes(*graphql_acl.get_default_permission_classes())
    class Query(*queries, graphene.ObjectType):
        node = graphene.relay.Node.Field()

    return Query


def graphql_mutation(mutations):
    @graphql_acl.permission_classes(*graphql_acl.get_default_permission_classes())
    class ApiMutation(*mutations, graphene.ObjectType):
        pass

    return ApiMutation


def graphql_subscription(subscriptions):
    class ApiSubscription(*subscriptions, graphene.ObjectType):
        pass

    return ApiSubscription
