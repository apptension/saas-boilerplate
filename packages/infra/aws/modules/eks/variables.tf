variable "cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
}

variable "cluster_version" {
  description = "Kubernetes version to use for the EKS cluster"
  type        = string
}

variable "vpc_id" {
  description = "ID of the VPC where the EKS cluster will be created"
  type        = string
}

variable "subnet_ids" {
  description = "List of subnet IDs for the EKS cluster"
  type        = list(string)
}

variable "node_groups" {
  description = "Map of EKS node groups"
  type = map(object({
    desired_size = number
    max_size     = number
    min_size     = number
    instance_types = list(string)
  }))
}

variable "capacity_type" {
  description = "Capacity type for the EKS node groups"
  type        = string
  default     = "SPOT"
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "tags" {
  description = "Application tag"
  type        = map(string)
  default     = {}
}

variable "hosted_zone_name" {
  description = "Name of the Route53 hosted zone"
  type        = string
  default     = "k8s.saas.apptoku.com"
}

data "aws_region" "current" {}

