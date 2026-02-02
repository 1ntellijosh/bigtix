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
	ansible-playbook ./ops/Ansible/dev-init.yml -K

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
# - Skaffold 	   - https://skaffold.dev/docs/install/#standalone-binary
#
clear:
	@echo "CLEARING ALL BIGTIX PROJECT APPLICATION RESOURCES..."
	$(MAKE) clear-dev-images
	-$(MAKE) stop 2>/dev/null || true
	@echo "Down complete."

stop:
	@echo "STOPPING BIGTIX PROJECT..."
	@echo "Deleting Kind cluster (removes cluster and all pods, deployments, services, ingresses)..."
	-$(MAKE) kstop 2>/dev/null || true
	@echo "Down complete."

start:
	@echo "STARTING BIGTIX PROJECT..."
	$(MAKE) kstart
	$(MAKE) init-ingress
	$(MAKE) wait-ingress
	$(MAKE) build-dev-images
	$(MAKE) kload-imgs
	$(MAKE) apply-deployments
	$(MAKE) apply-ingress
	$(MAKE) cluster-status
	$(MAKE) inject
	$(MAKE) dev

dev:
	skaffold dev

inject:
	ansible-playbook ./ops/Ansible/local-secret-inject.yml


# OPERATIONS COMMANDS

# Add bigtixnetwork.com to /etc/hosts (idempotent; run with: make hosts)
add-local-network-hosts:
	@grep -q '# Bigtix project hosts' /etc/hosts || echo '# Bigtix project hosts' | sudo tee -a /etc/hosts > /dev/null
	@grep -q 'bigtixnetwork.com' /etc/hosts || echo '127.0.0.1 bigtixnetwork.com' | sudo tee -a /etc/hosts > /dev/null

# Load Docker images into Kind cluster
kload-imgs:
	kind load docker-image 1ntellijosh/bigtix-auth-srv:latest --name bigtix-cluster
# Create a new Kind cluster with the config file
kstart:
	kind create cluster --name bigtix-cluster --config ./ops/kind/config.yml
# Stop/delete Kind cluster
kstop:
	-kind delete cluster --name bigtix-cluster

# App's ingress resource expects an NGINX Ingress Controller to be installed. Kind doesn't ship one, so install it with this:
init-ingress:
	kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml

# Wait for ingress-nginx controller deployment (pods may not exist yet right after apply)
wait-ingress:
	kubectl wait --namespace ingress-nginx --for=condition=available deployment/ingress-nginx-controller --timeout=90s
	@sleep 10

apply-deployments:
	kubectl apply -f ./ops/k8s/deployments/auth-depl.yml

# Retry apply (admission webhook can be slow to accept connections after controller is ready)
apply-ingress:
	@for i in 1 2 3 4 5 6 7 8; do \
		echo "Applying ingress (attempt $$i)..."; \
		kubectl apply -f ./ops/k8s/ingresses/ingress-srv.yml && exit 0; \
		sleep 8; \
	done; exit 1

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
	kubectl cluster-info --context kind-bigtix-cluster
	@echo "-------------------------------------------------------------------------"


# BUILD COMMANDS

build-auth-dev-image:
	docker build -f ./auth-srv/deploy/docker/dev.Dockerfile -t 1ntellijosh/bigtix-auth-srv:latest ./auth-srv

build-auth-prod-image:
	docker build -f ./auth-srv/deploy/docker/prod.Dockerfile -t 1ntellijosh/bigtix-auth-srv:latest ./auth-srv

build-dev-images:
	$(MAKE) build-auth-dev-image

clear-dev-images:
	@echo "Removing app Docker images (intellijosh/bigtix-*)..."
	IMGS=$$(docker images '1ntellijosh/bigtix-*' -q 2>/dev/null); \
	[ -z "$$IMGS" ] || docker rmi -f $$IMGS 2>/dev/null || true

build-prod-images:
	$(MAKE) build-auth-prod-image


