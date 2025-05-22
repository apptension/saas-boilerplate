data "aws_region" "current" {}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
}

variable "tags" {
  description = "Extra tags"
  type        = map(string)
}

variable "subnet_count" {
  description = "Number of subnets to create"
  type        = number
  default     = 2
}
