from datetime import datetime
from decimal import Decimal
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.schemas.base import BaseResponse


class PaymentResponse(BaseResponse):
    organization_id: UUID
    invoice_id: UUID
    payment_method_id: UUID
    amount: Decimal
    currency: str
    payment_type: str
    status: str
    reference: Optional[str] = None
    payment_date: Optional[datetime] = None
    metadata_: Optional[dict[str, Any]] = None


class PaymentCreate(BaseModel):
    invoice_id: UUID
    payment_method_id: UUID
    amount: Decimal
    currency: str = "USD"
    payment_type: str = "invoice"
    reference: Optional[str] = None
    metadata_: Optional[dict[str, Any]] = None


class PaymentUpdate(BaseModel):
    reference: Optional[str] = None
    metadata_: Optional[dict[str, Any]] = None
