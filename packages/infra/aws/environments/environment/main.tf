module "environment_kms" {
  source = "../../modules/kms"

  alias = "saas-${var.environment_name}-main-kms"
  description = "KMS key for ${var.environment_name} environment"

  tags = var.tags
}

module "environment_rds" {
  source = "../../modules/rds"

  environment           = var.environment_name
  vpc_id               = var.vpc_id
  vpc_cidr             = var.vpc_cidr
  private_subnet_ids   = var.private_subnet_ids

  identifier = "saas-${var.environment_name}-main-db"
  database_username = var.rds_database_username
  instance_class = var.rds_instance_class

  production_ready = var.rds_production_ready

  tags = var.tags
}