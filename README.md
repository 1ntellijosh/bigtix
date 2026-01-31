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