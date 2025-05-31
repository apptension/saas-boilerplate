module "eks" {
  source = "../modules/eks"
  vpc_id = module.vpc.vpc_id
  subnet_ids = concat(module.vpc.private_subnet_ids, module.vpc.public_subnet_ids)
  cluster_name = "saas-application"
  cluster_version = "1.32"
  node_groups = {
    "default-node-group" = {
      instance_types = ["t3.medium", "m5.large"]
      desired_size = 2
      min_size = 1
      max_size = 3
    }
  }
  environment = "global"
  tags = merge(
    module.application.tags, {
    Environment = "global"
  })
}
