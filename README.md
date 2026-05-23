# ⬡ Microservice Project

A full-stack microservice with **Go (Gin)** backend, **React** frontend, **PostgreSQL** persistence, and **Redis** caching — orchestrated with Docker Compose and deployable to AWS via **Terraform**.

---

## Stack

| Layer          | Tech                                        |
|----------------|---------------------------------------------|
| Backend        | Go 1.22 + Gin                               |
| Frontend       | React 18 + Vite + Zustand                   |
| Database       | PostgreSQL 16                               |
| Cache          | Redis 7                                     |
| Proxy          | Nginx (serves frontend + proxies `/api`)    |
| Infrastructure | Terraform + AWS (EC2, RDS, VPC)             |

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

## Infrastructure (Terraform)

The `terraform/` directory provisions the full AWS infrastructure: a VPC, EC2 application server, and a managed RDS PostgreSQL instance.

### Prerequisites

- [Terraform](https://developer.hashicorp.com/terraform/downloads) >= 1.3
- AWS CLI configured (`aws configure`) with sufficient IAM permissions
- An existing AWS key pair (for EC2 SSH access)

### Directory Structure

```
terraform/
├── modules/
│   ├── EC2/
│   │   └── main.tf          # EC2 instance + security group
│   ├── RDS/
│   │   ├── main.tf          # RDS PostgreSQL instance
│   │   ├── database_sg.tf   # RDS security group
│   │   └── variable.tf      # RDS input variables
│   ├── Template/
│   │   └── main.tf          # User-data / launch template scripts
│   └── vpc/
│       ├── main.tf          # VPC, subnets, IGW, route tables
│       ├── output.tf        # Exported VPC/subnet IDs
│       └── variable.tf      # VPC CIDR & AZ variables
├── main.tf                  # Root module — wires all modules together
├── variable.dev.tf          # Dev environment variable definitions
├── terraform.tfstate        # Local state (do not edit manually)
├── terraform.tfstate.backup # Previous state backup
└── .terraform.lock.hcl      # Provider version lock file
```

### First-Time Setup

**1. Navigate to the terraform directory**

```bash
cd terraform
```

**2. Copy and fill in your variable values**

Create a `terraform.tfvars` file (gitignored) based on `variable.dev.tf`:

```hcl
# terraform.tfvars
aws_region         = "ap-south-1"
key_pair_name      = "your-aws-keypair-name"
db_password        = "changeme_rds_password"
environment        = "dev"
```

**3. Initialise Terraform**

Downloads all required providers and modules.

```bash
terraform init
```

**4. Preview the execution plan**

```bash
terraform plan
```

Review the output carefully before applying. No infrastructure is created at this step.

**5. Apply the configuration**

```bash
terraform apply
```

Type `yes` when prompted. Provisioning typically takes 5–10 minutes (RDS is the slowest component).

**6. Retrieve outputs**

After `apply` completes, note the printed outputs (EC2 public IP, RDS endpoint, etc.):

```bash
terraform output
```

### Updating Infrastructure

After editing any `.tf` file, re-run:

```bash
terraform plan    # Review what will change
terraform apply   # Apply the changes
```

Terraform will compute a diff against the current state and only modify what has changed.

**Common update scenarios:**

| Change | Files to edit |
|---|---|
| Resize EC2 instance | `modules/EC2/main.tf` → `instance_type` |
| Change RDS engine version | `modules/RDS/main.tf` → `engine_version` |
| Add a new subnet or AZ | `modules/vpc/main.tf` + `modules/vpc/variable.tf` |
| Modify security group rules | `modules/RDS/database_sg.tf` or `modules/EC2/main.tf` |
| Change environment variables | `variable.dev.tf` + your `terraform.tfvars` |

### Destroying Infrastructure

To tear down **all** provisioned resources:

```bash
terraform destroy
```

Type `yes` when prompted. This is irreversible — RDS snapshots are not taken automatically unless configured.

### State Management

By default, state is stored locally in `terraform.tfstate`. For team use, migrate to a remote backend (S3 + DynamoDB recommended):

```hcl
# Add to main.tf
terraform {
  backend "s3" {
    bucket         = "your-tfstate-bucket"
    key            = "microservice/dev/terraform.tfstate"
    region         = "ap-south-1"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}
```

Then run `terraform init` again to migrate existing state.

> **Important:** Never commit `terraform.tfstate` or `terraform.tfvars` to version control. Both are included in `.gitignore`.

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
│       └── repository/postgres.go  # Postgres queries (users, products, orders)
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
├── terraform/                      # AWS infrastructure (see above)
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
- **IaC with Terraform** — full AWS environment (VPC, EC2, RDS) reproducible from code.

---

## Commands

```bash
# Application
make up       # Build + start all services
make down     # Stop + remove volumes
make dev      # Start infra, run Go + Vite locally with live reload
make logs     # Tail backend logs
make test     # Run Go tests

# Infrastructure
cd terraform
terraform init     # Initialise providers (first time only)
terraform plan     # Preview changes
terraform apply    # Provision / update infrastructure
terraform destroy  # Tear down all infrastructure
terraform output   # Print resource outputs (IPs, endpoints)
```