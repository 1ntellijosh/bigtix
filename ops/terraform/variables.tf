###
# Terraform variable declarations
#
# @since aws-deployment--JP
###

variable "state_bucket_name" {
  description = "S3 bucket name for Terraform state"
  type        = string
}

variable "state_lock_table_name" {
  description = "DynamoDB table name for state locking"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "cluster_name" {
  description = "EKS cluster name"
  type        = string
}

variable "ecr_repo_names" {
  description = "ECR repository names (without bigtix/)"
  type        = list(string)
  default     = ["auth-srv", "tickets-srv", "orders-srv", "payments-srv", "client", "rabbitmq"]
}

variable "github_org" {
  description = "GitHub org or username for OIDC"
  type        = string
}

variable "github_repo" {
  description = "GitHub repo name for OIDC"
  type        = string
  default     = "bigtix"
}

variable "domain_name" {
  description = "Domain for ACM certificate and ALB ingress"
  type        = string
  default     = ""
}
