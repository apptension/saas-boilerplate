import graphene


def graphql_query(queries):
    class ApiQuery(*queries, graphene.ObjectType):
        pass

    return ApiQuery


def graphql_mutation(mutations):
    class ApiMutation(*mutations, graphene.ObjectType):
        pass

    return ApiMutation
