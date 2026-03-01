###
# IAM Role for Load Balancing Service Account
#----------------------------------------
# FIRST-TIME INSTALL ON EKS (run with kubectl context set to the EKS cluster):
#   1. helm repo add eks https://aws.github.io/eks-charts
#   2. kubectl create serviceaccount aws-load-balancer-controller -n kube-system
#   3. kubectl annotate serviceaccount aws-load-balancer-controller -n kube-system \
#        "eks.amazonaws.com/role-arn=$(terraform output -raw lb_controller_role_arn)"
#      (run step 3 from this directory: ops/terraform)
#   4. helm upgrade --install aws-load-balancer-controller eks/aws-load-balancer-controller \
#        -n kube-system \
#        --set clusterName=bigtix-eks \
#        --set serviceAccount.create=false \
#        --set serviceAccount.name=aws-load-balancer-controller \
#        --set region=us-east-1 \
#        --set vpcId=$(terraform output -raw vpc_id)
#      (run step 4 from repo root or ensure vpc_id/lb_controller_role_arn are from this Terraform)
#-----------------------------------------
# IF UPGRADING CONTROLLER (SA already exists): only re-annotate and/or helm upgrade as above.
# @since github-deploy--JP
###

data "aws_eks_cluster" "main" {
  name = var.cluster_name
}

data "tls_certificate" "eks" {
  url = data.aws_eks_cluster.main.identity[0].oidc[0].issuer
}

resource "aws_iam_openid_connect_provider" "eks" {
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = [data.tls_certificate.eks.certificates[0].sha1_fingerprint]
  url             = data.aws_eks_cluster.main.identity[0].oidc[0].issuer

  tags = {
    Cluster = var.cluster_name
  }
}

locals {
  oidc_issuer = replace(data.aws_eks_cluster.main.identity[0].oidc[0].issuer, "https://", "")
}

resource "aws_iam_role" "load_balancer" {
  name               = "EKSLoadBalancerControllerRole"
  
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
            "${local.oidc_issuer}:sub" = "system:serviceaccount:kube-system:aws-load-balancer-controller"
            "${local.oidc_issuer}:aud" = "sts.amazonaws.com"
          }
        }
      }
    ]
  })
}

resource "aws_iam_policy" "load_balancer" {
  name   = "AWSLoadBalancerControllerIAMPolicy"
  policy = file("${path.module}/lb-controller-policy.json")
}

resource "aws_iam_role_policy_attachment" "load_balancer" {
  role       = aws_iam_role.load_balancer.name
  policy_arn = aws_iam_policy.load_balancer.arn
}
