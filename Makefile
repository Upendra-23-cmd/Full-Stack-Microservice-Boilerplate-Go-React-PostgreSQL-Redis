.PHONY: up down dev backend frontend logs

# Start full stack (production-like)
up:
	cp -n .env.example .env || true
	docker compose up --build -d

# Tear down
down:
	docker compose down -v

# Live reload: start infra, run Go + Vite locally
dev:
	docker compose up postgres redis -d
	$(MAKE) -j2 backend frontend

backend:
	cd backend && \
	DATABASE_URL="postgres://appuser:changeme_postgres@localhost:5432/appdb?sslmode=disable" \
	REDIS_URL="redis://:changeme_redis@localhost:6379/0" \
	JWT_SECRET="dev_secret_key" \
	go run ./cmd/server

frontend:
	cd frontend && npm install && npm run dev

logs:
	docker compose logs -f backend

# Run backend tests
test:
	cd backend && go test ./...
