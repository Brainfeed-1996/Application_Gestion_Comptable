from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

from .base import BaseSchema


class PaymentBase(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    invoice_id: Optional[UUID] = None
    subscription_id: Optional[UUID] = None
    payment_method_id: UUID
    amount: Decimal = Field(gt=0)
    currency: str = Field(default="EUR", min_length=3, max_length=3)
    payment_type: str = Field(description="invoice, subscription, one_time, refund")
    payment_date: Optional[datetime] = None

    @field_validator("payment_type")
    @classmethod
    def validate_payment_type(cls, v: str) -> str:
        allowed = {"invoice", "subscription", "one_time", "refund"}
        if v not in allowed:
            raise ValueError(f"payment_type must be one of: {', '.join(allowed)}")
        return v

    @field_validator("currency")
    @classmethod
    def validate_currency(cls, v: str) -> str:
        return v.upper()

    @field_validator("subscription_id")
    @classmethod
    def validate_either_id(cls, v: Optional[UUID], info) -> Optional[UUID]:
        if v is None and info.data.get("invoice_id") is None:
            raise ValueError("Either invoice_id or subscription_id must be provided")
        return v


class PaymentCreate(PaymentBase):
    pass


class PaymentResponse(BaseSchema):
    organization_id: UUID
    invoice_id: Optional[UUID] = None
    subscription_id: Optional[UUID] = None
    payment_method_id: UUID
    amount: Decimal
    currency: str
    exchange_rate: Decimal
    amount_base: Decimal
    status: str
    payment_type: str
    payment_date: datetime
    external_id: Optional[str] = None
    external_status: Optional[str] = None
    failure_reason: Optional[str] = None
    metadata: Optional[dict] = None