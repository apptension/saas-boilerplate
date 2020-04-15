#!/bin/sh

set -e

AWS_ACCOUNT_ID=$(aws sts get-caller-identity --output text --query 'Account')
NGINX_REPO_URI=$AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/$PROJECT_NAME-nginx
BACKEND_REPO_URI=$AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/$PROJECT_NAME-backend

IMAGE_TAG=${COMMIT_HASH:=latest}
IMAGE_TAG=$(echo "$IMAGE_TAG" | sed 's/\.//g')
TASK_IMAGE_URI_NGINX=$NGINX_REPO_URI:$IMAGE_TAG
TASK_IMAGE_URI_BACKEND=$BACKEND_REPO_URI:$IMAGE_TAG

# shellcheck disable=SC2091
$(aws ecr get-login --no-include-email --region "$AWS_DEFAULT_REGION")

docker build --target backend -t "$BACKEND_REPO_URI:latest" .
docker tag "$BACKEND_REPO_URI:latest" "$TASK_IMAGE_URI_BACKEND"

docker build --target nginx -t "$NGINX_REPO_URI:latest" .
docker tag "$NGINX_REPO_URI:latest" "$TASK_IMAGE_URI_NGINX"

docker push "$BACKEND_REPO_URI:latest"
docker push "$TASK_IMAGE_URI_BACKEND"

docker push "$NGINX_REPO_URI:latest"
docker push "$TASK_IMAGE_URI_NGINX"
