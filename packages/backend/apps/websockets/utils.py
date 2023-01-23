from . import models, apigateway, graphql


def get_subscriptions(user, operation_name):
    return models.GraphQLSubscription.objects.filter(
        connection__user=user, operation_name=operation_name
    ).select_related("connection")


def send_subscriptions_messages(user, operation_name, **kwargs):
    subscriptions = get_subscriptions(user, operation_name)
    for subscription in subscriptions:
        result = graphql.execute_graphql_subscription_query(subscription.query, user, **kwargs)
        data = graphql.prepare_relay_data_message(subscription.relay_id, result.data, result.errors)
        apigateway.post_to_connection(data, subscription.connection.connection_id)
