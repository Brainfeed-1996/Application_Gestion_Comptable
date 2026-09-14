from datetime import datetime
from decimal import Decimal
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.base import BaseResponse


class BalanceSheetTemplateResponse(BaseResponse):
    organization_id: Optional[UUID] = None
    name: str
    description: Optional[str] = None
    business_type: Optional[str] = None
    is_default: bool
    is_active: bool
    structure: dict[str, Any]


class BalanceSheetItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, arbitrary_types_allowed=True)

    id: UUID
    draft_id: UUID
    category: str
    account_code: str
    account_name: str
    amount: Decimal
    is_calculated: bool


class BalanceSheetDraftResponse(BaseResponse):
    organization_id: UUID
    template_id: Optional[UUID] = None
    name: str
    fiscal_year: int
    status: str
    data: dict[str, Any]
    calculated_totals: Optional[dict[str, Any]] = None
    finalized_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
    items: Optional[list[BalanceSheetItemResponse]] = None


class BalanceSheetDraftCreate(BaseModel):
    template_id: Optional[UUID] = None
    name: Optional[str] = None
    fiscal_year: Optional[int] = None
    data: dict[str, Any] = Field(default_factory=dict)


class BalanceSheetDraftUpdate(BaseModel):
    name: Optional[str] = None
    fiscal_year: Optional[int] = None
    status: Optional[str] = None
    data: Optional[dict[str, Any]] = None


class BalanceSheetQuickCreate(BaseModel):
    name: Optional[str] = None
    fiscal_year: Optional[int] = None
    data: dict[str, Any] = Field(default_factory=dict)


class BalanceSheetCalculatedResponse(BaseModel):
    totals: dict[str, Any]
    draft_id: Optional[UUID] = None
