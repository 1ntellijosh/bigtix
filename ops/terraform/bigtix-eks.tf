###
# Bigtix EKS cluster and nodegroup
#
# @since aws-deployment--JP
###

data "aws_availability_zones" "available" {}
data "aws_caller_identity" "current" {}

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 6.0"
  name    = "${var.cluster_name}-vpc"
  cidr    = "10.0.0.0/16"
  azs     = slice(data.aws_availability_zones.available.names, 0, 2)
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]
  enable_nat_gateway = true
  single_nat_gateway  = true
}

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 21.0"
  name               = var.cluster_name
  kubernetes_version = "1.35"
  subnet_ids      = module.vpc.private_subnets
  vpc_id          = module.vpc.vpc_id
  enable_cluster_creator_admin_permissions = true

  # Required for nodes to get NetworkReady (CNI plugin). Module does not enable addons by default.
  addons = {
    vpc-cni = {
      most_recent   = true
      before_compute = true
    }
  }

  eks_managed_node_groups = {
    ng-spot = {
      instance_types = ["t3.small", "t3a.small"]
      capacity_type  = "SPOT"
      min_size       = 1
      max_size       = 2
      desired_size   = 1
      # Allow Session Manager for debugging unhealthy nodes
      iam_role_additional_policies = {
        AmazonSSMManagedInstanceCore = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
      }
    }
  }

  # Grant GitHub Actions role cluster admin via EKS Access Entries (v21 uses this instead of aws-auth ConfigMap)
  access_entries = {
    github_actions = {
      principal_arn = aws_iam_role.github_actions.arn
      type          = "STANDARD"
      policy_associations = {
        cluster_admin = {
          policy_arn   = "arn:aws:eks::aws:cluster-access-policy/AmazonEKSClusterAdminPolicy"
          access_scope = { type = "cluster" }
        }
      }
    }
  }
}