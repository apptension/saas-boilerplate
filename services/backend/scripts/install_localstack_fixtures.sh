#!/bin/bash

set -e

LOCALSTACK_URL=http://localstack:4566
SEND_EMAIL_LAMBDA_ARN=arn:aws:lambda:$AWS_DEFAULT_REGION:000000000000:function:$PROJECT_NAME-workers-local-SendEmail



function wait_for_s3 {
  until aws --region=eu-west-1 --endpoint-url="$LOCALSTACK_URL" s3 ls; do
    >&2 echo "S3 is unavailable - sleeping"
    sleep 1
  done
}

function is_event_bus_exists {
  out=$(
    aws --region=eu-west-1 --endpoint-url="$LOCALSTACK_URL" events list-event-buses | jq ".EventBuses[] | select(.Name == \"$1\") | .Name"
  )
  if [[ -z "$out" ]]; then
    return 1
  else
    return 0
  fi
}

function create_event_bus() {
  if is_event_bus_exists "$WORKERS_EVENT_BUS_NAME" ; then
    echo "Event bus $WORKERS_EVENT_BUS_NAME already exists."
    return
  else
    echo "Creating event bus"
  fi

  aws --region=eu-west-1 --endpoint-url="$LOCALSTACK_URL" events create-event-bus \
    --name "$WORKERS_EVENT_BUS_NAME";
  aws --region=eu-west-1 --endpoint-url="$LOCALSTACK_URL" events put-rule \
    --name send-email-rule \
    --event-bus-name "$WORKERS_EVENT_BUS_NAME";

  aws --region=eu-west-1 --endpoint-url="$LOCALSTACK_URL" events put-targets \
    --rule send-email-rule \
    --event-bus-name "$WORKERS_EVENT_BUS_NAME"\
    --targets "Id=sendEmailLambdaTarget,Arn=$SEND_EMAIL_LAMBDA_ARN";

}

function verify_email_in_ses() {
  echo "$SEND_EMAIL_LAMBDA_ARN";
  aws --region=eu-west-1 --endpoint-url="$LOCALSTACK_URL" ses verify-email-identity \
    --email-address "from@example.com"
}
