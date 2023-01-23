import sentry_sdk
from sentry_sdk.integrations.aws_lambda import AwsLambdaIntegration
import settings


def init():
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN, integrations=[AwsLambdaIntegration()], environment=settings.ENVIRONMENT_NAME
    )
