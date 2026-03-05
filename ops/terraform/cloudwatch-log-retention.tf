# -----------------------------------------------------------------------------
# Super short retention on EKS/CloudWatch log groups to minimize ingestion and cost.
#
# @since cleanup-aws-logs
# -----------------------------------------------------------------------------

resource "aws_cloudwatch_log_group" "eks_cluster" {
  name              = "/aws/eks/${var.cluster_name}/cluster"
  retention_in_days = 1
}
