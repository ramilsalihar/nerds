.PHONY: help install backend frontend dev db-up db-down db-migrate db-studio stop lint test clean

help: ## Show this help
	@grep -E '^[a-zA-Z0-9_-]+:.*## ' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*## "}; {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'

install: ## Install deps for backend + frontend
	cd backend && npm install
	cd frontend && npm install

db-up: ## Start local Postgres (prisma dev, detached) — run once
	cd backend && npx prisma dev -d

db-down: ## Stop the local Postgres (prisma dev) server
	cd backend && npx prisma dev stop

db-migrate: ## Apply Prisma migrations to the local dev DB
	cd backend && set -a && . ./.env && set +a && npx prisma migrate dev

db-studio: ## Open Prisma Studio against the local dev DB
	cd backend && set -a && . ./.env && set +a && npx prisma studio

db-seed: ## Populate the local dev DB with test users/projects/donations
	cd backend && set -a && . ./.env && set +a && npm run db:seed

backend: ## Run the NestJS API in watch mode (needs `make db-up` first)
	cd backend && set -a && . ./.env && set +a && npm run start:dev

frontend: ## Run the Vite dev server
	cd frontend && npm run dev

dev: ## Run backend + frontend together (Ctrl+C stops both)
	@trap 'kill 0' EXIT INT TERM; \
	$(MAKE) backend & \
	$(MAKE) frontend & \
	wait

stop: ## Kill anything listening on the dev ports (3000, 5173)
	-lsof -ti:3000 -sTCP:LISTEN | xargs -r kill
	-lsof -ti:5173 -sTCP:LISTEN | xargs -r kill

lint: ## Lint backend + frontend
	cd backend && npm run lint
	cd frontend && npm run lint

test: ## Run backend tests
	cd backend && npm run test

clean: ## Remove build output
	rm -rf backend/dist frontend/dist
