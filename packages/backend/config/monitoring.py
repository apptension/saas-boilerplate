import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration
from sentry_sdk.integrations.logging import ignore_logger
from sentry_sdk.scope import add_global_event_processor

ignore_logger('graphql.execution.utils')


@add_global_event_processor
def processor(event, hint):
    if event.get("type") == "transaction" and event.get("transaction") == "/lbcheck":
        return None
    return event


def init(dsn, environment_name, traces_sample_rate):
    sentry_sdk.init(
        dsn=dsn,
        integrations=[DjangoIntegration()],
        traces_sample_rate=traces_sample_rate,
        send_default_pii=True,
        environment=environment_name,
    )
