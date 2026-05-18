# ⬡ Microservice Project

A full-stack microservice with **Go (Gin)** backend, **React** frontend, **PostgreSQL** persistence, and **Redis** caching — orchestrated with Docker Compose.

---

## Stack

| Layer      | Tech                          |
|------------|-------------------------------|
| Backend    | Go 1.22 + Gin                 |
| Frontend   | React 18 + Vite + Zustand     |
| Database   | PostgreSQL 16                 |
| Cache      | Redis 7                       |
| Proxy      | Nginx (serves frontend + proxies `/api`) |

---

## Minimal Environment Variables

Only **3 variables** are required. Set them in `.env`:

```env
POSTGRES_PASSWORD=changeme_postgres
REDIS_PASSWORD=changeme_redis
JWT_SECRET=changeme_jwt_super_secret_key_32chars_min
```

Copy the template:
```bash
cp .env.example .env
# Edit .env with your values
```

All other settings (`PORT`, `ENV`, database name, etc.) have sensible defaults.

---

## Quick Start

### Docker (Recommended)
```bash
cp .env.example .env
make up
```
- Frontend → http://localhost:3000
- Backend API → http://localhost:8080

### Local Development
```bash
# Start only infra (Postgres + Redis)
docker compose up postgres redis -d

# Run backend + frontend with live reload
make dev
```

---

## API Reference

### Auth (public)
```
POST /api/v1/auth/register   { name, email, password }
POST /api/v1/auth/login      { email, password }
```

### Protected (requires `Authorization: Bearer <token>`)
```
GET  /api/v1/me
GET  /api/v1/products
POST /api/v1/products        { name, description, price, stock }
GET  /api/v1/products/:id
GET  /api/v1/orders
POST /api/v1/orders          { items: [{ product_id, quantity }] }
```

All responses follow:
```json
{ "success": true, "data": { ... } }
{ "success": false, "error": "..." }
```

---

## Project Structure

```
microservice-project/
├── backend/
│   ├── cmd/server/main.go          # Entry point + router setup
│   ├── config/config.go            # Env var loading
│   └── internal/
│       ├── cache/redis.go          # Redis cache layer (get/set/blacklist/rate-limit)
│       ├── handlers/handlers.go    # HTTP handlers (auth, products, orders)
│       ├── middleware/auth.go      # JWT auth + rate limiting middleware
│       ├── models/models.go        # Domain types + request/response structs
│       └── repository/postgres.go # Postgres queries (users, products, orders)
├── frontend/
│   └── src/
│       ├── api/client.js           # Axios client with auth interceptors
│       ├── hooks/useAuthStore.js   # Zustand auth state
│       ├── components/Navbar.jsx
│       └── pages/
│           ├── Auth.jsx            # Login + Register
│           ├── Dashboard.jsx       # Stats overview
│           ├── Products.jsx        # CRUD + ordering
│           └── Orders.jsx          # Order history
├── docker-compose.yml
├── .env.example
└── Makefile
```

---

## Architecture Highlights

- **Auto-migration** — schema created on backend startup; no separate migration step needed.
- **Redis caching** — product list cached for 5 min; cache busted on create/order.
- **JWT blacklist** — tokens can be invalidated server-side via Redis.
- **Rate limiting** — 100 req/min per IP enforced in Redis.
- **Transactions** — orders use Postgres transactions for stock decrement + order creation atomically.
- **Graceful shutdown** — backend handles SIGINT/SIGTERM.
- **Multi-stage Docker builds** — tiny production images (~20 MB backend, ~30 MB frontend).

---

## Commands

```bash
make up       # Build + start all services
make down     # Stop + remove volumes
make dev      # Start infra, run Go + Vite locally with live reload
make logs     # Tail backend logs
make test     # Run Go tests
```
