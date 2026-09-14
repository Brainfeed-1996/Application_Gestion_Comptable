from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID, uuid4

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, JSONB
from sqlalchemy.orm import relationship

from app.models.base import Base


class BalanceSheetTemplate(Base):
    __tablename__ = "balance_sheet_templates"
    __allow_unmapped__ = True

    id: UUID = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    organization_id: Optional[UUID] = Column(
        PG_UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=True
    )
    name: str = Column(String(255), nullable=False)
    description: Optional[str] = Column(Text, nullable=True)
    business_type: Optional[str] = Column(String(50), nullable=True)
    is_default: bool = Column(Boolean, default=False, nullable=False)
    is_active: bool = Column(Boolean, default=True, nullable=False)
    structure: dict = Column(JSONB, nullable=False)


class BalanceSheetDraft(Base):
    __tablename__ = "balance_sheet_drafts"
    __allow_unmapped__ = True

    id: UUID = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    organization_id: UUID = Column(PG_UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    template_id: Optional[UUID] = Column(PG_UUID(as_uuid=True), ForeignKey("balance_sheet_templates.id"), nullable=True)
    name: str = Column(String(255), nullable=False)
    fiscal_year: int = Column(String(4), nullable=False)
    status: str = Column(String(20), default="draft", nullable=False)
    data: dict = Column(JSONB, default=dict, nullable=False)
    calculated_totals: Optional[dict] = Column(JSONB, nullable=True)
    finalized_at: Optional[datetime] = Column(DateTime(timezone=True), nullable=True)
    deleted_at: Optional[datetime] = Column(DateTime(timezone=True), nullable=True)

    items = relationship("BalanceSheetItem", back_populates="draft", cascade="all, delete-orphan")


class BalanceSheetItem(Base):
    __tablename__ = "balance_sheet_items"
    __allow_unmapped__ = True

    id: UUID = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    draft_id: UUID = Column(PG_UUID(as_uuid=True), ForeignKey("balance_sheet_drafts.id"), nullable=False)
    category: str = Column(String(20), nullable=False)
    account_code: str = Column(String(10), nullable=False)
    account_name: str = Column(String(255), nullable=False)
    amount: Decimal = Column(Numeric(15, 2), default=Decimal("0"), nullable=False)
    is_calculated: bool = Column(Boolean, default=False, nullable=False)

    draft = relationship("BalanceSheetDraft", back_populates="items")
