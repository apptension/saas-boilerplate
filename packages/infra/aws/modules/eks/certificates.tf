resource "aws_acm_certificate" "wildcard_k8s_saas_apptoku_com" {
  domain_name       = "*.k8s.saas.apptoku.com"
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "wildcard_k8s_saas_apptoku_com_validation" {
  for_each = {
    for dvo in aws_acm_certificate.wildcard_k8s_saas_apptoku_com.domain_validation_options : dvo.domain_name => dvo
  }
  zone_id = aws_route53_zone.main.zone_id
  name    = each.value.resource_record_name
  type    = each.value.resource_record_type
  records = [each.value.resource_record_value]
  ttl     = 60
}

resource "aws_acm_certificate_validation" "wildcard_k8s_saas_apptoku_com" {
  certificate_arn         = aws_acm_certificate.wildcard_k8s_saas_apptoku_com.arn
  validation_record_fqdns = [for record in aws_route53_record.wildcard_k8s_saas_apptoku_com_validation : record.fqdn]
}