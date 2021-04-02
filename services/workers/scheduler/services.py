import json

import boto3

import settings


def schedule_function_invocation(id: str, name: str, input_data: dict):
    sfn = boto3.client("stepfunctions", region_name=settings.AWS_DEFAULT_REGION, endpoint_url=settings.AWS_ENDPOINT_URL)
    sfn.start_execution(
        stateMachineArn=settings.TASK_SCHEDULING_STATE_MACHINE_ARN,
        name=f"{name}_{id}",
        input=json.dumps(input_data),
    )


def send_event(entry):
    client = boto3.client('events', endpoint_url=settings.AWS_ENDPOINT_URL)
    client.put_events(Entries=[entry])
