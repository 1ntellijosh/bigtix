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

  # So GitHub Actions (and other off-VPC runners) can reach the API. Without this, kubectl from CI will time out.
  endpoint_public_access = true
  # So nodes/pods in the VPC can reach the API without going through the public endpoint (avoids "dial tcp ... i/o timeout" in controllers).
  endpoint_private_access = true

  # Required addons: vpc-cni (pod networking), coredns (in-cluster DNS), kube-proxy (ClusterIP → API server).
  # aws-ebs-csi-driver: provisions EBS volumes for PVCs (StatefulSets for Mongo/RabbitMQ); addon attaches recommended IAM.
  addons = {
    vpc-cni = {
      most_recent    = true
      before_compute = true
      # Raise max pods per node (default ~8–11 for t3.small); with prefix delegation, nodes can schedule many more pods and avoid "Too many pods" + EBS AZ affinity issues.
      configuration_values = jsonencode({
        env = {
          ENABLE_PREFIX_DELEGATION = "true"
          WARM_PREFIX_TARGET       = "1"
        }
      })
    }
    coredns = {
      most_recent = true
    }
    kube-proxy = {
      most_recent = true
    }
    aws-ebs-csi-driver = {
      most_recent              = true
      service_account_role_arn = aws_iam_role.ebs_csi_driver.arn
    }
  }

  eks_managed_node_groups = {
    ng-spot = {
      instance_types = ["t3.small", "t3a.small"]
      capacity_type  = "SPOT"
      min_size       = 1
      max_size       = 6
      desired_size   = 4  # prefix delegation gives many pods/node; 4 nodes is enough for app + rolling deploys
      # Allow Session Manager for debugging unhealthy nodes
      iam_role_additional_policies = {
        AmazonSSMManagedInstanceCore = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
      }
    }
  }

  # Grant GitHub Actions role cluster admin
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

resource "aws_vpc_security_group_ingress_rule" "node_to_cluster_api" {
  security_group_id            = module.eks.cluster_primary_security_group_id
  referenced_security_group_id = module.eks.node_security_group_id
  from_port                    = 443
  to_port                      = 443
  ip_protocol                  = "tcp"
  description                  = "Allow nodes to reach EKS API server"
}