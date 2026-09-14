from datetime import date, datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.schemas.base import BaseSchema


class JournalBase(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    name: str = Field(max_length=100, description="Journal name (e.g. 'Journal de vente')")
    code: str = Field(max_length=10, description="Journal code (e.g. 'JV')")
    type: str = Field(description="Journal type: sales, purchases, cash, bank, other")
    description: Optional[str] = Field(default=None, description="Optional description")

    @field_validator("type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        allowed = {"sales", "purchases", "cash", "bank", "other"}
        if v not in allowed:
            raise ValueError(f"type must be one of: {', '.join(allowed)}")
        return v

    @field_validator("code")
    @classmethod
    def validate_code(cls, v: str) -> str:
        return v.upper()


class JournalCreate(JournalBase):
    pass


class JournalUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: Optional[str] = Field(default=None, max_length=100)
    code: Optional[str] = Field(default=None, max_length=10)
    type: Optional[str] = Field(default=None)
    description: Optional[str] = None
    is_active: Optional[bool] = None

    @field_validator("type")
    @classmethod
    def validate_type(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            allowed = {"sales", "purchases", "cash", "bank", "other"}
            if v not in allowed:
                raise ValueError(f"type must be one of: {', '.join(allowed)}")
        return v

    @field_validator("code")
    @classmethod
    def validate_code(cls, v: Optional[str]) -> Optional[str]:
        return v.upper() if v else v


class JournalResponse(BaseSchema):
    id: UUID
    organization_id: UUID
    name: str
    code: str
    type: str
    description: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None


class TransactionEntryBase(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    journal_id: UUID
    entry_date: date
    description: str = Field(max_length=500, description="Entry description")
    reference: Optional[str] = Field(default=None, max_length=100, description="Entry reference")
    status: str = Field(default="draft", description="Entry status")

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = {"draft", "posted", "cancelled", "reconciled"}
        if v not in allowed:
            raise ValueError(f"status must be one of: {', '.join(allowed)}")
        return v


class TransactionEntryCreate(TransactionEntryBase):
    pass


class TransactionEntryUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    journal_id: Optional[UUID] = None
    entry_date: Optional[date] = None
    description: Optional[str] = Field(default=None, max_length=500)
    reference: Optional[str] = Field(default=None, max_length=100)
    status: Optional[str] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            allowed = {"draft", "posted", "cancelled", "reconciled"}
            if v not in allowed:
                raise ValueError(f"status must be one of: {', '.join(allowed)}")
        return v


class TransactionEntryResponse(BaseSchema):
    id: UUID
    organization_id: UUID
    journal_id: UUID
    entry_date: date
    description: str
    reference: Optional[str] = None
    status: str
    created_by: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None