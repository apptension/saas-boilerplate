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

module "qa_rds" {
  source = "./modules/rds"

  environment           = var.environment_name
  vpc_id               = data.terraform_remote_state.shared.outputs.vpc_id
  private_subnet_ids   = data.terraform_remote_state.shared.outputs.private_subnet_ids

  identifier = "saas-${var.environment_name}-main-db"
  database_username = "postgres"
  database_password = var.db_password  # Store this in a secure way
  instance_class = var.database_instance_class

  tags = data.terraform_remote_state.shared.outputs.application_tags
}

data "terraform_remote_state" "shared" {
  backend = "local"
  config = {
    path = "../terraform.tfstate"
  }
}
