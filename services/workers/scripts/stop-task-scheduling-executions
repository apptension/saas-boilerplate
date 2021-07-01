#!/bin/bash

# Uses `parallel` from `moreutils`, not GNU parallel.

set -e

EXECUTIONS_TMP_FILE=$(mktemp)

if [ -z "${ENV_STAGE}" ]; then
    echo "ENV_STAGE environment variable is not defined; did you run \`make shell\`?" >&2
    exit 1
fi

get_state_machine_arn() {
    aws stepfunctions list-state-machines |
        jq -r ".stateMachines[] | select(.name==\"${ENV_STAGE}-TaskSchedulingStateMachine\") | .stateMachineArn"
}

get_running_execution_arns() {
    local STATE_MACHINE_ARN="${1}"
    aws stepfunctions list-executions \
        --state-machine-arn "${STATE_MACHINE_ARN}" \
        --status-filter 'RUNNING' |
        jq -r '.executions[].executionArn'
}

stop_execution() {
    local EXECUTION_ARN="${1}"
    echo "Stopping execution: ${EXECUTION_ARN}"
    aws stepfunctions stop-execution \
        --execution-arn "${EXECUTION_ARN}" |
        jq
}

export -f stop_execution

STATE_MACHINE_ARN=$(get_state_machine_arn)
echo "Fetching execution ARNs for state machine: ${STATE_MACHINE_ARN}"
get_running_execution_arns "${STATE_MACHINE_ARN}" >"${EXECUTIONS_TMP_FILE}"

if ! [ -s "${EXECUTIONS_TMP_FILE}" ]; then
    echo 'No RUNNING executions to delete'
    exit
fi

xargs parallel -i bash -c 'stop_execution {}' -- <"${EXECUTIONS_TMP_FILE}"
