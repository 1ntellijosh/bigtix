# BigTix

Visit live site **[here](https://bigtixstore.com)**

BigTix is an e-commerce application for users to buy and sell tickets to events. It is created in a microservices architecture, and runs in a Kubernetes cluster, deployed to AWS EKS to simulate real-world, big-traffic e-commerce sites.

**Contents:**
 - [App Details/Technologies](#app-details-technologies)
 - [Microservices Details](#microservices)
 - [Event Bus (RabbitMQ)](#rabbit)
 - [Local Development App Setup](#local-setup)
 - [Shared Packages](#shared-packages)
 - [Deployments to Production](#production-deploys)

---

<a id="app-details-technologies"></a>
# App Details/Technologies

### Main Details

As mentioned, the app is made in a microservices architecture. Following that design philosophy, each microservice is completely independent of each other, and do not directly communicate with each other. They can run just fine whether another microservice is down, or replaced altogether.

Microservices update each other via asyncronous communication, using the RabbitMQ messaging system as the event-bus. For example, if an order is created, an order created event is published to the RabbitMQ event-bus, and all relevant microservices that are subscribed to that particular event are notified and can update their own databases. To avoid update race conditions, the 'subscribed' databases use version (single database source) tags for concurrency control, and eventId keys for idempotency.

- Microservices:
  - [Client](#client) microservice for user facing application
  - [Auth](#auth) microservice for user authorization and data
  - [Tickets](#tickets) microservice for tickets creation and data
  - [Orders](#orders) microservice for ticket ordering and order status
  - [Payments](#payments) microservice for making payments on orders
- [RabbitMQ](#rabbit):        
  - Used for event bus, enabling **asyncronous communication** between the microservices
- Kubernetes cluster deployed to AWS EKS cluster
  - To simulate real-world, big-traffic e-commerce sites on the cloud
  - Terraform for AWS infrastructure
- Next.js
  - For server-side rendering and quicker content loading (especially on mobile)
  - Better for SEO

### LOCAL:
- kind runs cluster
  - Lighter weight and faster than minikube
  - Simulates production cluster applications better
  - Images are locally built and "loaded" into kind cluster
- Skaffold for development building, syncing, logging etc
  - Again, local built images, no push to hub or repo

### PRODUCTION:
- All AWS EKS cluster infrastructure is created via Terraform in `ops/terraform`
- Production images are built in a Github Actions build workflows, and sent up to AWS Elastic Container service (ECR)
- Kubernetes assets and configurations for production are set with Kubernetes Kustomize (`ops/k8s/base` and `ops/k8s/overlays/prod`)
- [Deploys to production](#production-deploys) take place in Github actions, triggered by publishing a release or merging changes into main branch

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
- MongoDB

## DevOps:
- AWS
- Terraform
- Docker
- Kubernetes
- Kind
- Skaffold
- CI/CD (Github Actions)
- Ansible

## 3rd Party APIs:
- Ticketmaster Discovery
    - So ticket sellers can attached tickets to the event, and so buyers can search for tickets by event, and view event details for tickets
- Stripe
    - Used for payments. This is NOT a real app, so obviously payments will not charge. But API is fully implemented to do so if it was real

---

<a id="microservices"></a>
# Microservices Details

<a id="client"></a>
## Client
The client facing application. Obviously, its kept fairly dumb beyond some data transformation and user input validation. Made in Next.js. Material UI for styling, theme and UI.

<a id="auth"></a>
## Auth Microservice
Used for user sign up, sign in and session functionality. Made with Express.js, Node.js, and MongoDB

### Publishes Events:
- None

### Event Subscriptions:
- None

### APIs

| Route | Method | Body | Purpose |
|-------|--------|------|---------|
| `/api/users/signup` | POST | `{ email: string, password: string }` | Sign up for an account |
| `/api/users/signin` | POST | `{ email: string, password: string }` | Sign in to an existing account |
| `/api/users/signout` | POST | - | Sign out |
| `/api/users/currentuser` | GET | - | Return info about the user |

<a id="tickets"></a>
## Tickets
Used for listing, creating, and managing event tickets. Made with Express.js, Node.js, and MongoDB

### Publishes Events:
- TICKET_CREATED - Notifies other services of new tickets on sale
- TICKET_UPDATED - Notifies other services of ticket (price) updates

### Subscriptions
- ORDER_CREATED - Marks tickets on order so they can't be updated
- ORDER_STATUS_CHANGED - Marks tickets open for update if order was cancelled, expired, or failed

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
| `/api/tickets/create` | POST | `{ title: string, price: number, userId: string, description: string, serialNumber: string, eventId: string }` | Create single ticket (auth required) |
| `/api/tickets/createmulti` | POST | `{ title: string, price: number, userId: string, description: string, serialNumbers: string[], eventId: string }` | Create multiple tickets (auth required) |
| `/api/tickets/update/:id` | PUT | `{ id: string, title: string, price: number, description: string }` | Update a ticket |
| `/api/events/create` | POST | - | Create an event (from Ticketmater API) that ticket(s) belong to |
| `/api/events/search` | GET | - | Search for events (goes to TicketMaster API) |
| `/api/events/details/:tmEventId` | GET | - | Gets event details (goes to TicketMaster API) |

<a id="orders"></a>
## Orders
Used for creating and managing ticket orders. Made with Express.js, Node.js, and MongoDB

### Publishes Events:
- ORDER_CREATED - Notifies other services order for tickets has been created
- ORDER_STATUS_CHANGED - Notifies other services that status for an order has officially changed (cancelled, expired, failed, awaiting payment, paid)
- ORDER_EXPIRED - Sends message to RabbitMQ event bus on delayed queue to be resent to itself (15 minutes) later for order expiration check

### Subscriptions
- TICKET_CREATED - Adds new ticket to its own tickets database
- ORDER_STATUS_CHANGED - Updates ticket in its own tickets database
- ORDER_EXPIRED - On receipt checks the status of given order, and marks the order as expired if it is not in "paid" or any other "already-done" status (like "failed")
- PAYMENT_CREATED - Updates given order status to "awaiting payment"
- PAYMENT_SUCCEEDED - Updates given order status to "paid"
- PAYMENT_FAILED - Updates given order status to "failed"

### APIs

| Route | Method | Body | Purpose |
|-------|--------|------|---------|
| `/api/orders/all` | GET | - | Retrieve all active orders for the given user making the request |
| `/api/orders/:id` | GET | - | Get details about a specific order |
| `/api/orders/create` | POST | `{ tickets: [{ ticketId: string, price: number }] }` | Create an order to purchase the specified tickets |
| `/api/orders/update/:id` | PUT | `{ status: string }` | Update an order status |
| `/api/orders/delete/:id` | DELETE | - | Cancel the order |

<a id="payments"></a>
## Payments
Used for paying for tickets (using Stripe API). Made with Express.js, Node.js, and MongoDB

### APIs

| Route | Method | Body | Purpose |
|-------|--------|------|---------|
| `/api/payments/new` | POST | `{ amount: number, orderId: string, confirmationTokenId: string }` | Create a payment for a ticket order with Stripe API using its PaymentIntent methodology |
| `/api/webhooks/stripe` | POST | - | API designated for Stripe to send webhooks to app, for updates on payments (success/fail) |

### Publishes Events:
- PAYMENT_CREATED - Notifies other services of payment being attempted for an order
- PAYMENT_SUCCEEDED - Notifies other services that payment for an order has succeeded
- PAYMENT_FAILED - Notifies other services that payment for an order has failed and is closed

### Subscriptions
- ORDER_CREATED - Adds new order to its own orders database
- ORDER_STATUS_CHANGED - Updates status of order in its own orders database

---

<a id="rabbit"></a>
# Event Bus (RabbitMQ)

Microservices never call each other directly. They communicate asynchronously via **RabbitMQ** as the event bus. Shared logic/assets between microservices lives in `packages/middleware`
- Microservices Pub-Sub:
  - **Publish** events and send evelopes using `EventPublisher` class
  - **Subscribe** to desired dureable microservice event queues (e.g. `orders-srv.payment-events`, `tickets-srv.order-events`) using `Subscriber` class
  - **Consume** events using `EventConsumer` class
- Event Envelopes hold:
  - `eventId` used for idempotency control (see `consumeIdempotently`)
  - `eventType` as routing key and... event type
  - `data` payload for all relevant event changes
    - Database version included for concurrency control
  - Envelope and event structure validated on publish and consume
- Failed events nack to requeue into RabbitMQ
- RabbitMQ itself runs as a StatefulSet in the cluster (see `ops/k8s/base/deployments/rabbitmq-statefulset.yml`);

---

<a id="local-setup"></a>
# Local Development App Setup

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

<a id="shared-packages"></a>
# Shared `packages` assets

The packages folder (`packages/common`, `packages/middleware`) holds assets that are used by all the microservices in the application, in one folder.

The repo uses **npm workspaces** (see root `package.json` `workspaces`). When you run `npm install` at the repo root, npm treats `packages/*`, `auth-srv`, `client`, etc. as linked workspaces. Any dependency like `"@bigtix/common": "*"` or `"@bigtix/middleware": "*"` in a service’s `package.json` is satisfied by **symlinking** to the matching workspace package under `packages/`, instead of installing from the registry.

So `import ... from '@bigtix/middleware'` in any microservice resolves to `packages/middleware`. Each service does not copy the package code; it references the same package on disk via the workspace link.

Changes done to the shared packages area are "distributed", or "seen" by the microservices with `make build-shared-packages`, or `make bs` because I don't like to type. See the `packages` folder workflow below:

## Workflow When Adding/Changing Files in `./packages`

1. **Add/update assets**
   - Packaged code in `packages/middleware/src/` are assets for the non-client micoservices, not the client service
   - Packaged code in `packages/common/src/` are assets shared by client and microservices
2. **Update exports** for new shared files in `packages/middleware/src/index.ts` `packages/common/src/index.ts`
3. **Rebuild** with `make build-shared-packages` to compile code into shared node_modules folders
4. **Use** code with normal `import ... from @bigtix/middleware` or `import ... from @bigtix/common`

---

<a id="production-deploys"></a>
# Deployments to Production

Deployments of the application takes place with Github Actions, and are triggered in 2 workflow methods:
  1. **Publishing a Release:**

         .github/workflows/full-deploy-eks-cluster.yml
      This triggers the full deployment of all application assets and infrastructure. Slower, but can be used for full app deployment if needed:
      1. Secrets in AWS Secrets Manager synced into EKS Cluster
      2. Client app and all microservice pods
      3. All microservice db statefulSet workloads (e.g. image, pod template)
      4. RabbitMQ
      5. ALB ingress

  2. **Merge Into `main`  Branch:**

         .github/workflows/deploy-changes-into-cluster.yml
      This triggers simultaneous deployment of **only changed** application microservices or infrastructure, and is therefore much faster:

      1. **ALWAYS:** Secrets in AWS Secrets Manager synced into EKS Cluster
      2. **Client App IF:** Changes are detected in `./client` or shared `.packages`
      3. **Tickets microservice IF:** Changes are detected in `./tickets-src` or shared `.packages`
      4. **Orders microservice IF:** Changes are detected in `./orders-src` or shared `.packages`
      5. **Payments microservice IF:** Changes are detected in `./payments-src` or shared `.packages`
      6. **Auth microservice IF:** Changes are detected in `./auth-src` or shared `.packages`
      7. **Microservice db statefulSets IF:** Changes are detected to any assets or configs related to statefulSets
      8. **RabbitMQ IF:** Changes are detected to any assets or configs related to RabbitMQ
      9. **ALB ingress IF:** Changes are detected to any assets or configs related to the ingress

      **NOTE:** Everything above will be deployed if changes are detected that affect base EKS cluster infrastructure, like any production Kubernetes assets (`ops/k8s/overlays/prod/**`) or changes in Terraform (`/ops/terraform/**`)



