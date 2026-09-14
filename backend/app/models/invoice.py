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
    Numeric,
    String,
    Text,
    UniqueConstraint,
    func,
    text,
)
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, utc_now


class Invoice(Base):
    __tablename__ = "invoices"

    __table_args__ = (
        UniqueConstraint("organization_id", "invoice_number", name="uq_invoices_organization_number"),
        Index("idx_invoices_org", "organization_id"),
        Index("idx_invoices_number", "organization_id", "invoice_number"),
        Index("idx_invoices_status", "organization_id", "status"),
        Index("idx_invoices_dates", "organization_id", "issue_date"),
        Index(
            "idx_invoices_due",
            "due_date",
            postgresql_where=text(
                "status IN ('sent', 'partially_paid', 'overdue')"
            ),
        ),
        Index("idx_invoices_customer", "organization_id", "customer_name"),
        Index("idx_invoices_deleted", "deleted_at", postgresql_where=text("deleted_at IS NULL")),
        CheckConstraint(
            "status IN ('draft', 'sent', 'paid', 'partially_paid', 'overdue', 'cancelled', 'refunded')",
            name="ck_invoices_status",
        ),
        CheckConstraint("currency ~ '^[A-Z]{3}$'", name="ck_invoices_currency"),
    )

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, default=uuid4, server_default=text("gen_random_uuid()")
    )
    organization_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False
    )
    invoice_number: Mapped[str] = mapped_column(String(50), nullable=False)
    invoice_prefix: Mapped[str] = mapped_column(
        String(10), nullable=False, default="FACT", server_default=text("'FACT'")
    )
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="draft", server_default=text("'draft'")
    )
    customer_name: Mapped[str] = mapped_column(String(255), nullable=False)
    customer_email: Mapped[str | None] = mapped_column(String(255))
    customer_address: Mapped[str | None] = mapped_column(Text)
    customer_vat_number: Mapped[str | None] = mapped_column(String(20))
    issue_date: Mapped[date] = mapped_column(Date, nullable=False)
    due_date: Mapped[date] = mapped_column(Date, nullable=False)
    paid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    subtotal: Mapped[Decimal] = mapped_column(
        Numeric(15, 2), nullable=False, default=Decimal("0"), server_default=text("0")
    )
    discount_amount: Mapped[Decimal] = mapped_column(
        Numeric(15, 2), nullable=False, default=Decimal("0"), server_default=text("0")
    )
    tax_amount: Mapped[Decimal] = mapped_column(
        Numeric(15, 2), nullable=False, default=Decimal("0"), server_default=text("0")
    )
    total: Mapped[Decimal] = mapped_column(
        Numeric(15, 2), nullable=False, default=Decimal("0"), server_default=text("0")
    )
    total_paid: Mapped[Decimal] = mapped_column(
        Numeric(15, 2), nullable=False, default=Decimal("0"), server_default=text("0")
    )
    currency: Mapped[str] = mapped_column(
        String(3), nullable=False, default="EUR", server_default=text("'EUR'")
    )
    notes: Mapped[str | None] = mapped_column(Text)
    terms: Mapped[str | None] = mapped_column(Text)
    pdf_url: Mapped[str | None] = mapped_column(Text)
    external_id: Mapped[str | None] = mapped_column(String(100))
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

    organization: Mapped[Organization] = relationship(back_populates="invoices")
    creator: Mapped[User | None] = relationship(
        back_populates="created_invoices", foreign_keys="Invoice.created_by"
    )
    updater: Mapped[User | None] = relationship(
        back_populates="updated_invoices", foreign_keys="Invoice.updated_by"
    )
    payments: Mapped[list[Payment]] = relationship(back_populates="invoice", passive_deletes=True)
    converted_quotes: Mapped[list[Quote]] = relationship(
        back_populates="converted_to_invoice", passive_deletes=True
    )
