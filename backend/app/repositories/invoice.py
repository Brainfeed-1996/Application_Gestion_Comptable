from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.invoice import Invoice
from app.schemas.invoice import InvoiceCreate, InvoiceUpdate


class InvoiceRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, invoice_id: UUID) -> Optional[Invoice]:
        result = await self.db.execute(
            select(Invoice).where(Invoice.id == invoice_id)
        )
        return result.scalar_one_or_none()

    async def list(
        self,
        organization_id: UUID,
        status: Optional[str] = None,
        page: int = 1,
        limit: int = 20,
    ) -> tuple[list[Invoice], int]:
        query = select(Invoice).where(Invoice.organization_id == organization_id)
        if status:
            query = query.where(Invoice.status == status)

        count_result = await self.db.execute(
            query.with_only_columns(select(Invoice.id).count()).order_by(None)
        )
        total = count_result.scalar() or 0

        invoices = await self.db.execute(
            query.order_by(Invoice.created_at.desc())
            .offset((page - 1) * limit)
            .limit(limit)
        )
        return invoices.scalars().all(), total

    async def create(self, organization_id: UUID, data: InvoiceCreate) -> Invoice:
        invoice = Invoice(
            organization_id=organization_id,
            number=data.number,
            currency=data.currency,
            status="draft",
            total=Decimal("0"),
            total_paid=Decimal("0"),
        )
        self.db.add(invoice)
        await self.db.flush()
        return invoice

    async def update(self, invoice: Invoice, data: InvoiceUpdate) -> Invoice:
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            if hasattr(invoice, key):
                setattr(invoice, key, value)
        await self.db.flush()
        return invoice

    async def update_status(self, invoice: Invoice, status: str) -> Invoice:
        invoice.status = status
        await self.db.flush()
        return invoice
