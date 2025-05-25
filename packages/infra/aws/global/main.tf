terraform {
  required_version = ">= 1.0.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.0"
    }
  }
  backend "s3" {
    bucket         = "saas-boilerplate-a402874e-tfstate"
    key            = "global/terraform.tfstate"
    dynamodb_table = "saas-boilerplate-a402874e-tfstate-locks"
    encrypt        = true
  }
}