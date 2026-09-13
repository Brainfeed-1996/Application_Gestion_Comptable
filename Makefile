# Makefile - Application Comptable

.PHONY: dev build test lint deploy clean db-reset db-migrate db-backup db-seed logs help

# Help
help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Development
dev: ## Start development environment
	docker compose -f infra/docker/docker-compose.yml up --build -d
	docker compose -f infra/docker/docker-compose.yml logs -f backend

build: ## Build all Docker images
	docker compose -f infra/docker/docker-compose.yml build

# Testing
test: ## Run backend tests
	cd backend && python -m pytest tests/ -v --cov=app --cov-report=html

test-frontend: ## Run frontend tests
	cd frontend && npm test -- --coverage

test-all: test test-frontend ## Run all tests

# Linting
lint: ## Lint Python code
	cd backend && ruff check app/ && mypy app/

lint-frontend: ## Lint frontend code
	cd frontend && npm run lint && npm run typecheck

lint-all: lint lint-frontend ## Lint all code

# Deployment
deploy: ## Deploy to production
	docker compose -f infra/docker/docker-compose.yml up -d --remove-orphans

rollback: ## Rollback deployment
	docker compose -f infra/docker/docker-compose.yml down && docker compose -f infra/docker/docker-compose.yml up -d

# Database
db-reset: ## Reset database (destructive!)
	docker compose -f infra/docker/docker-compose.yml down -v
	docker compose -f infra/docker/docker-compose.yml up -d postgres redis
	sleep 5
	docker compose -f infra/docker/docker-compose.yml exec backend alembic upgrade head

db-migrate: ## Run database migrations
	docker compose -f infra/docker/docker-compose.yml exec backend alembic upgrade head

db-seed: ## Seed database with test data
	docker compose -f infra/docker/docker-compose.yml exec backend python -m app.db.seed

db-backup: ## Backup database
	bash infra/scripts/backup-db.sh

# Logs
logs: ## Follow logs
	docker compose -f infra/docker/docker-compose.yml logs -f --tail=100

logs-backend: ## Follow backend logs
	docker compose -f infra/docker/docker-compose.yml logs -f backend

logs-frontend: ## Follow frontend logs
	docker compose -f infra/docker/docker-compose.yml logs -f frontend

# Cleaning
clean: ## Clean all artifacts
	rm -rf backend/.pytest_cache backend/.mypy_cache backend/htmlcov
	rm -rf frontend/.next frontend/coverage frontend/.jest-cache
	docker compose -f infra/docker/docker-compose.yml down -v
