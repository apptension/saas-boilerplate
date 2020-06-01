#!/bin/sh

set -e

AWS_ACCOUNT_ID=$(aws sts get-caller-identity --output text --query 'Account')
NGINX_REPO_URI=$AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/$PROJECT_NAME-nginx
BACKEND_REPO_URI=$AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/$PROJECT_NAME-backend

TASK_IMAGE_URI_NGINX=$NGINX_REPO_URI:$VERSION
TASK_IMAGE_URI_BACKEND=$BACKEND_REPO_URI:$VERSION

docker build --target backend -t "$TASK_IMAGE_URI_BACKEND" .
docker build --target nginx -t "$TASK_IMAGE_URI_NGINX" .

# shellcheck disable=SC2091
$(aws ecr get-login --no-include-email --region "$AWS_DEFAULT_REGION")
#aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com

docker push "$TASK_IMAGE_URI_BACKEND"
docker push "$TASK_IMAGE_URI_NGINX"
