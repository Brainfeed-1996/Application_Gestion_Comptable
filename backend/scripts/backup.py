#!/usr/bin/env python3
"""Database backup script.

Creates a PostgreSQL dump, compresses it with gzip, saves it to the backup
directory, and removes backups older than the retention period.
"""

import os
import subprocess
import sys
from datetime import datetime, timedelta
from pathlib import Path

from app.config import settings

BACKUP_DIR = Path(os.environ.get("BACKUP_DIR", "backups"))
RETENTION_DAYS = int(os.environ.get("BACKUP_RETENTION_DAYS", "7"))


def parse_database_url(url: str) -> dict[str, str]:
    """Parse a postgresql:// or postgresql+asyncpg:// URL into pg_dump parts."""
    cleaned = url
    if "+asyncpg" in cleaned:
        cleaned = cleaned.replace("postgresql+asyncpg://", "postgresql://")
    if cleaned.startswith("postgresql://"):
        cleaned = cleaned[len("postgresql://"):]
    if "@" in cleaned:
        auth, hostpart = cleaned.split("@", 1)
    else:
        auth, hostpart = "", cleaned
    if ":" in auth:
        user, password = auth.split(":", 1)
    else:
        user, password = auth, ""
    if "/" in hostpart:
        hostport, dbname = hostpart.rsplit("/", 1)
    else:
        hostport, dbname = hostpart, ""
    if ":" in hostport:
        host, port = hostport.split(":", 1)
    else:
        host, port = hostport, "5432"
    return {
        "host": host or "localhost",
        "port": port or "5432",
        "user": user or "postgres",
        "password": password,
        "dbname": dbname or "postgres",
    }


def run_backup() -> Path:
    """Create a gzipped PostgreSQL dump and return the backup file path."""
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    parts = parse_database_url(settings.database_url)
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    filename = f"{parts['dbname']}_{timestamp}.sql.gz"
    backup_path = BACKUP_DIR / filename

    env = os.environ.copy()
    if parts["password"]:
        env["PGPASSWORD"] = parts["password"]

    cmd = [
        "pg_dump",
        "-h", parts["host"],
        "-p", parts["port"],
        "-U", parts["user"],
        "-d", parts["dbname"],
        "--format=c",
        "-f", "-",
    ]

    print(f"Starting backup to {backup_path}")
    with open(backup_path, "wb") as f:
        proc = subprocess.run(
            cmd,
            env=env,
            stdout=f,
            stderr=subprocess.PIPE,
            text=False,
        )
        if proc.returncode != 0:
            stderr = proc.stderr.decode("utf-8", errors="replace") if proc.stderr else ""
            raise RuntimeError(f"pg_dump failed: {stderr}")

    print(f"Backup completed: {backup_path} ({backup_path.stat().st_size} bytes)")
    return backup_path


def cleanup_old_backups() -> None:
    """Remove backups older than the retention period."""
    if not BACKUP_DIR.exists():
        return
    cutoff = datetime.utcnow() - timedelta(days=RETENTION_DAYS)
    removed = 0
    for entry in BACKUP_DIR.iterdir():
        if not entry.is_file():
            continue
        try:
            mtime = datetime.utcfromtimestamp(entry.stat().st_mtime)
            if mtime < cutoff:
                entry.unlink()
                removed += 1
                print(f"Removed old backup: {entry.name}")
        except OSError as exc:
            print(f"Warning: could not process {entry.name}: {exc}")
    print(f"Cleanup finished, removed {removed} file(s)")


def main() -> int:
    try:
        run_backup()
        cleanup_old_backups()
        return 0
    except Exception as exc:
        print(f"Backup failed: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())