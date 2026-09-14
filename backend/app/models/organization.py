from __future__ import annotations

from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import Boolean, CHAR, CheckConstraint, DateTime, Index, Integer, String, Text, func, text
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, utc_now


class Organization(Base):
    __tablename__ = "organizations"

    __table_args__ = (
        Index("idx_organizations_name", "name"),
        Index("idx_organizations_siret", "siret"),
        Index("idx_organizations_vat", "vat_number"),
        Index("idx_organizations_deleted", "deleted_at", postgresql_where=text("deleted_at IS NULL")),
        CheckConstraint("country ~ '^[A-Z]{2}$'", name="ck_organizations_country"),
        CheckConstraint("currency ~ '^[A-Z]{3}$'", name="ck_organizations_currency"),
        CheckConstraint(
            "fiscal_year_start BETWEEN 1 AND 12", name="ck_organizations_fiscal_year_start"
        ),
    )

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, default=uuid4, server_default=text("gen_random_uuid()")
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    legal_name: Mapped[str | None] = mapped_column(String(255))
    siret: Mapped[str | None] = mapped_column(String(14))
    siren: Mapped[str | None] = mapped_column(String(9))
    vat_number: Mapped[str | None] = mapped_column(String(20))
    rcs_number: Mapped[str | None] = mapped_column(String(20))
    address_line1: Mapped[str | None] = mapped_column(String(255))
    address_line2: Mapped[str | None] = mapped_column(String(255))
    postal_code: Mapped[str | None] = mapped_column(String(10))
    city: Mapped[str | None] = mapped_column(String(100))
    country: Mapped[str] = mapped_column(
        CHAR(2), nullable=False, default="FR", server_default=text("'FR'")
    )
    phone: Mapped[str | None] = mapped_column(String(20))
    email: Mapped[str | None] = mapped_column(String(255))
    website: Mapped[str | None] = mapped_column(String(255))
    logo_url: Mapped[str | None] = mapped_column(Text)
    currency: Mapped[str] = mapped_column(
        String(3), nullable=False, default="EUR", server_default=text("'EUR'")
    )
    fiscal_year_start: Mapped[int] = mapped_column(
        Integer, nullable=False, default=1, server_default=text("1")
    )
    date_format: Mapped[str] = mapped_column(
        String(10), nullable=False, default="DD/MM/YYYY", server_default=text("'DD/MM/YYYY'")
    )
    number_format: Mapped[str] = mapped_column(
        String(10), nullable=False, default="1.234,56", server_default=text("'1.234,56'")
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

    account_categories: Mapped[list[AccountCategory]] = relationship(
        back_populates="organization", cascade="all, delete-orphan", passive_deletes=True
    )
    chart_accounts: Mapped[list[ChartOfAccount]] = relationship(
        back_populates="organization", cascade="all, delete-orphan", passive_deletes=True
    )
    accounts: Mapped[list[Account]] = relationship(
        back_populates="organization", cascade="all, delete-orphan", passive_deletes=True
    )
    transaction_categories: Mapped[list[TransactionCategory]] = relationship(
        back_populates="organization", cascade="all, delete-orphan", passive_deletes=True
    )
    transactions: Mapped[list[Transaction]] = relationship(
        back_populates="organization", cascade="all, delete-orphan", passive_deletes=True
    )
    invoices: Mapped[list[Invoice]] = relationship(
        back_populates="organization", cascade="all, delete-orphan", passive_deletes=True
    )
    taxes: Mapped[list[Tax]] = relationship(back_populates="organization", passive_deletes=True)
    audit_logs: Mapped[list[AuditLog]] = relationship(
        back_populates="organization", passive_deletes=True
    )
    ocr_jobs: Mapped[list[OCRJob]] = relationship(
        back_populates="organization", cascade="all, delete-orphan", passive_deletes=True
    )
    bank_connections: Mapped[list[BankConnection]] = relationship(
        back_populates="organization", cascade="all, delete-orphan", passive_deletes=True
    )
    payment_methods: Mapped[list[PaymentMethod]] = relationship(
        back_populates="organization", cascade="all, delete-orphan", passive_deletes=True
    )
    quotes: Mapped[list[Quote]] = relationship(
        back_populates="organization", cascade="all, delete-orphan", passive_deletes=True
    )
    payments: Mapped[list[Payment]] = relationship(
        back_populates="organization", cascade="all, delete-orphan", passive_deletes=True
    )
    subscriptions: Mapped[list[Subscription]] = relationship(
        back_populates="organization", cascade="all, delete-orphan", passive_deletes=True
    )
    notifications: Mapped[list[Notification]] = relationship(
        back_populates="organization", passive_deletes=True
    )
    recurring_expenses: Mapped[list[RecurringExpense]] = relationship(
        back_populates="organization", cascade="all, delete-orphan", passive_deletes=True
    )
    dashboard_metrics: Mapped[list[DashboardMetric]] = relationship(
        back_populates="organization", cascade="all, delete-orphan", passive_deletes=True
    )
    cash_flow_projections: Mapped[list[CashFlowProjection]] = relationship(
        back_populates="organization", cascade="all, delete-orphan", passive_deletes=True
    )
    financial_statements: Mapped[list[FinancialStatement]] = relationship(
        back_populates="organization", cascade="all, delete-orphan", passive_deletes=True
    )
    journals: Mapped[list[Journal]] = relationship(
        back_populates="organization", cascade="all, delete-orphan", passive_deletes=True
    )
    transaction_entries: Mapped[list[TransactionEntry]] = relationship(
        back_populates="organization", cascade="all, delete-orphan", passive_deletes=True
    )
