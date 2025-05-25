module "application" {
  source = "../modules/application"

  application_name        = "saas-application"
  application_description = "Application grouping for global resources"
  tags          = {
    Environment = "global"
  }
}