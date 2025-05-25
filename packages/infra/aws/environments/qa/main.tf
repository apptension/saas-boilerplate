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
    key            = "qa/terraform.tfstate"
    dynamodb_table = "saas-boilerplate-a402874e-tfstate-locks"
    encrypt        = true
  }
}

locals {
  environment_name = "qa"
}

module "qa_rds" {
  source = "../../modules/rds"

  environment           = local.environment_name
  vpc_id               = data.terraform_remote_state.global.outputs.vpc_id
  vpc_cidr             = data.terraform_remote_state.global.outputs.vpc_cidr
  private_subnet_ids   = data.terraform_remote_state.global.outputs.private_subnet_ids

  identifier = "saas-${local.environment_name}-main-db"
  database_username = "postgres"
  instance_class = "db.t4g.micro"

  tags = data.terraform_remote_state.global.outputs.application_tags
}

data "terraform_remote_state" "global" {
  backend = "s3"
  config = {
    bucket         = "saas-boilerplate-a402874e-tfstate"
    key            = "global/terraform.tfstate"
    dynamodb_table = "saas-boilerplate-a402874e-tfstate-locks"
    encrypt        = true
  }
}
