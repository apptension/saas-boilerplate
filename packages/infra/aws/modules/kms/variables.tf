variable "description" {
  description = "The description of the KMS key."
  type        = string
}

variable "enable_key_rotation" {
  description = "Specifies whether key rotation is enabled."
  type        = bool
  default     = true
}

variable "alias" {
  description = "The display name of the alias. Should be in the format 'alias/<name>'."
  type        = string
}