from config.schema import subscriptions_schema


class UserContext:
    def __init__(self, user):
        self.user = user


def execute_graphql_subscription_query(query, user, **kwargs):
    return subscriptions_schema.execute(
        query.replace("subscription", "query"),
        context_value=UserContext(user),
        **kwargs,
    )


def prepare_relay_data_message(relay_subscription_id, data, errors):
    return {"type": "next", "id": relay_subscription_id, "payload": {"data": data, "errors": errors}}
