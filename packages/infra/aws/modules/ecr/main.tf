resource "aws_ecr_repository" "this" {
  name = var.name
  image_tag_mutability = "MUTABLE"
  image_scanning_configuration {
    scan_on_push = var.scan_on_push
  }
  force_delete = var.force_delete
  tags = var.tags
}