from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.schemas.base import BaseResponse


class InvoiceResponse(BaseResponse):
    organization_id: UUID
    number: Optional[str] = None
    status: str
    total: Decimal
    total_paid: Decimal = Decimal("0")
    currency: str = "USD"
    paid_at: Optional[datetime] = None


class InvoiceCreate(BaseModel):
    number: Optional[str] = None
    currency: str = "USD"
    items: Optional[list[dict]] = None


class InvoiceUpdate(BaseModel):
    number: Optional[str] = None
    currency: Optional[str] = None
    items: Optional[list[dict]] = None


class InvoiceStatusUpdate(BaseModel):
    status: str
