locals {
  environment_name = "prod"
  tags = merge(
    var.tags,
    {
      Environment = local.environment_name
    }
  )
}