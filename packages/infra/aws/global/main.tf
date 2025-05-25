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
    bucket         = "saas-tfstate-a402874e"
    key            = "global/terraform.tfstate"
    dynamodb_table = "saas-tfstate-locks-a402874e"
    encrypt        = true
  }
}