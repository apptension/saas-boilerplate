resource "aws_route53_zone" "main" {
  name = var.hosted_zone_name
}