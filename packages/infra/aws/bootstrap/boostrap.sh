#!/bin/bash
set -e

# Go to the bootstrap directory
cd "$(dirname "$0")"

# Run terraform init and apply non-interactively
terraform init
terraform apply

# Get outputs
S3_BUCKET=$(terraform output -raw tfstate_bucket_name)
DYNAMODB_TABLE=$(terraform output -raw tfstate_dynamodb_table_name)

# Go to the global directory (assume structure)
cd ../global

# Fill in the template
sed \
  -e "s|__S3_BUCKET_NAME__|$S3_BUCKET|g" \
  -e "s|__DYNAMODB_TABLE_NAME__|$DYNAMODB_TABLE|g" \
  main.tf.template > main.tf

echo "Injected backend config into main.tf with bucket: $S3_BUCKET and dynamodb table: $DYNAMODB_TABLE"
