from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.core.security import get_current_user
from app.models.user import User
from app.models.bilan_history import BilanHistory

router = APIRouter(prefix="/balance-history", tags=["balance-history"])


class BalanceHistoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    draft_id: UUID
    user_id: UUID | None
    field_changed: str
    old_value: dict | list | str | int | float | bool | None
    new_value: dict | list | str | int | float | bool | None
    created_at: str


@router.get("/{draft_id}", response_model=list[BalanceHistoryResponse])
async def get_draft_history(
    draft_id: UUID,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    """List all changes for a specific bilan draft"""
    offset = (page - 1) * limit
    stmt = (
        select(BilanHistory)
        .where(BilanHistory.draft_id == draft_id)
        .order_by(BilanHistory.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    result = await db.execute(stmt)
    history = result.scalars().all()
    return history


@router.get("/user/{user_id}", response_model=list[BalanceHistoryResponse])
async def get_user_history(
    user_id: UUID,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    """List all changes made by a specific user"""
    if current_user.id != user_id and not current_user.is_superuser:
        from fastapi import HTTPException
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this user's history")

    offset = (page - 1) * limit
    stmt = (
        select(BilanHistory)
        .where(BilanHistory.user_id == user_id)
        .order_by(BilanHistory.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    result = await db.execute(stmt)
    history = result.scalars().all()
    return history