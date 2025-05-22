variable "application_name" {
  description = "Name of the AWS Application"
  type        = string
}

variable "application_description" {
  description = "Description of the AWS Application"
  type        = string
  default     = "SaaS Boilerplate Application"
}

variable "tags" {
  description = "Tags to apply to the application"
  type        = map(string)
  default     = {}
}