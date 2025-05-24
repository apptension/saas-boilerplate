variable "name" {
  description = "The name of the ECR repository"
  type        = string
}

variable "scan_on_push" {
  description = "Whether to scan on push"
  type        = bool
  default     = true
}

variable "tags" {
  description = "Tags to apply to the repository"
  type        = map(string)
  default     = {}
}

variable "force_delete" {
  description = "Whether to force delete the repository"
  type        = bool
  default     = false
}