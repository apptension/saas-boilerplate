variable "description" {
  description = "The description of the KMS key."
  type        = string
}

variable "enable_key_rotation" {
  description = "Specifies whether key rotation is enabled."
  type        = bool
  default     = false
}

variable "alias" {
  description = "The display name of the alias. Should be in the format 'alias/<name>'."
  type        = string
}

variable "tags" {
  description = "A map of tags to add to the KMS key."
  type        = map(string)
  default     = {}
}