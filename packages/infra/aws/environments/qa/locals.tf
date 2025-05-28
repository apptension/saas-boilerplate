locals {
  environment_name = "qa"
  tags = merge(
    var.tags,
    {
      Environment = local.environment_name
    }
  )
}