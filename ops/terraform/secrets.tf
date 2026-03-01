# ###
# AWS secrets manager resources
#
# @since github-deploy--JP
###

resource "aws_secretsmanager_secret" "bigtix_app" {
  name = "bigtix/prod/app-env"
}
