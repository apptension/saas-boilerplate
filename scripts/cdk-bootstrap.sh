#!/bin/sh

set -e

AWS_ACCOUNT_ID=$(aws sts get-caller-identity --output text --query 'Account')

node_modules/.bin/cdk bootstrap "aws://$AWS_ACCOUNT_ID/$AWS_DEFAULT_REGION"
node_modules/.bin/cdk bootstrap "aws://$AWS_ACCOUNT_ID/us-east-1"
