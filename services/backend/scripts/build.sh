#!/bin/bash

set -eu

AWS_ACCOUNT_ID=$(aws sts get-caller-identity --output text --query 'Account')
BACKEND_REPO_URI=$AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/$PROJECT_NAME-backend

docker pull "$BACKEND_REPO_URI:latest" || true

docker build --target backend -t "$BACKEND_REPO_URI:$VERSION" .
docker tag "$BACKEND_REPO_URI:$VERSION" "$BACKEND_REPO_URI:latest"
docker build --target ssh_bastion -t "$BACKEND_REPO_URI:ssh-bastion" .

if DOCKER_LOGIN=$(aws ecr get-login-password --region "$AWS_DEFAULT_REGION" 2> /dev/null); then
  echo "$DOCKER_LOGIN" | docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID".dkr.ecr."$AWS_DEFAULT_REGION".amazonaws.com
else
  echo "get-login-password not supported by the AWS CLI, trying get-login instead..."
  # shellcheck disable=SC2091
  $(aws ecr get-login --no-include-email --region "$AWS_DEFAULT_REGION")
fi

docker push "$BACKEND_REPO_URI:$VERSION"
docker push "$BACKEND_REPO_URI:ssh-bastion"
docker push "$BACKEND_REPO_URI:latest"
