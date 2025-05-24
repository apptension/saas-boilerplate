terraform {
  required_version = ">= 1.0.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
}

locals {
  environment_name = "prod"
}

module "prod_rds" {
  source = "../../modules/rds"

  environment           = local.environment_name
  vpc_id               = data.terraform_remote_state.shared.outputs.vpc_id
  vpc_cidr             = data.terraform_remote_state.shared.outputs.vpc_cidr
  private_subnet_ids   = data.terraform_remote_state.shared.outputs.private_subnet_ids

  identifier = "saas-${local.environment_name}-main-db"
  database_username = "postgres"
  instance_class = "db.t4g.medium"
  production_ready = true

  tags = data.terraform_remote_state.shared.outputs.application_tags
}

data "terraform_remote_state" "shared" {
  backend = "local"
  config = {
    path = "../../terraform.tfstate"
  }
}
