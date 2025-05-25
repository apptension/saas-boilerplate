module "vpc" {
  source = "../modules/vpc"
  vpc_cidr = var.vpc_cidr
  tags = merge(
    module.application.tags, {
    Environment = "shared"
  })
}