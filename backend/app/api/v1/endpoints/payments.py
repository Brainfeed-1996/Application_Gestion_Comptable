from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.core.security import get_current_user
from app.models.user import User
from app.repositories.payment import PaymentRepository
from app.schemas.payment import (
    PaymentResponse,
    PaymentCreate,
)

router = APIRouter(prefix="/payments", tags=["payments"])


@router.get("/", response_model=list[PaymentResponse])
async def list_payments(
    invoice_id: Optional[UUID] = Query(None),
    status: Optional[str] = Query(None),
    payment_type: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    repo = PaymentRepository(db)
    payments, total = await repo.list(
        organization_id=current_user.organization_id,
        invoice_id=invoice_id,
        status=status,
        payment_type=payment_type,
        page=page,
        limit=limit,
    )
    return payments


@router.post("/", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
async def create_payment(
    data: PaymentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    repo = PaymentRepository(db)
    payment = await repo.create(current_user.organization_id, data)
    return payment
