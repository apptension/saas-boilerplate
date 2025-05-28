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


module "environment" {
  source = "../environment"
  environment_name = local.environment_name
  vpc_id = var.vpc_id
  vpc_cidr = var.vpc_cidr
  private_subnet_ids = var.private_subnet_ids
  tags = local.tags
}

data "terraform_remote_state" "global" {
  backend = "s3"
  config = {
    bucket         = "saas-boilerplate-a402874e-tfstate"
    key            = "global/terraform.tfstate"
    encrypt        = true
  }
}
