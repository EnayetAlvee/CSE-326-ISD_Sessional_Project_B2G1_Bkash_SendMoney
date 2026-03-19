# Fintech Payment System — Architecture

Mobile financial service implementing OTP login, balance check, and send money. Stack: Node.js, Next.js, PostgreSQL, Redis, RabbitMQ, Docker.

---

## Services

### Account Service
Owns user identity, auth, JWT issuance, profile, and favourite numbers.

**Why separate from Wallet:**
- Different change rate — profile data changes rarely, transactions change constantly
- Different scale — auth reads are low volume, transaction writes are high volume
- Security isolation — JWT signing secret lives only here, never in the financial service
- Independent failure — wallet degraded does not prevent login

**Why auth is NOT its own service:**
- Only one app authenticates — no cross-app SSO
- Auth is three functions: issue JWT, verify OTP, refresh token — not enough for a separate deployable
- A separate auth service adds a network hop on every login with zero benefit

---

### Wallet and Transaction Service
Owns balance, send money, transaction history, and external disbursements. Wallet and transaction are intentionally in the same service.

**Why wallet and transaction are NOT split:**
- Send money debits a wallet and writes a transaction record in one atomic `BEGIN...COMMIT`
- Splitting them creates a distributed transaction requiring saga or two-phase commit
- They scale identically — every transaction touches both a wallet row and a transaction row

**Two transaction primitives:**

| Primitive | Used For | How |
|---|---|---|
| executeTransfer | Send money, bill pay, merchant pay | Atomic DB transaction, full rollback on failure |
| executeExternalPayment | Mobile recharge, send to bank | Debit wallet, call external API, update status, refund on failure |

**Adding future features (bill pay, recharge):**
- Bill pay creates a merchant wallet and calls `executeTransfer` — no changes to Wallet Service
- Mobile recharge calls `executeExternalPayment` — no changes to Wallet Service
- New features own their domain logic, delegate money movement to this service

---

### OTP Service
Owns OTP generation, delivery via RabbitMQ queue, and verification.

**Why separate from Account Service:**
- SMS provider is swappable — changing from Twilio to a local BD provider requires zero changes to Account Service
- SMS gateway outages do not crash Account Service
- RabbitMQ queue absorbs login spikes independently

**Why RabbitMQ and not Redis pub/sub:**
RabbitMQ persists jobs to disk. If the OTP worker crashes, the job survives and retries. Redis pub/sub is fire-and-forget — a crash loses the job and the user never gets their OTP.

**Flow:**
1. Account Service enqueues `send-otp` job to RabbitMQ, returns 200 immediately
2. OTP worker generates code, stores in Redis with 5 min TTL, calls SMS gateway
3. Verification is a direct Redis lookup — synchronous, no queue, under 5ms

---

### API Gateway (Nginx)
SSL termination, request routing, global rate limiting, load balancing across service instances.

---

## Database Architecture

One PostgreSQL instance, two schemas, two DB users. Enforced at the credential level.

| Schema | Owner | Contains |
|---|---|---|
| account db | Account Service | users table |
| wallet db | Wallet and Txn Service | wallets, transactions, audit logs |

**users table should have:** user ID, phone (unique), display name, hashed PIN, account status, timestamps.

**wallets table should have:** wallet ID, user ID as plain UUID with no FK constraint, phone and display name as denormalized copies, balance as NUMERIC not FLOAT, wallet type (personal or merchant), wallet status, currency, timestamps.

**transactions table should have:** transaction ID, sender wallet ID, receiver wallet ID, amount, transaction type (internal or external), status (pending, completed, failed, refunded), idempotency key as unique constraint, provider name, provider reference ID, metadata as JSONB, timestamp.

**audit logs table should have:** log ID, event type, actor ID, target ID, metadata as JSONB, timestamp. Never deleted.

### Cross-Schema Rules

- No cross-schema FK constraints — `wallets.user_id` is a plain UUID, not a DB-level reference
- Each service connects with its own Postgres credentials — enforced by the DB engine, not discipline
- Data shared across schemas is denormalized at write time (phone and name copied to wallets at registration)
- Changes sync via events — name update publishes `USER_PROFILE_UPDATED`, Wallet Service updates local copy
- Use `NUMERIC(15,2)` for money — floating point has rounding errors

---

## Redis Usage

| Key Pattern | Value | TTL | Purpose |
|---|---|---|---|
| otp:{phone} | code and attempt count | 300s | OTP storage, one-time use |
| otp requests:{phone} | integer counter | 600s | OTP request rate limiting |
| refresh:{userId}:{tokenId} | token, IP, user agent | 7 days | Revocable refresh token |
| rate:{ip} | integer counter | 60s | Global API rate limiting |

Redis also serves as event bus via pub/sub. Wallet Service publishes `TRANSFER_COMPLETED`, `TRANSFER_FAILED`, and `EXTERNAL_PAYMENT_COMPLETED`. Account Service subscribes. Future services subscribe without changing the publisher.

---

## Security

| Layer | Tool | Applied Where |
|---|---|---|
| TLS/HTTPS | Nginx, Let's Encrypt | API Gateway |
| JWT (15 min) and refresh tokens (7 days) | jsonwebtoken, Redis | Account Service |
| OTP rate limit (3 per 10 min) and attempt limit (3 tries) | Redis counters | OTP Service |
| HTTP security headers | Helmet.js | All Express services |
| Global and per-endpoint rate limiting | Nginx, express-rate-limit | Gateway and each service |
| Input validation and sanitization | express-validator | All routes with request body |
| Race condition prevention | SELECT FOR UPDATE | Wallet and Txn Service |
| Duplicate transaction prevention | Idempotency key unique constraint | DB schema |
| Balance floor | CHECK (balance >= 0) | PostgreSQL schema |

**JWT strategy:** Access token is 15 minutes, stateless, verified locally at each service using shared secret. No call to Account Service on protected routes. Refresh token is stored in Redis — revocable instantly by deleting the key.

---

## Logging

### Audit Logs (Permanent)

Written inside the same DB transaction as the financial event. If the transaction rolls back, the audit log rolls back too. Never deleted. Stored in `wallet db.audit_logs`.

| Event | Produced By |
|---|---|
| USER REGISTERED | Account Service |
| OTP REQUESTED | OTP Service |
| OTP VERIFIED | OTP Service |
| OTP FAILED | OTP Service |
| LOGIN SUCCESS | Account Service |
| TRANSFER INITIATED | Wallet and Txn Service |
| TRANSFER COMPLETED | Wallet and Txn Service |
| TRANSFER FAILED | Wallet and Txn Service |
| EXTERNAL PAYMENT INITIATED | Wallet and Txn Service |
| EXTERNAL PAYMENT COMPLETED | Wallet and Txn Service |
| TRANSFER REFUNDED | Wallet and Txn Service |
| ACCOUNT SUSPENDED | Account Service |

### Operational Logs (30 day retention, async)

Written via in-memory buffer, flushed to DB every 5 seconds. Never blocks a request.

Log: every HTTP request (method, path, status, latency, user ID), slow DB queries over 200ms, external API calls and failures, RabbitMQ job lifecycle, unhandled exceptions with stack trace.

Never log: OTP code values, JWT token contents, passwords or PINs, full external API response bodies.

### Logging Tools

- **Winston** — structured JSON logging, one import across all services
- **Morgan** — HTTP request logger middleware, one line per Express app
- **Sentry** — automatic unhandled exception capture, one `Sentry.init()` call per service

---

## Deployment

### Docker Compose (Use This)

```
nginx            — API Gateway, ports 80 and 443
account service  — Node.js, internal port 3001
wallet service   — Node.js, internal port 3002
otp service      — Node.js, internal port 3003
otp worker       — RabbitMQ consumer, no HTTP port
postgres         — PostgreSQL 15, internal only
redis            — Redis 7, internal only
rabbitmq         — RabbitMQ 3 with management UI
frontend         — Next.js, port 3000
```

**Production server:** Single VPS, 4 vCPU, 8GB RAM. Nginx on host handles SSL, proxies to Docker containers. Named volumes for PostgreSQL and Redis data persistence.

### Kubernetes (Only If Required for Sessional)

You do not need Kubernetes for this system. Docker Compose is the correct tool for one team and three services. K8s adds 40 hours of ops overhead for near-zero benefit at this scale.

If you must demonstrate Kubernetes knowledge:

```
3 Deployments       — account, wallet, otp services (2 replicas each)
1 Deployment        — otp worker (no Service resource needed)
3 Services          — ClusterIP for internal routing
1 Ingress           — nginx ingress controller replaces standalone Nginx
1 StatefulSet each  — PostgreSQL, Redis, RabbitMQ
Secrets             — DB passwords, JWT secret, Redis URL
ConfigMaps          — non-secret environment config per service
```

The architecture does not change. Kubernetes is just a different way to run the same containers.

---

## Network Components

| Component | Tool | Purpose |
|---|---|---|
| API Gateway and Reverse Proxy | Nginx | SSL, routing, rate limiting |
| Load Balancer | Nginx upstream block | Round-robin across service instances |
| CDN | Cloudflare free tier | Static asset caching, DDoS protection, DNS |
| Internal Network | Docker bridge network | Service to service, not internet-facing |
| Message Broker | RabbitMQ | OTP queue with persistence and retry |

**Not needed:** hardware load balancer, multiple CDN providers, service mesh (Istio or Linkerd), clustered RabbitMQ.

---

## Post-Live Observability

| Tool | What It Tells You | Setup Time | Cost |
|---|---|---|---|
| UptimeRobot | Is the site reachable? | 5 min | Free |
| Sentry | What errors are users hitting? | 15 min | Free tier |
| Netdata | Is the server struggling right now? | 5 min | Free |
| Grafana Cloud | How is performance trending? | 30 min | Free tier |

**Priority order:** UptimeRobot before going live. Sentry same day. Netdata on the server. Grafana when you have time after launch. You can run safely in production with just the first three.

---

## Capacity

| Operation | Single VPS | Bottleneck |
|---|---|---|
| OTP request | 200 req/sec | SMS gateway, not your server |
| Login and verify | 500 req/sec | Redis lookup |
| Check balance | 800 req/sec | DB read with index |
| Send money | 150 req/sec | Postgres SELECT FOR UPDATE, serialized per wallet |
| Transaction history | 600 req/sec | DB read with index |

**Single VPS:** 50,000 to 100,000 daily active users at normal usage patterns.  
**With horizontal scaling** (3 instances per service, read replica): approximately 500,000 DAU.

Send money is always the bottleneck — it serializes at the DB level by design. That is the price of ACID correctness in a financial system. It is the right tradeoff.

---

## What Was Deliberately Avoided

- Kubernetes — Docker Compose is correct for this team and service count
- Separate auth service — no cross-application SSO requirement exists
- Split wallet and transaction — would require distributed transactions
- Service mesh — adds complexity with no benefit at three services
- Clustered RabbitMQ — single durable node is sufficient

Good architecture is not about using every available tool. It is about choosing the right tool for the right problem and being able to justify every decision.
