from datetime import datetime
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.core.security import get_current_user
from app.models.journal import Journal, TransactionEntry
from app.models.user import User
from app.schemas.journal import (
    JournalCreate,
    JournalResponse,
    JournalUpdate,
    TransactionEntryCreate,
    TransactionEntryResponse,
    TransactionEntryUpdate,
)

router = APIRouter(prefix="/journals", tags=["journals"])


@router.get("/", response_model=list[JournalResponse])
async def list_journals(
    journal_type: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    query = select(Journal).where(Journal.organization_id == current_user.organization_id)
    if journal_type:
        query = query.where(Journal.type == journal_type)
    if is_active is not None:
        query = query.where(Journal.is_active == is_active)
    query = query.order_by(Journal.created_at.desc()).offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/", response_model=JournalResponse, status_code=status.HTTP_201_CREATED)
async def create_journal(
    data: JournalCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    journal = Journal(
        organization_id=current_user.organization_id,
        name=data.name,
        code=data.code,
        type=data.type,
        description=data.description,
    )
    db.add(journal)
    await db.flush()
    await db.refresh(journal)
    return journal


@router.get("/{journal_id}", response_model=JournalResponse)
async def get_journal(
    journal_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    result = await db.execute(
        select(Journal).where(
            Journal.id == journal_id,
            Journal.organization_id == current_user.organization_id,
        )
    )
    journal = result.scalar_one_or_none()
    if not journal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Journal not found",
        )
    return journal


@router.put("/{journal_id}", response_model=JournalResponse)
async def update_journal(
    journal_id: UUID,
    data: JournalUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    result = await db.execute(
        select(Journal).where(
            Journal.id == journal_id,
            Journal.organization_id == current_user.organization_id,
        )
    )
    journal = result.scalar_one_or_none()
    if not journal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Journal not found",
        )
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(journal, field, value)
    await db.flush()
    await db.refresh(journal)
    return journal


@router.delete("/{journal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_journal(
    journal_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    result = await db.execute(
        select(Journal).where(
            Journal.id == journal_id,
            Journal.organization_id == current_user.organization_id,
        )
    )
    journal = result.scalar_one_or_none()
    if not journal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Journal not found",
        )
    journal.is_active = False
    await db.flush()


@router.get("/{journal_id}/entries", response_model=list[TransactionEntryResponse])
async def list_entries(
    journal_id: UUID,
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    journal_result = await db.execute(
        select(Journal).where(
            Journal.id == journal_id,
            Journal.organization_id == current_user.organization_id,
        )
    )
    if not journal_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Journal not found",
        )

    query = select(TransactionEntry).where(
        TransactionEntry.journal_id == journal_id,
        TransactionEntry.organization_id == current_user.organization_id,
    )
    if status:
        query = query.where(TransactionEntry.status == status)
    query = (
        query.order_by(TransactionEntry.entry_date.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    )
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/{journal_id}/entries", response_model=TransactionEntryResponse, status_code=status.HTTP_201_CREATED)
async def create_entry(
    journal_id: UUID,
    data: TransactionEntryCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    journal_result = await db.execute(
        select(Journal).where(
            Journal.id == journal_id,
            Journal.organization_id == current_user.organization_id,
        )
    )
    if not journal_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Journal not found",
        )

    entry = TransactionEntry(
        organization_id=current_user.organization_id,
        journal_id=journal_id,
        entry_date=data.entry_date,
        description=data.description,
        reference=data.reference,
        status=data.status,
        created_by=current_user.id,
    )
    db.add(entry)
    await db.flush()
    await db.refresh(entry)
    return entry


@router.put("/entries/{entry_id}", response_model=TransactionEntryResponse)
async def update_entry(
    entry_id: UUID,
    data: TransactionEntryUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    result = await db.execute(
        select(TransactionEntry).where(
            TransactionEntry.id == entry_id,
            TransactionEntry.organization_id == current_user.organization_id,
        )
    )
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction entry not found",
        )
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(entry, field, value)
    await db.flush()
    await db.refresh(entry)
    return entry


@router.delete("/entries/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_entry(
    entry_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    result = await db.execute(
        select(TransactionEntry).where(
            TransactionEntry.id == entry_id,
            TransactionEntry.organization_id == current_user.organization_id,
        )
    )
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction entry not found",
        )
    entry.deleted_at = datetime.utcnow()
    await db.flush()