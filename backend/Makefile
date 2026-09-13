.PHONY: dev build test lint deploy clean db-migrate db-backup

dev:
	docker compose -f ../infra/docker/docker-compose.yml up --build -d

build:
	docker compose -f ../infra/docker/docker-compose.yml build

test:
	pytest tests/ -v --cov=app

lint:
	ruff check app/ && mypy app/

deploy:
	docker compose -f ../infra/docker/docker-compose.yml up -d

clean:
	rm -rf .pytest_cache .mypy_cache htmlcov __pycache__

db-migrate:
	docker compose -f ../infra/docker/docker-compose.yml exec backend alembic upgrade head

db-backup:
	bash ../infra/scripts/backup-db.sh
