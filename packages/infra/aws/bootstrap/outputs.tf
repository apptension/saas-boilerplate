output "tfstate_bucket_name" {
  value = aws_s3_bucket.tfstate.bucket
}

output "tfstate_dynamodb_table_name" {
  value = aws_dynamodb_table.tf_locks.name
}