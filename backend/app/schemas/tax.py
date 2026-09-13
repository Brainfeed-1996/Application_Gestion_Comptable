from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

from .base import BaseSchema


class TaxBase(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    name: str = Field(max_length=100)
    rate: Decimal = Field(ge=0, le=100, description="Tax rate percentage (0-100)")
    tax_type: str = Field(default="vat", description="Tax type: vat, gst, sst, other")
    country: Optional[str] = Field(default=None, min_length=2, max_length=2)
    is_default: bool = False

    @field_validator("tax_type")
    @classmethod
    def validate_tax_type(cls, v: str) -> str:
        allowed = {"vat", "gst", "sst", "other"}
        if v not in allowed:
            raise ValueError(f"tax_type must be one of: {', '.join(allowed)}")
        return v

    @field_validator("country")
    @classmethod
    def validate_country(cls, v: Optional[str]) -> Optional[str]:
        return v.upper() if v else v


class TaxCreate(TaxBase):
    pass


class TaxUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: Optional[str] = Field(default=None, max_length=100)
    rate: Optional[Decimal] = Field(default=None, ge=0, le=100)
    tax_type: Optional[str] = None
    is_active: Optional[bool] = None

    @field_validator("tax_type")
    @classmethod
    def validate_tax_type(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            allowed = {"vat", "gst", "sst", "other"}
            if v not in allowed:
                raise ValueError(f"tax_type must be one of: {', '.join(allowed)}")
        return v


class TaxResponse(BaseSchema):
    organization_id: UUID
    name: str
    rate: Decimal
    tax_type: str
    country: Optional[str] = None
    is_default: bool
    is_active: bool


class VATReportItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    category: str
    collected: Decimal
    deductible: Decimal


class VATReport(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    period_start: date
    period_end: date
    tax_collected: Decimal
    tax_deductible: Decimal
    tax_due: Decimal
    items: list[VATReportItem]