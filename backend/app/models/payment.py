from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Any
from uuid import UUID, uuid4

from sqlalchemy import (
    Boolean,
    CheckConstraint,
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


class PaymentMethod(Base):
    __tablename__ = "payment_methods"

    __table_args__ = (
        Index("idx_payment_methods_org", "organization_id"),
        Index("idx_payment_methods_type", "organization_id", "type"),
        Index(
            "idx_payment_methods_default",
            "organization_id",
            postgresql_where=text("is_default = true"),
        ),
        CheckConstraint(
            "type IN ('card', 'bank_transfer', 'paypal', 'sepa', 'crypto', 'check', 'cash', 'other')",
            name="ck_payment_methods_type",
        ),
        CheckConstraint("expiry_month BETWEEN 1 AND 12", name="ck_payment_methods_expiry_month"),
    )

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, default=uuid4, server_default=text("gen_random_uuid()")
    )
    organization_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False
    )
    type: Mapped[str] = mapped_column(String(30), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    is_default: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default=text("false")
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, server_default=text("true")
    )
    encrypted_details: Mapped[str | None] = mapped_column(Text)
    external_provider: Mapped[str | None] = mapped_column(String(50))
    external_id: Mapped[str | None] = mapped_column(String(100))
    last4: Mapped[str | None] = mapped_column(String(4))
    brand: Mapped[str | None] = mapped_column(String(20))
    expiry_month: Mapped[int | None] = mapped_column(Integer)
    expiry_year: Mapped[int | None] = mapped_column(Integer)
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

    organization: Mapped[Organization] = relationship(back_populates="payment_methods")
    payments: Mapped[list[Payment]] = relationship(back_populates="payment_method", passive_deletes=True)
    subscriptions: Mapped[list[Subscription]] = relationship(
        back_populates="payment_method", passive_deletes=True
    )


class Payment(Base):
    __tablename__ = "payments"

    __table_args__ = (
        Index("idx_payments_org", "organization_id"),
        Index("idx_payments_invoice", "invoice_id"),
        Index("idx_payments_subscription", "subscription_id"),
        Index("idx_payments_method", "payment_method_id"),
        Index("idx_payments_status", "organization_id", "status"),
        Index("idx_payments_date", "payment_date"),
        Index("idx_payments_external", "external_id"),
        CheckConstraint("amount > 0", name="ck_payments_amount"),
        CheckConstraint("exchange_rate > 0", name="ck_payments_exchange_rate"),
        CheckConstraint("currency ~ '^[A-Z]{3}$'", name="ck_payments_currency"),
        CheckConstraint(
            "status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded')",
            name="ck_payments_status",
        ),
        CheckConstraint(
            "payment_type IN ('invoice', 'subscription', 'one_time', 'refund')",
            name="ck_payments_payment_type",
        ),
    )

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, default=uuid4, server_default=text("gen_random_uuid()")
    )
    organization_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False
    )
    invoice_id: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("invoices.id", ondelete="SET NULL")
    )
    subscription_id: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("subscriptions.id", ondelete="SET NULL")
    )
    payment_method_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("payment_methods.id", ondelete="RESTRICT"), nullable=False
    )
    amount: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    currency: Mapped[str] = mapped_column(
        String(3), nullable=False, default="EUR", server_default=text("'EUR'")
    )
    exchange_rate: Mapped[Decimal] = mapped_column(
        Numeric(10, 6), nullable=False, default=Decimal("1"), server_default=text("1")
    )
    amount_base: Mapped[Decimal | None] = mapped_column(Numeric(15, 2))
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="pending", server_default=text("'pending'")
    )
    payment_type: Mapped[str] = mapped_column(String(30), nullable=False)
    payment_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now, server_default=func.now()
    )
    external_id: Mapped[str | None] = mapped_column(String(100))
    external_status: Mapped[str | None] = mapped_column(String(50))
    failure_reason: Mapped[str | None] = mapped_column(Text)
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

    organization: Mapped[Organization] = relationship(back_populates="payments")
    invoice: Mapped[Invoice | None] = relationship(back_populates="payments")
    subscription: Mapped[Subscription | None] = relationship(back_populates="payments")
    payment_method: Mapped[PaymentMethod] = relationship(back_populates="payments")
