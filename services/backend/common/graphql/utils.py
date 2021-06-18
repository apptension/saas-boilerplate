import graphene

from . import acl as graphql_acl


def graphql_query(queries):
    @graphql_acl.permission_classes(*graphql_acl.get_default_permission_classes())
    class ApiQuery(*queries, graphene.ObjectType):
        pass

    return ApiQuery


def graphql_mutation(mutations):
    @graphql_acl.permission_classes(*graphql_acl.get_default_permission_classes())
    class ApiMutation(*mutations, graphene.ObjectType):
        pass

    return ApiMutation
