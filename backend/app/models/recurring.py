from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
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
    func,
    text,
)
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, utc_now


class RecurringExpense(Base):
    __tablename__ = "recurring_expenses"

    __table_args__ = (
        Index("idx_recurring_expenses_org", "organization_id"),
        Index("idx_recurring_expenses_account", "account_id"),
        Index("idx_recurring_expenses_category", "category_id"),
        Index(
            "idx_recurring_expenses_next_run",
            "organization_id",
            "next_run_date",
            postgresql_where=text("is_active = true"),
        ),
        CheckConstraint("amount > 0", name="ck_recurring_expenses_amount"),
        CheckConstraint("interval_count > 0", name="ck_recurring_expenses_interval_count"),
        CheckConstraint("currency ~ '^[A-Z]{3}$'", name="ck_recurring_expenses_currency"),
        CheckConstraint(
            "frequency IN ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly')",
            name="ck_recurring_expenses_frequency",
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
    category_id: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("transaction_categories.id", ondelete="SET NULL")
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    currency: Mapped[str] = mapped_column(
        String(3), nullable=False, default="EUR", server_default=text("'EUR'")
    )
    frequency: Mapped[str] = mapped_column(String(20), nullable=False)
    interval_count: Mapped[int] = mapped_column(
        Integer, nullable=False, default=1, server_default=text("1")
    )
    next_run_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date | None] = mapped_column(Date)
    max_occurrences: Mapped[int | None] = mapped_column(Integer)
    occurrence_count: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0, server_default=text("0")
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, server_default=text("true")
    )
    auto_book: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default=text("false")
    )
    counterparty: Mapped[str | None] = mapped_column(String(255))
    created_by: Mapped[UUID | None] = mapped_column(
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

    organization: Mapped[Organization] = relationship(back_populates="recurring_expenses")
    account: Mapped[Account | None] = relationship(back_populates="recurring_expenses")
    category: Mapped[TransactionCategory | None] = relationship(back_populates="recurring_expenses")
    creator: Mapped[User | None] = relationship(
        back_populates="recurring_expenses", foreign_keys="RecurringExpense.created_by"
    )
