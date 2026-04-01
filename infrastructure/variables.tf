variable "aws_region" {
  description = "AWS region to deploy resources into"
  type        = string
  default     = "eu-west-1"
}

variable "environment" {
  description = "Deployment environment — dev, staging, or prod"
  type        = string

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

variable "project_name" {
  description = "Short slug used as a prefix on all resource names"
  type        = string
  default     = "wedding-uploader"
}

variable "allowed_origins" {
  description = "CORS allowed origins — your Vercel URLs"
  type        = list(string)
  default     = ["http://localhost:3000"]
}

variable "aws_profile" {
  description = "Local AWS CLI profile name"
  type        = string
  default     = "romanoawstraining"
}