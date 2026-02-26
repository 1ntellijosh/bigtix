# ###
# Terraform provider and region data
#
# @since aws-deployment--JP
###


terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 6.0"
    }
  }
  backend "s3" {
    bucket         = "bigtix-terraform-prod-state-225866416100"
    key            = "bigtix/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "bigtix-terraform-state-lock"     # same as DynamoDB table name
  }
}

provider "aws" {
  region = var.aws_region
}