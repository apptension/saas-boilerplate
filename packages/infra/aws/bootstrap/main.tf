locals {
  project_hash = substr(md5(var.project_name), 0, 8)
  s3_bucket_name = "${var.project_name}-${local.project_hash}-tfstate"
  dynamodb_table_name = "${var.project_name}-${local.project_hash}-tfstate-locks"
}

resource "aws_s3_bucket" "tfstate" {
  bucket = local.s3_bucket_name
  force_destroy = true
  tags = {
    Name        = "Terraform State Bucket"
    Project     = var.project_name
  }
}

resource "aws_dynamodb_table" "tf_locks" {
  name         = local.dynamodb_table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }

  tags = {
    Name    = "Terraform Locks Table"
    Project = var.project_name
  }
}
