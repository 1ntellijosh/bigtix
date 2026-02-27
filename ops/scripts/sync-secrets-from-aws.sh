#!/usr/bin/env bash
set -euo pipefail

# Sync production secrets from AWS Secrets Manager into Kubernetes Secrets.
# - Reads JSON from Secrets Manager secret bigtix/prod/app-env
# - Creates/updates K8s Secrets expected by the app:
#   - jwt-secret                (default namespace)       -> JWT_KEY
#   - ticketmaster-consumer-key (default namespace)       -> TICKETMASTER_CONSUMER_KEY
#   - stripe-publishable-key    (default namespace)       -> STRIPE_PUBLISHABLE_KEY
#   - stripe-secret-key         (default namespace)       -> STRIPE_SECRET_KEY
#   - stripe-webhook-key        (default namespace)       -> STRIPE_WEBHOOK_SECRET
#   - rabbitmq-auth             (messaging namespace)     -> password
#   - rabbitmq-url              (default namespace)       -> RABBITMQ_URL (derived)
#   - server-api-base-url       (default namespace)       -> SERVER_API_BASE_URL (client SSR base URL)
#
# Requirements (already satisfied in the GitHub runner/deploy job):
# - aws CLI configured with a role that has secretsmanager:GetSecretValue on bigtix/prod/app-env
# - kubectl configured to point at the target EKS cluster
# - jq installed (present on ubuntu-latest runners)

SECRET_ID="${SECRET_ID:-bigtix/prod/app-env}"
AWS_REGION="${AWS_REGION:-us-east-1}"

echo "[sync-secrets] Fetching secret ${SECRET_ID} from AWS Secrets Manager in region ${AWS_REGION}..."
SECRET_JSON="$(aws secretsmanager get-secret-value \
  --secret-id "${SECRET_ID}" \
  --region "${AWS_REGION}" \
  --query SecretString \
  --output text)"

if [[ -z "${SECRET_JSON}" || "${SECRET_JSON}" == "null" ]]; then
  echo "[sync-secrets] ERROR: SecretString for ${SECRET_ID} is empty or null."
  exit 1
fi

get_val() {
  local key="${1}"
  echo "${SECRET_JSON}" | jq -r --arg k "${key}" '.[$k] // empty'
}

JWT_SECRET="$(get_val JWT_SECRET)"
RABBITMQ_PASSWORD="$(get_val RABBITMQ_PASSWORD)"
TICKETMASTER_CONSUMER_KEY="$(get_val TICKETMASTER_CONSUMER_KEY)"
STRIPE_PUBLISHABLE_KEY="$(get_val STRIPE_PUBLISHABLE_KEY)"
STRIPE_SECRET_KEY="$(get_val STRIPE_SECRET_KEY)"
STRIPE_WEBHOOK_SECRET="$(get_val STRIPE_WEBHOOK_SECRET)"
SERVER_API_BASE_URL="$(get_val SERVER_API_BASE_URL)"

echo "[sync-secrets] Creating/updating Kubernetes Secrets in default namespace..."

if [[ -n "${JWT_SECRET}" ]]; then
  kubectl create secret generic jwt-secret \
    --namespace default \
    --from-literal=JWT_KEY="${JWT_SECRET}" \
    --dry-run=client -o yaml | kubectl apply -f -
else
  echo "[sync-secrets] WARNING: JWT_SECRET not set in ${SECRET_ID}; skipping jwt-secret."
fi

if [[ -n "${TICKETMASTER_CONSUMER_KEY}" ]]; then
  kubectl create secret generic ticketmaster-consumer-key \
    --namespace default \
    --from-literal=TICKETMASTER_CONSUMER_KEY="${TICKETMASTER_CONSUMER_KEY}" \
    --dry-run=client -o yaml | kubectl apply -f -
fi

if [[ -n "${STRIPE_PUBLISHABLE_KEY}" ]]; then
  kubectl create secret generic stripe-publishable-key \
    --namespace default \
    --from-literal=STRIPE_PUBLISHABLE_KEY="${STRIPE_PUBLISHABLE_KEY}" \
    --dry-run=client -o yaml | kubectl apply -f -
fi

if [[ -n "${STRIPE_SECRET_KEY}" ]]; then
  kubectl create secret generic stripe-secret-key \
    --namespace default \
    --from-literal=STRIPE_SECRET_KEY="${STRIPE_SECRET_KEY}" \
    --dry-run=client -o yaml | kubectl apply -f -
fi

if [[ -n "${STRIPE_WEBHOOK_SECRET}" ]]; then
  kubectl create secret generic stripe-webhook-key \
    --namespace default \
    --from-literal=STRIPE_WEBHOOK_SECRET="${STRIPE_WEBHOOK_SECRET}" \
    --dry-run=client -o yaml | kubectl apply -f -
fi

if [[ -n "${SERVER_API_BASE_URL}" ]]; then
  kubectl create secret generic server-api-base-url \
    --namespace default \
    --from-literal=SERVER_API_BASE_URL="${SERVER_API_BASE_URL}" \
    --dry-run=client -o yaml | kubectl apply -f -
fi

echo "[sync-secrets] Creating/updating RabbitMQ secrets..."

if [[ -n "${RABBITMQ_PASSWORD}" ]]; then
  # Secret used by RabbitMQ deployment in messaging namespace
  kubectl create secret generic rabbitmq-auth \
    --namespace messaging \
    --from-literal=password="${RABBITMQ_PASSWORD}" \
    --dry-run=client -o yaml | kubectl apply -f -

  # Secret used by app deployments in default namespace
  RABBITMQ_URL="amqp://user:${RABBITMQ_PASSWORD}@rabbitmq.messaging.svc.cluster.local:5672"
  kubectl create secret generic rabbitmq-url \
    --namespace default \
    --from-literal=RABBITMQ_URL="${RABBITMQ_URL}" \
    --dry-run=client -o yaml | kubectl apply -f -
else
  echo "[sync-secrets] WARNING: RABBITMQ_PASSWORD not set in ${SECRET_ID}; skipping rabbitmq-auth and rabbitmq-url."
fi

echo "[sync-secrets] Done syncing secrets from AWS to Kubernetes."

