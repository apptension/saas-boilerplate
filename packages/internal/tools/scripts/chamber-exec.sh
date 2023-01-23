#!/usr/bin/env bash

chamber_service_name=env-${PROJECT_NAME}-${ENV_STAGE}-$1

if [[ ${ENV_STAGE} == "local" ]]; then
  echo "Skipping secrets fetching with chamber for service ${chamber_service_name}..."
  exec "${@:2}"
else
  echo "Fetching secrets using chamber for service ${chamber_service_name}..."
  chamber exec "${chamber_service_name}" -- "${@:2}"
fi
