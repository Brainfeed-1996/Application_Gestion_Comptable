.PHONY: help dev dev-logs dev-down build build-backend build-frontend test test-backend test-frontend test-coverage lint lint-backend lint-frontend db-migrate db-migrate-create db-reset db-seed db-backup db-restore deploy logs logs-backend logs-frontend clean clean-all

COMPOSE_FILE = docker-compose.yml
COMPOSE_PROD_FILE = infra/docker/docker-compose.prod.yml
COMPOSE_TEST_FILE = infra/docker/docker-compose.test.yml
ENV_FILE = .env

help:
	@echo "Application Comptable - Commandes disponibles:"
	@echo ""
	@echo "Développement:"
	@echo "  make dev              - Démarre l'environnement de développement"
	@echo "  make dev-logs         - Affiche les logs en temps réel"
	@echo "  make dev-down         - Arrête l'environnement de développement"
	@echo ""
	@echo "Build:"
	@echo "  make build            - Build toutes les images Docker"
	@echo "  make build-backend    - Build uniquement le backend"
	@echo "  make build-frontend   - Build uniquement le frontend"
	@echo ""
	@echo "Tests:"
	@echo "  make test             - Lance tous les tests"
	@echo "  make test-backend     - Tests backend uniquement"
	@echo "  make test-frontend    - Tests frontend uniquement"
	@echo "  make test-coverage    - Tests avec rapport de couverture"
	@echo ""
	@echo "Qualité de code:"
	@echo "  make lint             - Lance tous les linters"
	@echo "  make lint-backend     - Ruff + MyPy (backend)"
	@echo "  make lint-frontend    - ESLint + TypeScript check (frontend)"
	@echo ""
	@echo "Base de données:"
	@echo "  make db-migrate       - Applique les migrations Alembic"
	@echo "  make db-migrate-create MSG=\"message\" - Crée une nouvelle migration"
	@echo "  make db-reset         - Reset complet de la DB (ATTENTION: perte de données)"
	@echo "  make db-seed          - Insère les données de test"
	@echo "  make db-backup        - Sauvegarde de la DB"
	@echo "  make db-restore FILE=backup.sql.gz - Restaure une sauvegarde"
	@echo ""
	@echo "Déploiement:"
	@echo "  make deploy ENV=prod  - Déploie en production"
	@echo "  make deploy ENV=staging - Déploie en staging"
	@echo ""
	@echo "Utilitaires:"
	@echo "  make logs             - Affiche les logs de tous les services"
	@echo "  make logs-backend     - Logs backend uniquement"
	@echo "  make logs-frontend    - Logs frontend uniquement"
	@echo "  make clean            - Nettoie les conteneurs arrêtés et images non utilisées"
	@echo "  make clean-all        - Nettoyage complet (volumes, images, cache)"

dev:
	docker compose -f $(COMPOSE_FILE) --env-file $(ENV_FILE) up -d

dev-logs:
	docker compose -f $(COMPOSE_FILE) --env-file $(ENV_FILE) logs -f

dev-down:
	docker compose -f $(COMPOSE_FILE) --env-file $(ENV_FILE) down

build:
	docker compose -f $(COMPOSE_FILE) --env-file $(ENV_FILE) build

build-backend:
	docker compose -f $(COMPOSE_FILE) --env-file $(ENV_FILE) build backend

build-frontend:
	docker compose -f $(COMPOSE_FILE) --env-file $(ENV_FILE) build frontend

test:
	docker compose -f $(COMPOSE_TEST_FILE) up --build --abort-on-container-exit --exit-code-from test-runner
	docker compose -f $(COMPOSE_TEST_FILE) down -v

test-backend:
	docker compose -f $(COMPOSE_FILE) --env-file $(ENV_FILE) run --rm backend pytest -v

test-frontend:
	docker compose -f $(COMPOSE_FILE) --env-file $(ENV_FILE) run --rm frontend npm run test

test-coverage:
	docker compose -f $(COMPOSE_TEST_FILE) up --build --abort-on-container-exit --exit-code-from test-runner
	docker compose -f $(COMPOSE_TEST_FILE) down -v

lint: lint-backend lint-frontend

lint-backend:
	docker compose -f $(COMPOSE_FILE) --env-file $(ENV_FILE) run --rm backend ruff check .
	docker compose -f $(COMPOSE_FILE) --env-file $(ENV_FILE) run --rm backend ruff format --check .
	docker compose -f $(COMPOSE_FILE) --env-file $(ENV_FILE) run --rm backend mypy app

lint-frontend:
	docker compose -f $(COMPOSE_FILE) --env-file $(ENV_FILE) run --rm frontend npm run lint
	docker compose -f $(COMPOSE_FILE) --env-file $(ENV_FILE) run --rm frontend npm run type-check

db-migrate:
	docker compose -f $(COMPOSE_FILE) --env-file $(ENV_FILE) run --rm backend alembic upgrade head

db-migrate-create:
	@if [ -z "$(MSG)" ]; then echo "Usage: make db-migrate-create MSG=\"description\""; exit 1; fi
	docker compose -f $(COMPOSE_FILE) --env-file $(ENV_FILE) run --rm backend alembic revision --autogenerate -m "$(MSG)"

db-reset:
	@echo "ATTENTION: Cela va supprimer toutes les données!"
	@read -p "Êtes-vous sûr? (y/N) " -n 1 -r; echo; if [[ $$REPLY =~ ^[Yy]$$ ]]; then docker compose -f $(COMPOSE_FILE) --env-file $(ENV_FILE) down -v; docker compose -f $(COMPOSE_FILE) --env-file $(ENV_FILE) up -d postgres; sleep 5; make db-migrate; make db-seed; fi

db-seed:
	docker compose -f $(COMPOSE_FILE) --env-file $(ENV_FILE) run --rm backend python -m app.scripts.seed

db-backup:
	./infra/scripts/backup-db.sh

db-restore:
	@if [ -z "$(FILE)" ]; then echo "Usage: make db-restore FILE=backup.sql.gz"; exit 1; fi
	gunzip -c $(FILE) | docker compose -f $(COMPOSE_FILE) --env-file $(ENV_FILE) exec -T postgres psql -U ${POSTGRES_USER} -d ${POSTGRES_DB}

deploy:
	@if [ -z "$(ENV)" ]; then echo "Usage: make deploy ENV=prod|staging"; exit 1; fi
	./infra/scripts/deploy.sh $(ENV)

logs:
	docker compose -f $(COMPOSE_FILE) --env-file $(ENV_FILE) logs -f --tail=100

logs-backend:
	docker compose -f $(COMPOSE_FILE) --env-file $(ENV_FILE) logs -f --tail=100 backend

logs-frontend:
	docker compose -f $(COMPOSE_FILE) --env-file $(ENV_FILE) logs -f --tail=100 frontend

clean:
	docker compose -f $(COMPOSE_FILE) --env-file $(ENV_FILE) down --remove-orphans
	docker image prune -f

clean-all:
	docker compose -f $(COMPOSE_FILE) --env-file $(ENV_FILE) down -v --remove-orphans
	docker system prune -af --volumes