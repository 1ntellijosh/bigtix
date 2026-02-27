###
# IAM role for the EKS managed addon aws-ebs-csi-driver (IRSA). With it, driver provisions EBS volumes.
# - Uses the same OIDC provider as the load balancer controller (lb-conroller-irsa.tf)
#
# @since github-deploy--JP
###

resource "aws_iam_role" "ebs_csi_driver" {
  name = "EKS-EBS-CSI-DriverRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = aws_iam_openid_connect_provider.eks.arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "${local.oidc_issuer}:sub" = "system:serviceaccount:kube-system:ebs-csi-controller-sa"
            "${local.oidc_issuer}:aud" = "sts.amazonaws.com"
          }
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ebs_csi_driver" {
  role       = aws_iam_role.ebs_csi_driver.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy"
}
