#!/usr/bin/env bash

if [[ -z ${DOCKER_PASSWORD} ]]; then
  exit 0
fi

echo "${DOCKER_PASSWORD}" | docker login -u "${DOCKER_USERNAME}" --password-stdin
