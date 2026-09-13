#!/bin/bash
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
S3_BUCKET="${S3_BUCKET:-}"
MINIO_ENDPOINT="${MINIO_ENDPOINT:-}"
MINIO_ACCESS_KEY="${MINIO_ACCESS_KEY:-}"
MINIO_SECRET_KEY="${MINIO_SECRET_KEY:-}"

POSTGRES_HOST="${POSTGRES_HOST:-postgres}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
POSTGRES_USER="${POSTGRES_USER:-app_user}"
POSTGRES_DB="${POSTGRES_DB:-app_db}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-}"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/app_db_${TIMESTAMP}.sql"
COMPRESSED_FILE="${BACKUP_FILE}.gz"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

error() {
    log "ERROR: $*" >&2
    exit 1
}

upload_to_minio() {
    local file=$1
    local object_name=$(basename "$file")

    if [[ -n "$MINIO_ENDPOINT" && -n "$MINIO_ACCESS_KEY" && -n "$MINIO_SECRET_KEY" ]]; then
        log "Uploading to MinIO..."
        docker run --rm \
            -e MC_HOST_minio="https://${MINIO_ACCESS_KEY}:${MINIO_SECRET_KEY}@${MINIO_ENDPOINT}" \
            -v "$(dirname "$file"):/data" \
            minio/mc cp "/data/${object_name}" "minio/${S3_BUCKET}/${object_name}"
        log "Upload to MinIO completed"
    fi
}

upload_to_s3() {
    local file=$1
    local object_name=$(basename "$file")

    if [[ -n "$S3_BUCKET" ]]; then
        log "Uploading to S3..."
        aws s3 cp "$file" "s3://${S3_BUCKET}/${object_name}"
        log "Upload to S3 completed"
    fi
}

cleanup_old_backups() {
    log "Cleaning up backups older than $RETENTION_DAYS days..."
    find "$BACKUP_DIR" -name "app_db_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete
    log "Cleanup completed"
}

main() {
    log "Starting database backup..."

    mkdir -p "$BACKUP_DIR"

    export PGPASSWORD="$POSTGRES_PASSWORD"

    log "Running pg_dump..."
    pg_dump -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
        --verbose --no-password --format=plain --no-owner --no-privileges > "$BACKUP_FILE"

    log "Compressing backup..."
    gzip "$BACKUP_FILE"

    log "Backup created: $COMPRESSED_FILE"

    upload_to_minio "$COMPRESSED_FILE"
    upload_to_s3 "$COMPRESSED_FILE"

    cleanup_old_backups

    log "Backup completed successfully"
}

main "$@"