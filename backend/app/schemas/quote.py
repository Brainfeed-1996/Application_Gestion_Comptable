from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator

from .base import BaseSchema
from .invoice import InvoiceLineCreate, InvoiceLineResponse


class QuoteBase(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    customer_name: str = Field(max_length=255)
    customer_email: Optional[EmailStr] = None
    customer_address: Optional[str] = None
    customer_vat_number: Optional[str] = Field(default=None, max_length=20)
    issue_date: date
    valid_until: date
    lines: list[InvoiceLineCreate] = Field(min_length=1)
    currency: str = Field(default="EUR", min_length=3, max_length=3)
    notes: Optional[str] = None
    terms: Optional[str] = None

    @field_validator("currency")
    @classmethod
    def validate_currency(cls, v: str) -> str:
        return v.upper()

    @model_validator(mode="after")
    def validate_dates(self) -> "QuoteBase":
        if self.valid_until < self.issue_date:
            raise ValueError("valid_until cannot be before issue_date")
        return self


class QuoteCreate(QuoteBase):
    pass


class QuoteUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    status: Optional[str] = None
    customer_name: Optional[str] = Field(default=None, max_length=255)
    customer_email: Optional[EmailStr] = None
    customer_address: Optional[str] = None
    customer_vat_number: Optional[str] = Field(default=None, max_length=20)
    notes: Optional[str] = None
    terms: Optional[str] = None


class QuoteResponse(BaseSchema):
    organization_id: UUID
    quote_number: str
    status: str
    customer_name: str
    customer_email: Optional[str] = None
    customer_address: Optional[str] = None
    customer_vat_number: Optional[str] = None
    issue_date: date
    valid_until: date
    subtotal: Decimal
    discount_amount: Decimal
    tax_amount: Decimal
    total: Decimal
    currency: str
    notes: Optional[str] = None
    terms: Optional[str] = None
    pdf_url: Optional[str] = None
    converted_to_invoice_id: Optional[UUID] = None
    lines: list[InvoiceLineResponse] = []