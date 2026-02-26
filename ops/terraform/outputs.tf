###
# Outputs (for Github Actions to use/access the cluster)
#
# @since aws-deployment--JP
###

output "cluster_name" {
  value = module.eks.cluster_name
}

output "ecr_registry" {
  value = "${data.aws_caller_identity.current.account_id}.dkr.ecr.${var.aws_region}.amazonaws.com"
}

output "github_actions_role_arn" {
  value = aws_iam_role.github_actions.arn
}