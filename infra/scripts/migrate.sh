#!/bin/bash
set -euo pipefail

COMPOSE_FILE="${COMPOSE_FILE:-infra/docker/docker-compose.yml}"
ENV_FILE="${ENV_FILE:-.env}"
TARGET="${1:-head}"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

error() {
    log "ERROR: $*" >&2
    exit 1
}

main() {
    log "Running migrations to: $TARGET"

    if [[ ! -f "$COMPOSE_FILE" ]]; then
        error "Compose file not found: $COMPOSE_FILE"
    fi

    if [[ ! -f "$ENV_FILE" ]]; then
        error "Environment file not found: $ENV_FILE"
    fi

    case "$TARGET" in
        head)
            log "Upgrading to latest migration..."
            docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" run --rm backend alembic upgrade head
            ;;
        current)
            log "Showing current migration..."
            docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" run --rm backend alembic current
            ;;
        history)
            log "Showing migration history..."
            docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" run --rm backend alembic history
            ;;
        downgrade)
            TARGET_REV="${2:- -1}"
            log "Downgrading to revision: $TARGET_REV"
            docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" run --rm backend alembic downgrade "$TARGET_REV"
            ;;
        revision)
            MESSAGE="${2:-Auto migration}"
            log "Creating new revision: $MESSAGE"
            docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" run --rm backend alembic revision --autogenerate -m "$MESSAGE"
            ;;
        *)
            log "Upgrading to specific revision: $TARGET"
            docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" run --rm backend alembic upgrade "$TARGET"
            ;;
    esac

    log "Migration completed successfully"
}

main "$@"