from decimal import Decimal
from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.payment import Payment
from app.schemas.payment import PaymentCreate


class PaymentRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, payment_id: UUID) -> Optional[Payment]:
        result = await self.db.execute(
            select(Payment).where(Payment.id == payment_id)
        )
        return result.scalar_one_or_none()

    async def list(
        self,
        organization_id: UUID,
        invoice_id: Optional[UUID] = None,
        status: Optional[str] = None,
        payment_type: Optional[str] = None,
        page: int = 1,
        limit: int = 20,
    ) -> tuple[list[Payment], int]:
        query = select(Payment).where(Payment.organization_id == organization_id)
        if invoice_id:
            query = query.where(Payment.invoice_id == invoice_id)
        if status:
            query = query.where(Payment.status == status)
        if payment_type:
            query = query.where(Payment.payment_type == payment_type)

        count_result = await self.db.execute(
            query.with_only_columns(select(Payment.id).count()).order_by(None)
        )
        total = count_result.scalar() or 0

        payments = await self.db.execute(
            query.order_by(Payment.created_at.desc())
            .offset((page - 1) * limit)
            .limit(limit)
        )
        return payments.scalars().all(), total

    async def create(self, organization_id: UUID, data: PaymentCreate) -> Payment:
        payment = Payment(
            organization_id=organization_id,
            invoice_id=data.invoice_id,
            payment_method_id=data.payment_method_id,
            amount=data.amount,
            currency=data.currency,
            payment_type=data.payment_type,
            status="pending",
            reference=data.reference,
            metadata_=data.metadata_ or {},
        )
        self.db.add(payment)
        await self.db.flush()
        return payment
