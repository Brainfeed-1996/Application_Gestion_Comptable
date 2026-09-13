from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import Any
from uuid import UUID, uuid4

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    func,
    text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, utc_now


class AccountCategory(Base):
    __tablename__ = "account_categories"

    __table_args__ = (
        Index("idx_account_categories_org", "organization_id"),
        Index("idx_account_categories_parent", "parent_id"),
        Index("idx_account_categories_type", "organization_id", "type"),
        CheckConstraint(
            "type IN ('asset', 'liability', 'equity', 'revenue', 'expense')",
            name="ck_account_categories_type",
        ),
    )

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, default=uuid4, server_default=text("gen_random_uuid()")
    )
    organization_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False
    )
    parent_id: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("account_categories.id", ondelete="CASCADE")
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    code: Mapped[str | None] = mapped_column(String(10))
    type: Mapped[str] = mapped_column(String(20), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, server_default=text("true")
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=utc_now,
        onupdate=utc_now,
        server_default=func.now(),
    )

    organization: Mapped[Organization] = relationship(back_populates="account_categories")
    parent: Mapped[AccountCategory | None] = relationship(
        back_populates="children", remote_side="AccountCategory.id"
    )
    children: Mapped[list[AccountCategory]] = relationship(back_populates="parent")
    chart_accounts: Mapped[list[ChartOfAccount]] = relationship(back_populates="category")


class ChartOfAccount(Base):
    __tablename__ = "chart_of_accounts"

    __table_args__ = (
        Index("idx_chart_accounts_org", "organization_id"),
        Index("idx_chart_accounts_number", "organization_id", "account_number"),
        Index("idx_chart_accounts_parent", "parent_account_id"),
        Index("idx_chart_accounts_type", "organization_id", "type"),
        CheckConstraint(
            "type IN ('asset', 'liability', 'equity', 'revenue', 'expense')",
            name="ck_chart_accounts_type",
        ),
    )

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, default=uuid4, server_default=text("gen_random_uuid()")
    )
    organization_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False
    )
    account_number: Mapped[str] = mapped_column(String(20), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    category_id: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("account_categories.id", ondelete="SET NULL")
    )
    type: Mapped[str] = mapped_column(String(20), nullable=False)
    parent_account_id: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("chart_of_accounts.id", ondelete="CASCADE")
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, server_default=text("true")
    )
    is_system: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default=text("false")
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=utc_now,
        onupdate=utc_now,
        server_default=func.now(),
    )

    organization: Mapped[Organization] = relationship(back_populates="chart_accounts")
    category: Mapped[AccountCategory | None] = relationship(back_populates="chart_accounts")
    parent: Mapped[ChartOfAccount | None] = relationship(
        back_populates="children", remote_side="ChartOfAccount.id"
    )
    children: Mapped[list[ChartOfAccount]] = relationship(back_populates="parent")
    accounts: Mapped[list[Account]] = relationship(back_populates="chart_account")


class Account(Base):
    __tablename__ = "accounts"

    __table_args__ = (
        Index("idx_accounts_org", "organization_id"),
        Index("idx_accounts_type", "organization_id", "account_type"),
        Index("idx_accounts_active", "organization_id", postgresql_where=text("is_active = true")),
        Index("idx_accounts_external", "external_id"),
        Index("idx_accounts_chart", "chart_account_id"),
        CheckConstraint(
            "account_type IN ('bank', 'cash', 'credit_card', 'paypal', 'crypto', 'other')",
            name="ck_accounts_account_type",
        ),
        CheckConstraint("currency ~ '^[A-Z]{3}$'", name="ck_accounts_currency"),
    )

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, default=uuid4, server_default=text("gen_random_uuid()")
    )
    organization_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False
    )
    chart_account_id: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("chart_of_accounts.id", ondelete="SET NULL")
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    account_type: Mapped[str] = mapped_column(String(30), nullable=False)
    iban: Mapped[str | None] = mapped_column(String(34))
    bic: Mapped[str | None] = mapped_column(String(11))
    bank_name: Mapped[str | None] = mapped_column(String(100))
    account_number: Mapped[str | None] = mapped_column(String(50))
    currency: Mapped[str] = mapped_column(
        String(3), nullable=False, default="EUR", server_default=text("'EUR'")
    )
    current_balance: Mapped[Decimal] = mapped_column(
        Numeric(15, 2), nullable=False, default=Decimal("0"), server_default=text("0")
    )
    opening_balance: Mapped[Decimal] = mapped_column(
        Numeric(15, 2), nullable=False, default=Decimal("0"), server_default=text("0")
    )
    opening_date: Mapped[date | None] = mapped_column(Date)
    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, server_default=text("true")
    )
    is_archived: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default=text("false")
    )
    external_id: Mapped[str | None] = mapped_column(String(100))
    metadata_: Mapped[dict[str, Any] | None] = mapped_column("metadata", JSONB)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=utc_now,
        onupdate=utc_now,
        server_default=func.now(),
    )
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    organization: Mapped[Organization] = relationship(back_populates="accounts")
    chart_account: Mapped[ChartOfAccount | None] = relationship(back_populates="accounts")
    transactions: Mapped[list[Transaction]] = relationship(
        back_populates="account", passive_deletes=True
    )
    recurring_expenses: Mapped[list[RecurringExpense]] = relationship(
        back_populates="account", passive_deletes=True
    )
    cash_flow_projections: Mapped[list[CashFlowProjection]] = relationship(
        back_populates="account", passive_deletes=True
    )
    ocr_jobs: Mapped[list[OCRJob]] = relationship(back_populates="account", passive_deletes=True)
    quote_items: Mapped[list[QuoteItem]] = relationship(back_populates="account", passive_deletes=True)
    bank_connection_links: Mapped[list[BankConnectionAccount]] = relationship(
        back_populates="account", cascade="all, delete-orphan", passive_deletes=True
    )
