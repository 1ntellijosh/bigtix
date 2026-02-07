# BigTix

BigTix is an e-commerce application for users to buy and sell tickets to events. A large motivation behind my making this application was so that I could learn microservices architecture. I also wanted to make my own app that simulates real-world, big-traffic e-commerce sites, so it will be deployed to the cloud on an AWS EKS

## App Details/Technologies:
- Made in microservices architecture
- Next.js
    - For server-side rendering
    - Quicker content loading (especially on mobile)
    - Better for SEO
- kubernetes app, will be deployed to AWS EKS cluster
  - To simulate real-world, big-traffic e-commerce sites on the cloud
  - kind instead of minikube on local dev
    - Lighter weigth
    - Simulates production cluster applications better

## Languages:
- Typescript

## Frameworks/Technologies:
- Next.js
- React.js
- Node.js
- Express.js
- Jest
- Material UI

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

---

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

## Tickets
Used for listing, creating, and managing event tickets.

### APIs

| Route | Method | Body | Purpose |
|-------|--------|------|---------|
| `/api/tickets` | GET | - | Retrieve all tickets |
| `/api/tickets/:id` | GET | - | Retrieve ticket with specific ID |
| `/api/tickets/serial-number/:serialNumber` | GET | - | Retrieve ticket with specific serial number |
| `/api/tickets/event/:eventId` | GET | - | Retrieve all tickets from a specific event ID |
| `/api/tickets/user/:userId` | GET | - | Retrieve all tickets from a specific user ID |
| `/api/tickets/create` | POST | `{ title: string, price: number, userId: string, description: string, serialNumber: string, eventId: string }` | Create ticket(s) (auth required) |
| `/api/tickets` | PUT | `{ id: string, title: string, price: number, description: string }` | Update a ticket |
---

# FAQs/Instructions

## Workflow when adding/changing files in `./packages`

1. **Add/update assets**
   - If **simply editing/changing existing file,** just make the changes and save
   - If **added files are shared Express/server-microservice-specific,** add to `packages/middleware/src/`
   - If **added files will be used by client too,** add to `packages/common/src/`
2. **If files were added,** add export to the `./packages/**/` folder
   - If add was made to `packages/middleware/`, update `packages/middleware/src/index.ts`
   - If add was made to `packages/common/`, update `packages/common/src/index.ts`
3. **Rebuild** with `make build-shared-packages`
4. **Use!:** Import from `@bigtix/middleware` or `@bigtix/common`

### Common Issues

- **"Cannot find module '@bigtix/middleware' or type errors:"**: Run `make build-shared-packages` from root to link workspaces, then `make start/dev`
- **Import errors**: Check that exports are in `packages/*/src/index.ts`

---

# PLANS/NOTES:

## How images will be made/used/deployed on prod and local:

### LOCAL:
Shared packages (`packages/common`, `packages/middleware`) are built with `make build-shared-packages`; then service images are built with `make build-dev-images`. Both `auth-srv` and `client` Dockerfiles copy these packages into the image (repo root is build context), so Skaffold watches the whole repo and will rebuild an image when you change that service’s code or the shared packages. After editing only shared package source, run `make build-shared-packages` so the next Skaffold rebuild picks up the new `dist/`.
Images are loaded into Kind with `make kload-imgs` (Skaffold uses local images, no push). Run the dev loop with `make dev`. The `image: 1ntellijosh/bigtix-...` in `ops/k8s/deployments/*.yml` stays the same; the implicit `:latest` tag is used.

### PRODUCTION:
The service images are built in a Github Actions build workflow, triggered automatically from making a release. The built containers are pushed to either dockerhub or github image repository (doesn't matter right now). Each service's image version/tag will be extracted from the `service-name/deploy/version.json` file in their respective directory using the Github Action's build yaml script.

Deployments of the built images are triggered in Github Actions by selecting a specific published release. The built service images are deployed to the target server/AWS EKS instance, by using an Ansible script. This script (in relation to images) will:
  1. Extract the version for each service in each service's respective `service-name/version.json` file.
  2. Run "kubectl set image..." (or "envsubst/sed") to update the new image version for each service
  3. Kubernetes sees the Deployment spec changed and starts a rollout.
  4. The kubelet on each node pulls the image from the registry when it needs to start a new pod (if that tag isn’t already on the node).
  5. Old pods are replaced by new pods running the new image, according to the Deployment’s rollout strategy (e.g. rolling update).

## Production TODOS:

**HTTPS**: Remember setups for production:

1. **Environment:** Set `NODE_ENV=production` for the all microservice environments (and client if applicable)
2. **TLS at the edge:** Terminate HTTPS at ingress or load balancer (e.g. AWS ALB with ACM, or Kubernetes Ingress with a TLS block and a cert secret).
   - Traffic to pods can stay HTTP inside the cluster since the proxy handles TLS.
3. **Client SERVER API URL:** **!!! This probaby won't need to be done, but noted here to check.** Build the client-dpl deployment image with updated `SERVER_API_BASE_URL` var for server side API calls if it's different from `http://ingress-nginx-controller.ingress-nginx.svc.cluster.local` (e.g. `SERVER_API_BASE_URL=http://new-ingress-nginx-service-name.new-ingress-nginx-namespace.svc.cluster.local`).

---

