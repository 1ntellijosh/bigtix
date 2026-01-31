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

# BUILD COMMANDS

build-auth-image:
	docker build -f ./auth-srv/deploy/docker/Dockerfile -t 1ntellijosh/auth-srv:latest ./auth-srv

# OPERATIONS COMMANDS

mkstart:
	minikube start --driver=kvm2

mkstop:
	minikube stop

mkstatus:
	minikube status

skdev:
	skaffold dev

