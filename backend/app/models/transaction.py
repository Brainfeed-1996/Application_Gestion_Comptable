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


class TransactionCategory(Base):
    __tablename__ = "transaction_categories"

    __table_args__ = (
        Index("idx_transaction_categories_org", "organization_id"),
        Index("idx_transaction_categories_parent", "parent_id"),
        Index("idx_transaction_categories_type", "organization_id", "type"),
        CheckConstraint("type IN ('income', 'expense')", name="ck_transaction_categories_type"),
    )

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, default=uuid4, server_default=text("gen_random_uuid()")
    )
    organization_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False
    )
    parent_id: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("transaction_categories.id", ondelete="CASCADE")
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    code: Mapped[str | None] = mapped_column(String(20))
    type: Mapped[str] = mapped_column(String(10), nullable=False)
    color: Mapped[str | None] = mapped_column(String(7))
    icon: Mapped[str | None] = mapped_column(String(50))
    is_system: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default=text("false")
    )
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

    organization: Mapped[Organization] = relationship(back_populates="transaction_categories")
    parent: Mapped[TransactionCategory | None] = relationship(
        back_populates="children", remote_side="TransactionCategory.id"
    )
    children: Mapped[list[TransactionCategory]] = relationship(back_populates="parent")
    transactions: Mapped[list[Transaction]] = relationship(back_populates="category")
    recurring_expenses: Mapped[list[RecurringExpense]] = relationship(back_populates="category")


class OCRJob(Base):
    __tablename__ = "ocr_jobs"

    __table_args__ = (
        Index("idx_ocr_jobs_org", "organization_id"),
        Index("idx_ocr_jobs_account", "account_id"),
        Index("idx_ocr_jobs_connection", "bank_connection_id"),
        Index("idx_ocr_jobs_status", "organization_id", "status"),
        CheckConstraint(
            "status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')",
            name="ck_ocr_jobs_status",
        ),
        CheckConstraint(
            "source_type IN ('pdf', 'image', 'bank_statement', 'invoice', 'receipt')",
            name="ck_ocr_jobs_source_type",
        ),
    )

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, default=uuid4, server_default=text("gen_random_uuid()")
    )
    organization_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False
    )
    account_id: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("accounts.id", ondelete="SET NULL")
    )
    bank_connection_id: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("bank_connections.id", ondelete="SET NULL")
    )
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="pending", server_default=text("'pending'")
    )
    source_type: Mapped[str] = mapped_column(String(30), nullable=False)
    file_name: Mapped[str | None] = mapped_column(String(255))
    file_path: Mapped[str | None] = mapped_column(Text)
    ocr_engine: Mapped[str | None] = mapped_column(String(50))
    extracted_data: Mapped[dict[str, Any] | None] = mapped_column(JSONB)
    confidence_score: Mapped[Decimal | None] = mapped_column(Numeric(5, 2))
    retry_count: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0, server_default=text("0")
    )
    max_retries: Mapped[int] = mapped_column(
        Integer, nullable=False, default=3, server_default=text("3")
    )
    processed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
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

    organization: Mapped[Organization] = relationship(back_populates="ocr_jobs")
    account: Mapped[Account | None] = relationship(back_populates="ocr_jobs")
    bank_connection: Mapped[BankConnection | None] = relationship(back_populates="ocr_jobs")
    transactions: Mapped[list[Transaction]] = relationship(back_populates="ocr_job")


class Transaction(Base):
    __tablename__ = "transactions"

    __table_args__ = (
        Index("idx_transactions_org", "organization_id"),
        Index("idx_transactions_account", "account_id"),
        Index("idx_transactions_date", "organization_id", "transaction_date"),
        Index("idx_transactions_category", "category_id"),
        Index("idx_transactions_status", "organization_id", "status"),
        Index("idx_transactions_amount", "organization_id", "amount"),
        Index("idx_transactions_counterparty", "organization_id", "counterparty"),
        Index("idx_transactions_source", "source"),
        Index("idx_transactions_external", "external_id"),
        Index("idx_transactions_deleted", "deleted_at", postgresql_where=text("deleted_at IS NULL")),
        Index(
            "idx_transactions_dashboard",
            "organization_id",
            "transaction_date",
            "category_id",
            "account_id",
        ),
        CheckConstraint("amount != 0", name="ck_transactions_amount"),
        CheckConstraint("exchange_rate > 0", name="ck_transactions_exchange_rate"),
        CheckConstraint("currency ~ '^[A-Z]{3}$'", name="ck_transactions_currency"),
        CheckConstraint(
            "direction IN ('debit', 'credit')", name="ck_transactions_direction"
        ),
        CheckConstraint(
            "status IN ('pending', 'posted', 'cancelled', 'reconciled')",
            name="ck_transactions_status",
        ),
        CheckConstraint(
            "source IN ('manual', 'bank_feed', 'ocr', 'import', 'api')",
            name="ck_transactions_source",
        ),
    )

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, default=uuid4, server_default=text("gen_random_uuid()")
    )
    organization_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False
    )
    account_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("accounts.id", ondelete="RESTRICT"), nullable=False
    )
    category_id: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("transaction_categories.id", ondelete="SET NULL")
    )
    counterparty: Mapped[str | None] = mapped_column(String(255))
    counterparty_iban: Mapped[str | None] = mapped_column(String(34))
    reference: Mapped[str | None] = mapped_column(String(100))
    label: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    amount: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    currency: Mapped[str] = mapped_column(
        String(3), nullable=False, default="EUR", server_default=text("'EUR'")
    )
    exchange_rate: Mapped[Decimal] = mapped_column(
        Numeric(10, 6), nullable=False, default=Decimal("1"), server_default=text("1")
    )
    direction: Mapped[str] = mapped_column(String(10), nullable=False)
    transaction_date: Mapped[date] = mapped_column(Date, nullable=False)
    value_date: Mapped[date | None] = mapped_column(Date)
    booking_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now, server_default=func.now()
    )
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="posted", server_default=text("'posted'")
    )
    source: Mapped[str] = mapped_column(
        String(30), nullable=False, default="manual", server_default=text("'manual'")
    )
    external_id: Mapped[str | None] = mapped_column(String(100))
    ocr_job_id: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("ocr_jobs.id", ondelete="SET NULL")
    )
    metadata_: Mapped[dict[str, Any] | None] = mapped_column("metadata", JSONB)
    created_by: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )
    updated_by: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
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
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    organization: Mapped[Organization] = relationship(back_populates="transactions")
    account: Mapped[Account] = relationship(back_populates="transactions")
    category: Mapped[TransactionCategory | None] = relationship(back_populates="transactions")
    ocr_job: Mapped[OCRJob | None] = relationship(back_populates="transactions")
    creator: Mapped[User | None] = relationship(
        back_populates="created_transactions", foreign_keys="Transaction.created_by"
    )
    updater: Mapped[User | None] = relationship(
        back_populates="updated_transactions", foreign_keys="Transaction.updated_by"
    )
