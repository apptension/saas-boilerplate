#!/bin/sh

set -e

AWS_ACCOUNT_ID=$(aws sts get-caller-identity --output text --query 'Account')

cdk bootstrap "aws://$AWS_ACCOUNT_ID/$AWS_DEFAULT_REGION"
cdk bootstrap "aws://$AWS_ACCOUNT_ID/us-east-1"
