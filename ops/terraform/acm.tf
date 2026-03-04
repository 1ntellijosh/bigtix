###
# ACM certificate for TLS at the AWS App Load Balancer (ALB)
#
# @since github-deploy--JP
###

resource "aws_acm_certificate" "main" {
  count             = length(var.domain_name) > 0 ? 1 : 0
  domain_name       = var.domain_name
  validation_method = "DNS"

  subject_alternative_names = []

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_acm_certificate_validation" "main" {
  count                   = length(aws_acm_certificate.main) > 0 ? 1 : 0
  certificate_arn         = aws_acm_certificate.main[0].arn
  validation_record_fqdns = [for r in aws_acm_certificate.main[0].domain_validation_options : r.resource_record_name]
}
