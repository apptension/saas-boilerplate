variable "environment" {
  description = "Environment name (e.g., dev, staging, production)"
  type        = string
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}

variable "vpc_id" {
  description = "VPC ID where RDS will be created"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block of the VPC"
  type        = string
  default     = "0.0.0.0/0"
}

variable "private_subnet_ids" {
  description = "List of private subnet IDs for RDS subnet group"
  type        = list(string)
}

variable "instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t4g.micro"
}

variable "allocated_storage" {
  description = "Initial allocated storage in GB"
  type        = number
  default     = 20
}

variable "max_allocated_storage" {
  description = "Maximum allocated storage in GB"
  type        = number
  default     = 100
}

variable "identifier" {
  description = "Identifier for the RDS instance"
  type        = string
}

variable "database_name" {
  description = "Name of the database to create"
  type        = string
  default     = "main"
}

variable "database_username" {
  description = "Username for the master DB user"
  type        = string
}

variable "backup_retention_period" {
  description = "Number of days to retain backups"
  type        = number
  default     = 7
}

variable "production_ready" {
  description = "Whether the RDS instance is production ready"
  type        = bool
  default     = false
}