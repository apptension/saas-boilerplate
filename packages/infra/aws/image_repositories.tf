locals {
  private_ecr_repos = {
    backend = {
      name                 = "saas-backend"
    }
    e2e = {
      name                 = "saas-e2e-base"
    }
    workers = {
      name                 = "saas-workers-base"
    }
  }
  public_ecr_repos = {
    python = {
      name                 = "docker/library/python"
    }
    nginx = {
      name                 = "docker/library/nginx"
    }
  }
}

module "ecr_private_repositories" {
  source = "./modules/ecr"
  for_each = local.private_ecr_repos

  name                 = each.value.name
  tags                 = merge(
    module.application.tags, {
      Environment = "shared"
    }
  )
}

resource "aws_ecr_pull_through_cache_rule" "this" {
  ecr_repository_prefix        = "ecr-public"
  upstream_registry_url        = "public.ecr.aws"
}

module "ecr_public_repositories" {
  source = "./modules/ecr"
  for_each = local.public_ecr_repos

  name                 = "${aws_ecr_pull_through_cache_rule.this.ecr_repository_prefix}/${each.value.name}"
  force_delete         = true
  scan_on_push         = false
  tags                 = merge(
    module.application.tags, {
      Environment = "shared"
    }
  )
}