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
| `/api/tickets` | PUT | `{ id: string, title: string, price: number, description: string }` | Update a ticket (auth required, and must be the owner of the ticket) |

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

# RabbitMQ (event bus) – setup guide

RabbitMQ is the message broker / event bus for async messaging between microservices (e.g. auth-srv, tickets-srv). **Recommended approach:** run RabbitMQ **inside the cluster** for both local (kind) and EKS. Same Helm chart, same URL pattern, and minimal difference between environments.

## Principles

- **One URL per environment:** Use a single env var `RABBITMQ_URL` in every service that uses the bus. Same variable in kind and EKS; only the value changes (in-cluster DNS in both cases).
- **In-cluster = same shape:** `amqp://user:password@rabbitmq.messaging.svc.cluster.local:5672` — works in kind and in EKS; only the cluster (and credentials if you vary them) differ.
- **Client library (Node):** When you add code, use `amqplib` or `amqp-connection-manager`; connect with `RABBITMQ_URL`; define exchanges/queues and publish/consume events.

---

## Step 1 – RabbitMQ in the kind cluster (local, mirrors EKS)

Use the same namespace and chart you’ll use on EKS so config stays aligned.

1. **Ensure kind cluster is up** (e.g. `make dev` or your usual way to create the cluster).

2. **Create the messaging namespace** (same name as on EKS):
   ```bash
   kubectl create namespace messaging
   ```

3. **Add Bitnami Helm repo and install RabbitMQ** in `messaging`:
   ```bash
   helm repo add bitnami https://charts.bitnami.com/bitnami
   helm repo update
   helm install rabbitmq bitnami/rabbitmq -n messaging
   ```

4. **Get the default user and password** (Bitnami sets a random password by default):
   ```bash
   kubectl get secret rabbitmq -n messaging -o jsonpath="{.data.rabbitmq-password}" | base64 -d
   echo
   ```
   Default user is `user`. Use this password in the URL below.

5. **Build `RABBITMQ_URL` for your apps:**
   - Host: `rabbitmq.messaging.svc.cluster.local`
   - Port: `5672`
   - URL: `amqp://user:<password-from-step-4>@rabbitmq.messaging.svc.cluster.local:5672`
   - Put this in a **Secret** or **ConfigMap** in the namespace(s) where auth-srv and tickets-srv run, and expose it as env var `RABBITMQ_URL` in their deployments. (If you prefer a fixed password, set `auth.password` in a custom `values.yaml` and pass it to `helm install -f values.yaml`.)

6. **Management UI (optional):** Port-forward and open in browser:
   ```bash
   kubectl port-forward svc/rabbitmq -n messaging 15672:15672
   ```
   Open `http://localhost:15672` — login `user` and the password from step 4.

7. **Verify:** Pods in the same cluster can reach RabbitMQ at `rabbitmq.messaging.svc.cluster.local:5672`. Your app code will use `RABBITMQ_URL` when you add publishers/consumers.

---

## Step 2 – RabbitMQ in the EKS cluster (production)

Same idea as kind: RabbitMQ runs inside the cluster so the setup mirrors local.

1. **Create the same namespace** (so URLs match):
   ```bash
   kubectl create namespace messaging
   ```

2. **Install RabbitMQ with the same Bitnami chart**, with persistence and (optional) custom password for EKS:
   ```bash
   helm repo add bitnami https://charts.bitnami.com/bitnami
   helm repo update
   helm install rabbitmq bitnami/rabbitmq -n messaging \
     --set persistence.enabled=true \
     --set auth.password=<your-secure-password>
   ```
   - Omit `auth.password` to get a generated password (then read it from the secret as in step 4 below).
   - EKS will use the default StorageClass (e.g. EBS) for persistence.

3. **Get the password** (if you didn’t set it):
   ```bash
   kubectl get secret rabbitmq -n messaging -o jsonpath="{.data.rabbitmq-password}" | base64 -d
   echo
   ```

4. **Set `RABBITMQ_URL` in your app deployments:**
   - Same format as kind: `amqp://user:<password>@rabbitmq.messaging.svc.cluster.local:5672`
   - Store the URL (or user/password) in a Kubernetes **Secret** in the namespace where auth-srv and tickets-srv run; inject as env var `RABBITMQ_URL` in their Deployment specs. Use the same pattern as in your kind manifests so only the secret contents differ.

5. **Management UI (optional):** Port-forward to 15672 as in Step 1.6, or expose via Ingress if you need it in production.

**Result:** Services in EKS talk to RabbitMQ the same way as in kind — via in-cluster DNS and `RABBITMQ_URL`. No code or URL-shape change; only cluster and credentials differ.

---

## Other options

- **Docker-only (no Kubernetes):** If you need RabbitMQ without a cluster (e.g. unit tests or a single-node script), run it in Docker: `docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management`. Use `RABBITMQ_URL=amqp://guest:guest@localhost:5672`. This does **not** mirror EKS.
- **Amazon MQ (managed, outside cluster):** You can use Amazon MQ for RabbitMQ instead of in-cluster. Pods then use `RABBITMQ_URL=amqps://user:password@b-xxx.mq.region.amazonaws.com:5671`. Use this if you prefer not to operate the broker; the in-cluster path above mirrors local more closely.

---

## Checklist

- [ ] kind: `messaging` namespace created; RabbitMQ installed via Helm in `messaging`; `RABBITMQ_URL` set for auth-srv and tickets-srv (Secret/ConfigMap + env).
- [ ] EKS: Same namespace and chart; persistence enabled; Secret with `RABBITMQ_URL` (or user/password); app deployments use the same env var name.
- [ ] When you add app code: install `amqplib` (or `amqp-connection-manager`), connect with `process.env.RABBITMQ_URL`, define exchanges/queues, publish and consume events.

---

