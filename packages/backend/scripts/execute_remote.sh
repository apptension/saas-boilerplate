#!/usr/bin/env bash
# This script allows you to connect the ECS backend task and starts an interactive shell session inside it.

if ! [ -x "$(command -v jq)" ]; then
  echo 'Error: jq library is required to run this script' >&2
  echo 'Check the jq home page at: https://stedolan.github.io/jq/'
  exit 1
fi

if [ -z "$ENV_STAGE" ]
then
   echo "ENV_STAGE environment variable is not set"
   exit 1
fi

PROJECT_ENV_NAME=${PROJECT_NAME}-${ENV_STAGE}

CLUSTER_NAME="${PROJECT_ENV_NAME}-main"
SERVICE_NAME="${PROJECT_ENV_NAME}-api"
CHAMBER_SERVICE_NAME="env-${PROJECT_ENV_NAME}-backend"

TASK_LIST=$(aws ecs list-tasks --cluster saas-qa-main --service-name "$SERVICE_NAME")
TASK_ARN=$(echo "${TASK_LIST}" | jq -r ".taskArns[0]")

aws ecs execute-command \
  --cluster "$CLUSTER_NAME" \
  --region "${AWS_DEFAULT_REGION//\"/}" \
  --task "$TASK_ARN" \
  --container backend \
  --command "/bin/bash" --interactive