from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from .base import BaseSchema


class TransactionBase(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    account_id: UUID
    category_id: Optional[UUID] = None
    counterparty: Optional[str] = Field(default=None, max_length=255)
    reference: Optional[str] = Field(default=None, max_length=255)
    label: str = Field(max_length=500, description="Transaction label")
    description: Optional[str] = None
    amount: Decimal = Field(gt=0, description="Transaction amount (positive)")
    currency: str = Field(default="EUR", min_length=3, max_length=3)
    direction: str = Field(description="debit or credit")
    transaction_date: date
    value_date: Optional[date] = None

    @field_validator("direction")
    @classmethod
    def validate_direction(cls, v: str) -> str:
        if v not in ("debit", "credit"):
            raise ValueError("direction must be 'debit' or 'credit'")
        return v

    @field_validator("currency")
    @classmethod
    def validate_currency(cls, v: str) -> str:
        return v.upper()

    @model_validator(mode="after")
    def validate_value_date(self) -> "TransactionBase":
        if self.value_date and self.value_date < self.transaction_date:
            raise ValueError("value_date cannot be before transaction_date")
        return self


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    label: Optional[str] = Field(default=None, max_length=500)
    description: Optional[str] = None
    amount: Optional[Decimal] = Field(default=None, gt=0)
    category_id: Optional[UUID] = None
    reference: Optional[str] = Field(default=None, max_length=255)


class TransactionResponse(BaseSchema):
    organization_id: UUID
    account_id: UUID
    category_id: Optional[UUID] = None
    counterparty: Optional[str] = None
    reference: Optional[str] = None
    label: str
    description: Optional[str] = None
    amount: Decimal
    currency: str
    exchange_rate: Decimal
    direction: str
    transaction_date: date
    value_date: Optional[date] = None
    booking_date: date
    status: str
    source: str
    external_id: Optional[str] = None
    metadata: Optional[dict] = None
    created_by: Optional[UUID] = None


class TransactionBulkImport(BaseModel):
    model_config = ConfigDict(extra="forbid")

    file_data: list[TransactionCreate]


class TransactionReconcile(BaseModel):
    model_config = ConfigDict(extra="forbid")

    transaction_ids: list[UUID]
    matched_ids: list[UUID]

    @model_validator(mode="after")
    def validate_lists(self) -> "TransactionReconcile":
        if len(self.transaction_ids) != len(self.matched_ids):
            raise ValueError("transaction_ids and matched_ids must have the same length")
        return self