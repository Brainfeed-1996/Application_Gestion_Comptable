#!/bin/bash
set -euo pipefail

ENVIRONMENT="${1:-prod}"
COMPOSE_FILE="infra/docker/docker-compose.${ENVIRONMENT}.yml"
ENV_FILE=".env.${ENVIRONMENT}"
BACKUP_DIR="/tmp/deploy_backup_$(date +%Y%m%d_%H%M%S)"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

error() {
    log "ERROR: $*" >&2
}

cleanup() {
    local exit_code=$?
    if [[ $exit_code -ne 0 ]]; then
        log "Deployment failed, attempting rollback..."
        rollback
    fi
    exit $exit_code
}

trap cleanup EXIT

rollback() {
    log "Rolling back to previous version..."
    if [[ -d "$BACKUP_DIR" ]]; then
        docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down
        docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d
        log "Rollback completed"
    else
        log "No backup found, manual intervention required"
    fi
}

health_check() {
    local service=$1
    local url=$2
    local max_attempts=30
    local attempt=1

    log "Checking health of $service..."
    while [[ $attempt -le $max_attempts ]]; do
        if curl -f -s "$url" > /dev/null 2>&1; then
            log "$service is healthy"
            return 0
        fi
        log "Attempt $attempt/$max_attempts: $service not ready yet..."
        sleep 2
        ((attempt++))
    done
    error "$service health check failed after $max_attempts attempts"
    return 1
}

main() {
    log "Starting deployment for environment: $ENVIRONMENT"

    if [[ ! -f "$COMPOSE_FILE" ]]; then
        error "Compose file not found: $COMPOSE_FILE"
        exit 1
    fi

    if [[ ! -f "$ENV_FILE" ]]; then
        error "Environment file not found: $ENV_FILE"
        exit 1
    fi

    mkdir -p "$BACKUP_DIR"

    log "Pulling latest images..."
    docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" pull

    log "Running database migrations..."
    docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" run --rm backend alembic upgrade head

    log "Stopping old containers..."
    docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down --remove-orphans

    log "Starting new containers..."
    docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d

    log "Waiting for services to be healthy..."
    sleep 10

    health_check "backend" "http://localhost:8000/health"
    health_check "frontend" "http://localhost:3000"
    health_check "nginx" "http://localhost/health"

    log "Cleaning up old images..."
    docker image prune -f

    log "Deployment completed successfully!"
}

main "$@"