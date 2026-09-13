from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator

from .base import BaseSchema


class InvoiceLineBase(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    description: str = Field(max_length=500)
    quantity: Decimal = Field(default=Decimal("1"), gt=0)
    unit_price: Decimal = Field(gt=0)
    discount_percent: Decimal = Field(default=Decimal("0"), ge=0, le=100)
    tax_rate: Decimal = Field(default=Decimal("0"), ge=0, le=100)
    account_id: Optional[UUID] = None

    @property
    def line_total(self) -> Decimal:
        return self.quantity * self.unit_price

    @property
    def discount_amount(self) -> Decimal:
        return self.line_total * (self.discount_percent / Decimal("100"))

    @property
    def taxable_amount(self) -> Decimal:
        return self.line_total - self.discount_amount

    @property
    def tax_amount(self) -> Decimal:
        return self.taxable_amount * (self.tax_rate / Decimal("100"))


class InvoiceLineCreate(InvoiceLineBase):
    pass


class InvoiceLineResponse(InvoiceLineBase):
    id: UUID
    invoice_id: UUID
    created_at: datetime
    updated_at: datetime


class InvoiceBase(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    customer_name: str = Field(max_length=255)
    customer_email: Optional[EmailStr] = None
    customer_address: Optional[str] = None
    customer_vat_number: Optional[str] = Field(default=None, max_length=20)
    issue_date: date
    due_date: date
    lines: list[InvoiceLineCreate] = Field(min_length=1)
    currency: str = Field(default="EUR", min_length=3, max_length=3)
    notes: Optional[str] = None
    terms: Optional[str] = None

    @field_validator("currency")
    @classmethod
    def validate_currency(cls, v: str) -> str:
        return v.upper()

    @model_validator(mode="after")
    def validate_dates(self) -> "InvoiceBase":
        if self.due_date < self.issue_date:
            raise ValueError("due_date cannot be before issue_date")
        return self


class InvoiceCreate(InvoiceBase):
    pass


class InvoiceUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    status: Optional[str] = None
    customer_name: Optional[str] = Field(default=None, max_length=255)
    customer_email: Optional[EmailStr] = None
    customer_address: Optional[str] = None
    customer_vat_number: Optional[str] = Field(default=None, max_length=20)
    notes: Optional[str] = None
    terms: Optional[str] = None


class InvoiceResponse(BaseSchema):
    organization_id: UUID
    invoice_number: str
    invoice_prefix: str
    status: str
    customer_name: str
    customer_email: Optional[str] = None
    customer_address: Optional[str] = None
    customer_vat_number: Optional[str] = None
    issue_date: date
    due_date: date
    paid_at: Optional[datetime] = None
    subtotal: Decimal
    discount_amount: Decimal
    tax_amount: Decimal
    total: Decimal
    total_paid: Decimal
    currency: str
    notes: Optional[str] = None
    terms: Optional[str] = None
    pdf_url: Optional[str] = None
    created_by: Optional[UUID] = None
    lines: list[InvoiceLineResponse] = []


class InvoicePay(BaseModel):
    model_config = ConfigDict(extra="forbid")

    payment_method_id: UUID
    amount: Decimal = Field(gt=0)
    currency: str = Field(default="EUR", min_length=3, max_length=3)

    @field_validator("currency")
    @classmethod
    def validate_currency(cls, v: str) -> str:
        return v.upper()


class InvoiceSend(BaseModel):
    model_config = ConfigDict(extra="forbid")

    recipient_email: EmailStr