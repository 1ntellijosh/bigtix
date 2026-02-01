## Frameworks/Technologies:

React.js
Next.js
Node.js
Express.js

## Languages:

Typescript

## Database/Cache:

Mongodb
Redis

## 3rd Party APIs:

Stripe (for payments)

DevOps:

Docker
Kubernetes
kind (for local Kubernetes development)
Skaffold
Github Actions
Ansible

# Microservices

## auth

Auth microservice. Used for authorizing users

### APIs

| Route | Method | Body | Purpose |
|-------|--------|------|---------|
| `/api/users/signup` | POST | `{ email: string, password: string }` | Sign up for an account |
| `/api/users/signin` | POST | `{ email: string, password: string }` | Sign in to an existing account |
| `/api/users/signout` | POST | `{}` | Sign out |
| `/api/users/currentuser` | GET | - | Return info about the user |

# PLANS/NOTES:

## How images will be made/used/deployed on prod and local:

### LOCAL:
The service images are built and present on the machine with `make build-dev-images`. They are loaded into the Kind cluster with `make kload-imgs` (so Skaffold doesn't need to push to a registry—images are already on the nodes). Skaffold then runs on these images via `make skdev`. The line `image: 1ntellijosh/bigtix-service-name-srv` in the `ops/k8s/service-name-depl.yml` files stays the same. Images are rebuilt/cleared locally as needed between app versions, so the implicit ":latest" image tag can work.

### PRODUCTION:
The service images are built in a Github Actions build workflow, triggered automatically from making a release. The built containers are pushed to either dockerhub or github image repository (doesn't matter right now). Each service's image version/tag will be extracted from the `service-name/deploy/version.json` file in their respective directory using the Github Action's build yaml script.

Deployments of the built images are triggered in Github Actions by selecting a specific published release. The built service images are deployed to the target server/AWS EKS instance, by using an Ansible script. This script (in relation to images) will:
  1. Extract the version for each service in each service's respective `service-name/version.json` file.
  2. Run "kubectl set image..." (or "envsubst/sed") to update the new image version for each service
  3. Kubernetes sees the Deployment spec changed and starts a rollout.
  4. The kubelet on each node pulls the image from the registry when it needs to start a new pod (if that tag isn’t already on the node).
  5. Old pods are replaced by new pods running the new image, according to the Deployment’s rollout strategy (e.g. rolling update).