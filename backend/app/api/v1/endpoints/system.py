from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.security import get_redis_client
from app.database import get_session
from app.models.user import User

router = APIRouter(prefix="/system", tags=["system"])


@router.get("/health/db")
async def check_database_health(
    db: AsyncSession = Depends(get_session),
):
    try:
        result = await db.execute(text("SELECT 1"))
        result.scalar()
        return {
            "status": "ok",
            "database": "connected",
            "checked_at": datetime.utcnow().isoformat(),
        }
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database unavailable: {exc}",
        )


@router.get("/health/redis")
async def check_redis_health():
    try:
        client = await get_redis_client()
        pong = await client.ping()
        return {
            "status": "ok" if pong else "error",
            "redis": "connected" if pong else "disconnected",
            "checked_at": datetime.utcnow().isoformat(),
        }
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Redis unavailable: {exc}",
        )


@router.get("/stats")
async def get_application_stats(
    current_user: User = Depends(lambda: None),
    db: AsyncSession = Depends(get_session),
):
    tables = ["users", "organizations", "accounts", "invoices", "transactions", "payments"]
    counts = {}
    for table in tables:
        try:
            result = await db.execute(text(f"SELECT count(*) FROM {table}"))
            counts[table] = result.scalar() or 0
        except Exception:
            counts[table] = 0

    return {
        "application": settings.project_name,
        "version": settings.version,
        "environment": settings.environment,
        "database": "connected",
        "tables": counts,
        "generated_at": datetime.utcnow().isoformat(),
    }


@router.post("/clear-cache")
async def clear_cache():
    try:
        client = await get_redis_client()
        await client.flushdb()
        return {"status": "ok", "message": "Cache cleared"}
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Failed to clear cache: {exc}",
        )


@router.get("/version")
async def get_version():
    return {
        "application": settings.project_name,
        "version": settings.version,
        "environment": settings.environment,
        "api_prefix": settings.api_prefix,
    }