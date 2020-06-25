import json

import boto3
from environs import Env

secrets_manager_client = boto3.client('secretsmanager')

env = Env()


def fetch_db_secret(db_secret_arn):
    if db_secret_arn is None:
        return {}

    response = secrets_manager_client.get_secret_value(SecretId=db_secret_arn)
    return json.loads(response['SecretString'])


LAMBDA_TASK_ROOT = env('LAMBDA_TASK_ROOT', '')

DB_CONNECTION = env('DB_CONNECTION', None)
if DB_CONNECTION:
    DB_CONNECTION = json.loads(DB_CONNECTION)
else:
    DB_CONNECTION = fetch_db_secret(env('DB_SECRET_ARN', None))

FROM_EMAIL = env('FROM_EMAIL', None)
