#!/bin/bash

set -eu

aws_account_id=$(aws sts get-caller-identity --output text --query 'Account')
step_function_arn="arn:aws:states:${AWS_DEFAULT_REGION}:${aws_account_id}:stateMachine:${PROJECT_NAME}-${ENV_STAGE}-migrations"

execution_arn=$(aws stepfunctions start-execution \
  --output "text" \
  --query "executionArn" \
  --state-machine-arn "${step_function_arn}")

function get_execution_status {
  echo "$1" | jq -r '.status'
}

function poll {
  local status
  local execution_data
  local timeout
  local sleep_step

  status="RUNNING"
  timeout=$((5*60))
  sleep_step=10

  until [[ "${status}" != "RUNNING" ]]; do
    if [[ "${timeout}" -le 0 ]]; then
      break
    fi

    execution_data=$(aws stepfunctions describe-execution --execution-arn "${execution_arn}")
    status=$(get_execution_status "${execution_data}")

    if [[ "${status}" == "RUNNING" ]]; then
      sleep "${sleep_step}"
      timeout=$((timeout-sleep_step))
    fi
  done

  echo "${execution_data}"
}

final_result=$(poll)
final_status=$(get_execution_status "${final_result}")

execution_history=$(aws stepfunctions get-execution-history --execution-arn "${execution_arn}" --query "events")
task_submitted_step=$(echo "${execution_history}" | jq -r '.[] | select(.type=="TaskSubmitted")')
task_submitted_timestamp=$(echo "${task_submitted_step}" | jq -r '.timestamp')

echo "Migrations job log pulled from CloudWatch:"
aws logs tail "${PROJECT_NAME}-${ENV_STAGE}-migrations-log-group" --since "${task_submitted_timestamp}"

echo -e "Migrations job result:\n${final_result}"
if [[ "${final_status}" != "SUCCEEDED" ]]; then
  exit 1;
fi
