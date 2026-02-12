# Makefile for BigTix platform microservices E-Commerce project

.PHONY: commit push sq


# GIT COMMANDS

com:
	git add .
	git commit -a

push:
	git push origin

sq:
	@N=$(word 2,$(MAKECMDGOALS)); \
	if [ -z "$$N" ]; then \
			echo "Usage: make sq <number_of_commits>"; \
			echo "Example: make sq 3"; \
			exit 1; \
	fi; \
	git rebase -i HEAD~$$N

# Prevent Make from trying to build the number as a target
%:
	@:


# APP DEVELOPMENT COMMANDS

##
# APP INIT COMMAND:
# --------------------------
# Prerequisites:
# ---------------
# - MAKE           - https://www.gnu.org/software/make/
# - Ansible        - https://docs.ansible.com/ansible/latest/installation/index.html
#
init:
	@command -v ansible-playbook >/dev/null 2>&1 || { echo "Ansible not found. Install with: pip3 install --user ansible  or  sudo apt install ansible"; exit 127; }
	ansible-playbook ./ops/Ansible/init.yml -K

##
# LOCAL APP RUNNING COMMANDS:
# --------------------------
# Prerequisites:
# ---------------
# - MAKE           - https://www.gnu.org/software/make/
# - Ansible        - https://docs.ansible.com/ansible/latest/installation/index.html
# - Node.js/NPM    - https://docs.npmjs.com/downloading-and-installing-node-js-and-npm
# - Docker         - https://docs.docker.com/get-started/get-docker/#supported-platforms
# - kubectl  	   - https://kubernetes.io/docs/tasks/tools/
# - Kind     	   - https://kind.sigs.k8s.io/docs/user/quick-start/#installation
# - Helm     	   - https://helm.sh/docs/intro/install/
# - Skaffold 	   - https://skaffold.dev/docs/install/#standalone-binary
# - Stripe CLI     - https://stripe.com/docs/stripe-cli
#
full-clear:
	@echo "CLEARING ALL LOCAL BIGTIX CLUSTER AND DOCKER IMAGES..."
	$(MAKE) clear-dev-images
	-$(MAKE) stop 2>/dev/null || true
	@echo "Clear complete."

destroy:
	@echo "DESTROYING LOCAL BIGTIX CLUSTER..."
	@echo "Deleting Kind cluster (removes cluster and all pods, deployments, services, ingresses)..."
	-$(MAKE) kstop 2>/dev/null || true
	@echo "Stop complete."

start:
	@echo "CREATING LOCAL BIGTIX CLUSTER..."
	ansible-playbook ./ops/Ansible/setup-cluster.yml
	$(MAKE) dev

dev:
	@echo "RUNNING DEVELOPMENT ENVIRONMENT (skaffold)..."
	@skaffold dev -f skaffold.dev.yml

##
# Stripe Dev
# --------------------------
# Prerequisites:
# ---------------
# - Stripe CLI     - https://stripe.com/docs/stripe-cli
# - Stripe Dashboard - https://dashboard.stripe.com/
# ---------------
# Setup/Helpful Links:
# - Stripe Webhook Secret - https://dashboard.stripe.com/webhooks
# - Stripe Webhook URL - https://your-server.com/api/webhooks/stripe
# - Stripe Webhook Events - payment_intent.succeeded, payment_intent.payment_failed, payment_intent.requires_action
# - Stripe Webhook Signature - https://dashboard.stripe.com/webhooks/signature
# - Stripe Webhook Signature Verification - https://dashboard.stripe.com/webhooks/signature-verification
#
stripe-dev:
	@KEY=$$(grep '^STRIPE_SECRET_KEY:' dev-vars.yml 2>/dev/null | sed 's/^STRIPE_SECRET_KEY: *//' | sed 's/^["'\'']//;s/["'\'']$$//' | tr -d ' '); \
	if [ -z "$$KEY" ]; then echo "Error: STRIPE_SECRET_KEY not set in dev-vars.yml"; exit 1; fi; \
	stripe login --api-key "$$KEY"; \
	stripe listen --events payment_intent.succeeded,payment_intent.payment_failed,payment_intent.requires_action --forward-to http://localhost:3000/api/webhooks/stripe


##
# KIND COMMANDS:
# --------------------------

# Load Docker images into Kind cluster
kload-imgs:
	kind load docker-image 1ntellijosh/bigtix-auth-srv:latest --name bigtix-cluster
	kind load docker-image 1ntellijosh/bigtix-client-app:latest --name bigtix-cluster
	kind load docker-image 1ntellijosh/bigtix-tickets-srv:latest --name bigtix-cluster
	kind load docker-image 1ntellijosh/bigtix-orders-srv:latest --name bigtix-cluster
	kind load docker-image 1ntellijosh/bigtix-payments-srv:latest --name bigtix-cluster

# Create a new Kind cluster with the config file
kstart:
	kind create cluster --name bigtix-cluster --config ./ops/kind/config.yml

# Stop/delete Kind cluster
kstop:
	-kind delete cluster --name bigtix-cluster

##
# KUBECTL COMMANDS:
# --------------------------

# App's ingress resource expects an NGINX Ingress Controller to be installed. Kind doesn't ship one, so install it with this:
init-ingress:
	kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml

# Wait for ingress-nginx controller deployment (pods may not exist yet right after apply)
wait-ingress:
	kubectl wait --namespace ingress-nginx --for=condition=available deployment/ingress-nginx-controller --timeout=90s
	@sleep 10

apply-deployments:
	kubectl apply -f ./ops/k8s/deployments/auth-depl.yml
	kubectl apply -f ./ops/k8s/deployments/tickets-depl.yml
	kubectl apply -f ./ops/k8s/deployments/orders-depl.yml
	kubectl apply -f ./ops/k8s/deployments/client-depl.yml
	kubectl apply -f ./ops/k8s/deployments/payments-depl.yml

# Retry apply (admission webhook can be slow to accept connections after controller is ready)
apply-ingress:
	@for i in 1 2 3 4 5 6 7 8; do \
		echo "Applying ingress (attempt $$i)..."; \
		kubectl apply -f ./ops/k8s/ingresses/ingress-srv.yml && exit 0; \
		sleep 8; \
	done; exit 1

# Create messaging namespace (for RabbitMQ etc.) if missing; idempotent
add-messaging-namespace:
	kubectl create namespace messaging --dry-run=client -o yaml | kubectl apply -f -
# Build RabbitMQ image with delayed message exchange plugin (used by setup-cluster.yml)
build-rabbitmq-image:
	docker build -t bigtix-rabbitmq:3.13-management -f ./ops/docker/rabbitmq/Dockerfile .

# Port-forward RabbitMQ for management UI in browser
# - Go to http://localhost:15672 to view RabbitMQ management UI
rabbit-management:
	kubectl port-forward svc/rabbitmq -n messaging 15672:15672

# MongoDB shell (no port-forward needed: exec runs inside the pod)
auth-db:
	kubectl exec -it $$(kubectl get pod -l app=auth-mongo -o jsonpath='{.items[0].metadata.name}') -- mongosh

orders-db:
	kubectl exec -it $$(kubectl get pod -l app=orders-mongo -o jsonpath='{.items[0].metadata.name}') -- mongosh

tickets-db:
	kubectl exec -it $$(kubectl get pod -l app=tickets-mongo -o jsonpath='{.items[0].metadata.name}') -- mongosh

payments-db:
	kubectl exec -it $$(kubectl get pod -l app=payments-mongo -o jsonpath='{.items[0].metadata.name}') -- mongosh

cluster-status:
	@echo "--------------------------- CLUSTER STATUS ------------------------------"
	@echo "--- PODS:"
	kubectl get pods
	@echo ""
	@echo "--- SERVICES:"
	kubectl get svc
	@echo ""
	@echo "--- INGRESSES:"
	kubectl get ingress
	@echo ""
	@echo "--- SECRETS:"
	kubectl get secrets
	@echo ""
	@echo "--- NAMESPACES:"
	kubectl get namespaces
	@echo ""
	kubectl cluster-info --context kind-bigtix-cluster
	@echo "-------------------------------------------------------------------------"


##
# BUILD COMMANDS:
# --------------------------

build-auth-dev-image:
	docker build -f ./auth-srv/deploy/docker/dev.Dockerfile -t 1ntellijosh/bigtix-auth-srv:latest .

build-auth-prod-image:
	docker build -f ./auth-srv/deploy/docker/prod.Dockerfile -t 1ntellijosh/bigtix-auth-srv:latest .

build-tickets-dev-image:
	docker build -f ./tickets-srv/deploy/docker/dev.Dockerfile -t 1ntellijosh/bigtix-tickets-srv:latest .

build-tickets-prod-image:
	docker build -f ./tickets-srv/deploy/docker/prod.Dockerfile -t 1ntellijosh/bigtix-tickets-srv:latest .

build-orders-dev-image:
	docker build -f ./orders-srv/deploy/docker/dev.Dockerfile -t 1ntellijosh/bigtix-orders-srv:latest .

build-orders-prod-image:
	docker build -f ./orders-srv/deploy/docker/prod.Dockerfile -t 1ntellijosh/bigtix-orders-srv:latest .

build-payments-dev-image:
	docker build -f ./payments-srv/deploy/docker/dev.Dockerfile -t 1ntellijosh/bigtix-payments-srv:latest .

build-payments-prod-image:
	docker build -f ./payments-srv/deploy/docker/prod.Dockerfile -t 1ntellijosh/bigtix-payments-srv:latest .

build-client-dev-image:
	docker build -f ./client/deploy/docker/dev.Dockerfile -t 1ntellijosh/bigtix-client-app:latest .

build-client-prod-image:
	docker build -f ./client/deploy/docker/prod.Dockerfile -t 1ntellijosh/bigtix-client-app:latest .

build-dev-images:
	$(MAKE) build-auth-dev-image
	$(MAKE) build-client-dev-image
	$(MAKE) build-tickets-dev-image
	$(MAKE) build-orders-dev-image
	$(MAKE) build-payments-dev-image

bs:
	$(MAKE) build-shared-packages
build-shared-packages:
	@echo "Building shared packages..."
	npm install
	cd packages/common && npm run build
	cd packages/middleware && npm run build

clear-dev-images:
	@echo "Removing app Docker images (intellijosh/bigtix-*)..."
	IMGS=$$(docker images '1ntellijosh/bigtix-*' -q 2>/dev/null); \
	[ -z "$$IMGS" ] || docker rmi -f $$IMGS 2>/dev/null || true

build-prod-images:
	$(MAKE) build-auth-prod-image
	$(MAKE) build-tickets-prod-image
	$(MAKE) build-client-prod-image
	$(MAKE) build-orders-prod-image
	$(MAKE) build-payments-prod-image

##
# TEST COMMANDS:
# --------------------------

test-payments-srv:
	cd payments-srv && npm run test

test-orders-srv:
	cd orders-srv && npm run test

test-tickets-srv:
	cd tickets-srv && npm run test

test-auth-srv:
	cd auth-srv && npm run test

# test-client-app:
# 	cd client && npm run test

test-all:
	$(MAKE) test-payments-srv
	$(MAKE) test-orders-srv
	$(MAKE) test-tickets-srv
	$(MAKE) test-auth-srv
# $(MAKE) test-client-app

