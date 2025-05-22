terraform {
  required_version = ">= 1.0.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # backend "s3" {
  #   bucket         = "sb-terraform-state-bucket"
  #   key            = "terraform.tfstate"
  #   region         = "us-west-2"
  #   dynamodb_table = "sb-terraform-state-lock"
  #   encrypt        = true
  # }
}

provider "aws" {
  region = var.aws_region
}

module "application" {
  source = "./modules/application"

  application_name        = "saas-application"
  application_description = "Application grouping for shared resources"
  tags          = {
    Environment = "shared"
  }
}


module "vpc" {
  source = "./modules/vpc"
  vpc_cidr = var.vpc_cidr
  tags = merge(
    module.application.tags, {
    Environment = "shared"
  })
}

module "eks" {
  source = "./modules/eks"
  vpc_id = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnet_ids
  cluster_name = "saas-application"
  cluster_version = "1.32"
  node_groups = {
    "saas-application-node-group" = {
      instance_types = ["t3.medium"]
      desired_size = 1
      min_size = 1
      max_size = 3
    }
  }
  environment = "shared"
  tags = merge(
    module.application.tags, {
    Environment = "shared"
  })
}
