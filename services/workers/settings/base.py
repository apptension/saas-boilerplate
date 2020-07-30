import json

import boto3
from environs import Env

env = Env()

AWS_ENDPOINT_URL = env('AWS_ENDPOINT_URL', None)
SMTP_HOST = env('SMTP_HOST', None)
EMAIL_ENABLED = env.bool('EMAIL_ENABLED', default=True)

secrets_manager_client = boto3.client('secretsmanager', endpoint_url=AWS_ENDPOINT_URL)


def fetch_db_secret(db_secret_arn):
    if db_secret_arn is None:
        return None

    response = secrets_manager_client.get_secret_value(SecretId=db_secret_arn)
    return json.loads(response['SecretString'])


LAMBDA_TASK_ROOT = env('LAMBDA_TASK_ROOT', '')

DB_CONNECTION = env('DB_CONNECTION', None)
if DB_CONNECTION:
    DB_CONNECTION = json.loads(DB_CONNECTION)
else:
    DB_CONNECTION = fetch_db_secret(env('DB_SECRET_ARN', None))

FROM_EMAIL = env('FROM_EMAIL', None)
