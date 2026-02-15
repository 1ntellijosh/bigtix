# BigTix

BigTix is an e-commerce application for users to buy and sell tickets to events. A large motivation behind my making this application was so that I could learn microservices architecture. I also wanted to make my own app that simulates real-world, big-traffic e-commerce sites, so it will be deployed to the cloud on an AWS EKS

## App Details/Technologies:
- Made in microservices architecture
- Next.js
    - For server-side rendering
    - Quicker content loading (especially on mobile)
    - Better for SEO
- Kubernetes app, will be deployed to AWS EKS cluster
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
- RabbitMQ

## Database:
- Mongodb

## 3rd Party APIs:
- Ticketmaster Discovery
    - So ticket sellers can attached tickets to the event, and so buyers can search for tickets by event, and view event details for tickets
- Stripe
    - Used for payments. This is NOT a real app, so obviously payments will not charge. But API is fully implemented to do so if it was real

## DevOps:
- AWS
- Docker
- Kubernetes
- kind
- Helm
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
| `/api/users/signout` | POST | - | Sign out |
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
| `/api/events/search` | GET | - | Search for events to the the ticket a user's ticket is for (calls TicketMaster API) |
| `/api/events/:eventId` | GET | - | Get details about a single event (calls TicketMaster API) |
| `/api/tickets/create` | POST | `{ title: string, price: number, userId: string, description: string, serialNumber: string, eventId: string }` | Create ticket(s) (auth required) |
| `/api/tickets` | PUT | `{ id: string, title: string, price: number, description: string }` | Update a ticket |

## Orders
Used for creating and managing ticket orders.

### APIs

| Route | Method | Body | Purpose |
|-------|--------|------|---------|
| `/api/orders` | GET | - | Retrieve all active orders for the given user making the request |
| `/api/orders/:id` | GET | - | Get details about a specific order |
| `/api/orders` | POST | `{ tickets: [{ ticketId: string, price: number }] }` | Create an order to purchase the specified tickets |
| `/api/orders/:id` | PUT | `{ status: string }` | Update an order status |
| `/api/orders/:id` | DELETE | - | Cancel the order |

## Payments
Used for paying for tickets (using Stripe API)

### APIs

| Route | Method | Body | Purpose |
|-------|--------|------|---------|
| `/api/payments/new` | POST | `{ amount: number, orderId: string, confirmationTokenId: string }` | Create a payment for a ticket order with Stripe API using its PaymentIntent methodology |
| `/api/webhooks/stripe` | POST | - | API designated for Stripe to send webhooks to app, for updates on payments (success/fail) |

---

# FAQs/Instructions

## Setup and run app for local development

1. **INSTALL DEPENDENCIES:**
    
    You will need to install the following dependancies on your local linux (mac should probably work too):

    | Dep | install URL |
    |-----|-------------|
    | MAKE | https://www.gnu.org/software/make/ |
    | Ansible | https://docs.ansible.com/ansible/latest/installation/index.html |
    | Node.js/NPM | https://docs.npmjs.com/downloading-and-installing-node-js-and-npm |
    | Docker | https://docs.docker.com/get-started/get-docker/#supported-platforms |
    | kubectl | https://kubernetes.io/docs/tasks/tools/ |
    | Kind | https://kind.sigs.k8s.io/docs/user/quick-start/#installation |
    | Helm | https://helm.sh/docs/intro/install/ |
    | Skaffold | https://skaffold.dev/docs/install/#standalone-binary |

    You will also need a Stripe account so you can access the developer dashboard.

2. **INITIALIZE PROJECT FILES, VARS, AND HOST CONFIG:**
    
    Run `make init` in the project root. You will be prompted to choose a password for the jwt session tokens in the app, then what the rabbitmq management console will be (user name is 'user'). The first time you do this command, you will also be prompted to choose a site url to enter into the browser to access the site locally. This command creates the dev-vars.yml file in your root. It hold those variables there to change if you want later. If you want to change this later, you have to delete the host line it adds in your local `/etc/hosts` file, and erase the `dev-vars.yml` file this command generates.

3. **CREATE LOCAL CLUSTER:**
    
    Run `make start` in your project root. This should build and setup the docker images and local Kubernetes cluster, along with a lot of other stuff. If it worked, you can go to the url you were prompted for in the browser to see the app. You can ctrl -> C to stop skaffold and the app, and run `make dev` to fire the cluster up again. If you want to destroy the cluster, enter `make destroy`. `make full-clear` will destroy the cluster, along with deleting local Docker images associated with the bigtix app. Enter `make start` to build the cluster again.

    The app will technically work at this point but you can only sign up, sign out, and search for existing tickets. you will not be able to do much else, since you have to setup **developer accounts with Stripe and Ticketmaster for API keys in the following steps** 

4. **TICKETMASTER API:**
    
    In order to create tickets, you will need to search for venues the tickets are for. You need access to the TicketMaster API to get event data. Sign up for a developer account at [TicketMaster Developer](https://developer.ticketmaster.com/products-and-docs/apis/getting-started/) and create an app. You can get a `Consumer Key` for the app there. You can then paste the key to the `TICKETMASTER_CONSUMER_KEY` in your `dev-vars.yml` file. Either Ctrl-C out of your terminal if you have `make start` or `make dev` running, and enter `make destroy` then `make start` again so the `./ops/Ansible/setup-cluster.yml` script can inject the API key into the cluster on creation.

    At this point, you should be able to create a ticket for selling after logging in. 

5. **STRIPE API:**
    
    In order to use or develop any pages or requests related to making (pretend) payments for ticket orders with Stripe locally, you must register for [developer account on Stripe](https://docs.stripe.com/get-started) and get into the developer dashboard. There, you should see `Publishable key` and `Secret key` in the top right of the dashboard. Copy and paste those into `STRIPE_PUBLISHABLE_KEY` and `STRIPE_SECRET_KEY` respectively in the `dev-vars.yml` file of the project root.

6. **INSTALL STRIPE CLI :**
    
    To use/develop with Stripe payments locally, you need to have the Strip CLI installed to get app to listen for/handle Stripe payment webhook updates, which update the payments and orders to either failed or completed.

    | Dep | install URL |
    |-----|-------------|
    | Stripe CLI | https://stripe.com/docs/stripe-cli |


    After installing Stripe CLI, you can setup your local machine to listen for and trigger Stripe webhook updates on order payments. These updates inform the Payment microserves to mark payments as completed or failed status in the database, and there for to message the Orders microservice to mark its orders as such as such. To set up Stripe webhooks locally:
    
    1. Open an extra terminal window to enter `make stripe-dev` in the project root. You will be prompted to login to your Stripe account
    2. After login, you will see `Your webhook signing secret is whsec_...`. in the terminal. Copy that key and paste it into the `STRIPE_WEBHOOK_SECRET` var in your `dev-vars.yml` file. **Keep the Stripe dev terminal open,** as when you close it, you will have to `make stripe-dev` again and copy/paste another key in `dev-vars.yml`. This is unfortunately the only way to dev locally unless you setup a ngrok account and url and tunnel the public Stripe api to your local machine.
    3. Either Ctrl-C out of your terminal if you have `make start` or `make dev` running, and enter `make destroy` then `make start` again so the `./ops/Ansible/setup-cluster.yml` script can inject the API key into the cluster on creation.

    You can now develop/use the payment system and order processing area of the application now


## Workflow When Adding/Changing Files in `./packages`

1. **Add/update assets**
   - Packaged code in `packages/middleware/src/` are assets for the non-client micoservices, not the client service
   - Packaged code in `packages/common/src/` are assets shared by client and microservices
2. **Update exports** for new shared files in `packages/middleware/src/index.ts` `packages/common/src/index.ts`
3. **Rebuild** with `make build-shared-packages` to compile code into shared node_modules folders
4. **Use** code with normal `import ... from @bigtix/middleware` or `import ... from @bigtix/common`

---

# PLANS/NOTES:

## How images will be made/used/deployed on prod and local:

### LOCAL:
Shared packages (`packages/common`, `packages/middleware`) are built with `make build-shared-packages`; then service images are built with `make build-dev-images`. All microservices' Dockerfiles copy these packages into their respective image (repo root is build context), so Skaffold watches the `./packages` folder and the microservice folder for each microservice image sync. After editing a shared package source, running `make build-shared-packages` causes Skaffold pick up the new `./packages/**/dist/` folder, and rebuild the images.
Images are loaded into Kind with `make kload-imgs` (Skaffold uses local images, no push). The `image: 1ntellijosh/bigtix-...` in `ops/k8s/deployments/*.yml` stays the same; the implicit `:latest` tag is used.

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
4. **Subscribe deployed site to Stripe webhooks via Stripe Dashboard:**
    1. Open Workbench: In Stripe Dashboard, navigate to the Developers section and select the Webhooks tab.
    2. Add Endpoint: Click Add destination (or Create an event destination).
    3. Configure URL: Enter server's endpoint URL (e.g., https://bigtixdomain.com).
    4. Select Events: Click Select events and search for the three events listed above. Check each one and click Add events.
    5. Save & Secret: Click Create destination. Once created, reveal the Signing secret (starts with whsec_) and add it to server's environment variables as STRIPE_WEBHOOK_SECRET. 

---
