#!/bin/bash

set -e

LOCALSTACK_URL=http://localstack:4566


function wait_for_s3 {
  # Use Python/boto3 instead of AWS CLI to avoid AWS CLI compatibility issues
  until python3 -c "
import boto3
import sys
try:
    s3 = boto3.client('s3', endpoint_url='$LOCALSTACK_URL', aws_access_key_id='foo', aws_secret_access_key='bar', region_name='eu-west-1')
    s3.list_buckets()
    sys.exit(0)
except Exception:
    sys.exit(1)
" 2>/dev/null; do
    >&2 echo "S3 is unavailable - sleeping"
    sleep 1
  done
}

function create_s3_bucket {
  # Use Python/boto3 instead of AWS CLI to avoid AWS CLI compatibility issues
  python3 -c "
import boto3
s3 = boto3.client('s3', endpoint_url='$LOCALSTACK_URL', aws_access_key_id='foo', aws_secret_access_key='bar', region_name='$AWS_DEFAULT_REGION')
s3.create_bucket(Bucket='$1', CreateBucketConfiguration={'LocationConstraint': '$AWS_DEFAULT_REGION'})
print(f'Created bucket: $1')
"
}
