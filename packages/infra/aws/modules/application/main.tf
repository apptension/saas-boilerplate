resource "aws_servicecatalogappregistry_application" "main" {
  name        = var.application_name
  description = var.application_description
  tags        = var.tags
}
