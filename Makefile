# Makefile - Application Comptable

.PHONY: dev build test lint down help

# Help
help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Development
dev: ## Start development environment with Docker Compose
	docker compose -f infra/docker/docker-compose.yml up --build -d

# Build
build: ## Build all Docker images
	docker compose -f infra/docker/docker-compose.yml build

# Test
test: ## Run backend tests
	cd backend && python -m pytest tests/ -v --cov=app --cov-report=html

test-frontend: ## Run frontend tests
	cd frontend && npm test -- --coverage

test-all: test test-frontend ## Run all tests

# Lint
lint: ## Lint backend (ruff + mypy)
	cd backend && ruff check app/ && mypy app/

lint-frontend: ## Lint frontend (eslint + tsc)
	cd frontend && npm run lint && npx tsc --noEmit

lint-all: lint lint-frontend ## Lint all code

# Down
down: ## Stop and remove Docker Compose services
	docker compose -f infra/docker/docker-compose.yml down

down-v: ## Stop and remove Docker Compose services with volumes
	docker compose -f infra/docker/docker-compose.yml down -v

# Clean
clean: ## Clean all artifacts
	rm -rf backend/.pytest_cache backend/.mypy_cache backend/htmlcov
	rm -rf frontend/.next frontend/coverage frontend/.jest-cache
	docker compose -f infra/docker/docker-compose.yml down -v