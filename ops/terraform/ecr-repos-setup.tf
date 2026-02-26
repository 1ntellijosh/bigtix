# ###
# Push microservice repos up to Amazon ECR
#
# @since aws-deployment--JP
###

resource "aws_ecr_repository" "app" {
  for_each = toset(var.ecr_repo_names)
  name     = "bigtix/${each.key}"
}