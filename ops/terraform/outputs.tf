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

output "acm_certificate_arn" {
  description = "ARN of the ACM certificate for ALB TLS (set when var.domain_name is set). Use in GitHub variable ACM_CERTIFICATE_ARN for the prod ingress."
  value       = length(aws_acm_certificate.main) > 0 ? aws_acm_certificate.main[0].arn : null
}

output "lb_controller_role_arn" {
  description = "IRSA role ARN for AWS Load Balancer Controller"
  value       = aws_iam_role.load_balancer.arn
}

output "vpc_id" {
  description = "VPC ID for the EKS cluster (use for LB controller --set vpcId=...)"
  value       = module.vpc.vpc_id
}