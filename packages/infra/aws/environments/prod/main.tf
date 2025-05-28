terraform {
  required_version = ">= 1.0.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "saas-boilerplate-a402874e-tfstate"
    key            = "prod/terraform.tfstate"
    dynamodb_table = "saas-boilerplate-a402874e-tfstate-locks"
    encrypt        = true
  }
}

locals {
  environment_name = "prod"
}

module "environment" {
  source = "../environment"
  environment_name = local.environment_name
  vpc_id = var.vpc_id
  vpc_cidr = var.vpc_cidr
  private_subnet_ids = var.private_subnet_ids
  rds_production_ready = true
  rds_instance_class = "db.t4g.medium"
  tags = local.tags
}
