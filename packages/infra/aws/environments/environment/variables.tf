variable "environment_name" {
  description = "Environment name"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "vpc_cidr" {
  description = "VPC CIDR"
  type        = string
}

variable "private_subnet_ids" {
  description = "Private subnet IDs"
  type        = list(string)
}

variable "tags" {
  description = "Application tags"
  type        = map(string)
}

variable "rds_database_username" {
  description = "RDS database username"
  type        = string
  default     = "postgres"
}

variable "rds_production_ready" {
  description = "Whether the RDS instance is production ready"
  type        = bool
  default     = false
}

variable "rds_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t4g.micro"
}