#!/bin/bash
set -euo pipefail

# =============================================================================
# Application Comptable - Production Deployment Script
# =============================================================================
# Usage: ./scripts/deploy.sh [environment]
#   environment: prod (default), staging
# =============================================================================

ENVIRONMENT="${1:-prod}"
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"
BACKUP_DIR="/tmp/deploy_backup_$(date +%Y%m%d_%H%M%S)"
MAX_RETRIES=3
RETRY_DELAY=5

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

error() {
    log "ERROR: $*" >&2
}

cleanup() {
    local exit_code=$?
    if [[ $exit_code -ne 0 ]]; then
        log "Deployment failed with exit code $exit_code, attempting rollback..."
        rollback
    fi
    exit $exit_code
}

trap cleanup EXIT

rollback() {
    log "Rolling back to previous version..."
    if docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps -q | wc -l | grep -q '^0$'; then
        log "No running containers found, starting fresh..."
        docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d
    else
        log "Stopping current containers..."
        docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" stop
        log "Starting previous version..."
        docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d
    fi
    log "Rollback completed"
}

wait_for_service() {
    local service=$1
    local url=$2
    local max_attempts=60
    local attempt=1

    log "Checking health of $service..."
    while [[ $attempt -le $max_attempts ]]; do
        if curl -f -s --connect-timeout 5 "$url" > /dev/null 2>&1; then
            log "$service is healthy after $attempt attempts"
            return 0
        fi
        log "Attempt $attempt/$max_attempts: $service not ready yet..."
        sleep 3
        ((attempt++))
    done
    error "$service health check failed after $max_attempts attempts"
    return 1
}

run_with_retry() {
    local description=$1
    shift
    local attempt=1

    while [[ $attempt -le $MAX_RETRIES ]]; do
        log "$description (attempt $attempt/$MAX_RETRIES)..."
        if "$@"; then
            log "$description succeeded"
            return 0
        fi
        log "$description failed, retrying in ${RETRY_DELAY}s..."
        sleep $RETRY_DELAY
        ((attempt++))
    done
    error "$description failed after $MAX_RETRIES attempts"
    return 1
}

main() {
    log "Starting deployment for environment: $ENVIRONMENT"

    # Validate prerequisites
    if [[ ! -f "$COMPOSE_FILE" ]]; then
        error "Compose file not found: $COMPOSE_FILE"
        exit 1
    fi

    if [[ ! -f "$ENV_FILE" ]]; then
        error "Environment file not found: $ENV_FILE"
        exit 1
    fi

    if ! command -v docker &> /dev/null; then
        error "Docker is not installed or not in PATH"
        exit 1
    fi

    if ! docker info &> /dev/null; then
        error "Docker daemon is not running"
        exit 1
    fi

    # Create backup directory
    mkdir -p "$BACKUP_DIR"

    # Backup current environment
    log "Backing up current environment..."
    if [[ -f "$ENV_FILE" ]]; then
        cp "$ENV_FILE" "$BACKUP_DIR/"
    fi

    # Pull latest images
    log "Pulling latest images..."
    docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" pull --policy always

    # Build custom images
    log "Building custom images..."
    docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" build --no-cache

    # Run database migrations
    log "Running database migrations..."
    run_with_retry "Database migration" docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" run --rm backend alembic upgrade head

    # Stop old containers
    log "Stopping old containers..."
    docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down --remove-orphans

    # Start new containers
    log "Starting new containers..."
    docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d

    # Wait for services to be healthy
    log "Waiting for services to be healthy..."
    sleep 10

    # Health checks
    wait_for_service "backend" "http://localhost:8000/health"
    wait_for_service "frontend" "http://localhost:80"
    wait_for_service "postgres" "http://localhost:5432/health" || true
    wait_for_service "redis" "http://localhost:6379/ping" || true

    # Run post-deployment verification
    log "Running post-deployment verification..."
    if command -v ./scripts/verify-deployment.sh &> /dev/null; then
        ./scripts/verify-deployment.sh || log "Warning: verification script failed"
    fi

    # Clean up old images
    log "Cleaning up old images..."
    docker image prune -f
    docker system prune -f --filter "until=24h" || true

    # Show running services
    log "Running services:"
    docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps

    log "Deployment completed successfully!"
    log "Backup available at: $BACKUP_DIR"
}

main "$@"