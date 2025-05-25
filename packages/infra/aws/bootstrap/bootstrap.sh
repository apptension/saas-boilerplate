#!/bin/bash
set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <project_name>"
  exit 1
fi

PROJECT_NAME="$1"

# Go to the bootstrap directory
cd "$(dirname "$0")"

# Run terraform init and apply non-interactively
terraform init
terraform apply -auto-approve -var="project_name=$PROJECT_NAME"

# Get outputs
S3_BUCKET=$(terraform output -raw tfstate_bucket_name)
DYNAMODB_TABLE=$(terraform output -raw tfstate_dynamodb_table_name)

# List of environments to process
environments=(global environments/qa environments/prod)

for env_dir in "${environments[@]}"; do
  template="../$env_dir/main.tf.template"
  output="../$env_dir/main.tf"
  if [ -f "$template" ]; then
    sed \
      -e "s|__S3_BUCKET_NAME__|$S3_BUCKET|g" \
      -e "s|__DYNAMODB_TABLE_NAME__|$DYNAMODB_TABLE|g" \
      "$template" > "$output"
    echo "Injected backend config into $output with bucket: $S3_BUCKET and dynamodb table: $DYNAMODB_TABLE"
  else
    echo "Template $template not found, skipping."
  fi
done
