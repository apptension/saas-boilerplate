import json

import boto3
from environs import Env

secrets_manager_client = boto3.client('secretsmanager')

env = Env()

DB_SECRET_ARN = env('DB_SECRET_ARN')


def fetch_db_secret():
    response = secrets_manager_client.get_secret_value(SecretId=DB_SECRET_ARN)
    return json.loads(response['SecretString'])


DB_CONNECTION = fetch_db_secret()
