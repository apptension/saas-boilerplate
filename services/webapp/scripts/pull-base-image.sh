#!/bin/bash

set -eu

AWS_ACCOUNT_ID=$(aws sts get-caller-identity --output text --query 'Account')
BASE_REPO_URI=$AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/$PROJECT_NAME-webapp-base

if DOCKER_LOGIN=$(aws ecr get-login-password --region "$AWS_DEFAULT_REGION" 2> /dev/null); then
  echo "$DOCKER_LOGIN" | docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID".dkr.ecr."$AWS_DEFAULT_REGION".amazonaws.com
else
  echo "get-login-password not supported by the AWS CLI, trying get-login instead..."
  # shellcheck disable=SC2091
  $(aws ecr get-login --no-include-email --region "$AWS_DEFAULT_REGION")
fi

docker pull "${BASE_REPO_URI}:latest"
docker tag "${BASE_REPO_URI}:latest" "${PROJECT_NAME}-webapp-base:latest"
