# BigTix

BigTix is an e-commerce application for users to buy and sell tickets to events. A large motivation behind my making this application was so that I could learn microservices architecture. I also wanted to make my own app that simulates real-world, big-traffic e-commerce sites, so it will be deployed to the cloud on an AWS EKS

## Important Details/Technologies:
- Made in microservices architecture
- Next.js
    - For server-side rendering
    - Quicker content loading (especially on mobile)
    - Better for SEO
- kubernetes app, will be deployed to AWS EKS cluster
  - To simulate real-world, big-traffic e-commerce sites on the cloud
  - kind instead of minikube on local dev
    - Wanted to learn
    - Lighter weigth
    - Simulates production cluster applications better
  

# App specs

## Languages:
- Typescript

## Frameworks/Technologies:
- Next.js
- React.js
- Node.js
- Express.js
- Jest

## Database/Cache:
- Mongodb
- Redis

## 3rd Party APIs:
- Stripe (for payments)

## DevOps:
- Docker
- Kubernetes
- kind (for local Kubernetes development)
- Skaffold
- CI/CD (Github Actions)
- Ansible

# Microservices

## Auth
Used for authorizing users

### APIs

| Route | Method | Body | Purpose |
|-------|--------|------|---------|
| `/api/users/signup` | POST | `{ email: string, password: string }` | Sign up for an account |
| `/api/users/signin` | POST | `{ email: string, password: string }` | Sign in to an existing account |
| `/api/users/signout` | POST | `{}` | Sign out |
| `/api/users/currentuser` | GET | - | Return info about the user |


# PLANS/NOTES:

## Middleware folder

Obviously, all microservices MUST be completely independant from eachother. All assets in the `auth-srv/src/middleware` folder will eventually be shared between all microservices in a shared library. These are only shared CODE assets, and NEVER data, nor code accessing the same database. Middleware holds assets that WILL be used by at least 2 services at some point in time. Therefore all these assets will be converted into a shared library, so each service can install and access them.

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