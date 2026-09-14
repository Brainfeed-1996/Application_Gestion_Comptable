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


class SubscriptionPlan(Base):
    __tablename__ = "subscription_plans"

    __table_args__ = (
        Index("idx_subscription_plans_active", "is_active"),
        Index("idx_subscription_plans_interval", "billing_interval"),
        CheckConstraint("price >= 0", name="ck_subscription_plans_price"),
        CheckConstraint("currency ~ '^[A-Z]{3}$'", name="ck_subscription_plans_currency"),
        CheckConstraint(
            "billing_interval IN ('monthly', 'quarterly', 'yearly')",
            name="ck_subscription_plans_billing_interval",
        ),
    )

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, default=uuid4, server_default=text("gen_random_uuid()")
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    price: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    currency: Mapped[str] = mapped_column(
        String(3), nullable=False, default="EUR", server_default=text("'EUR'")
    )
    billing_interval: Mapped[str] = mapped_column(String(10), nullable=False)
    trial_days: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0, server_default=text("0")
    )
    features: Mapped[list[Any]] = mapped_column(
        JSONB, default=lambda: [], server_default=text("'[]'::jsonb")
    )
    limits: Mapped[dict[str, Any]] = mapped_column(
        JSONB, default=lambda: {}, server_default=text("'{}'::jsonb")
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, server_default=text("true")
    )
    is_public: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, server_default=text("true")
    )
    sort_order: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0, server_default=text("0")
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

    subscriptions: Mapped[list[Subscription]] = relationship(
        back_populates="plan", passive_deletes=True
    )


class Subscription(Base):
    __tablename__ = "subscriptions"

    __table_args__ = (
        Index("idx_subscriptions_org", "organization_id"),
        Index("idx_subscriptions_plan", "plan_id"),
        Index("idx_subscriptions_status", "status"),
        Index("idx_subscriptions_external", "external_subscription_id"),
        Index("idx_subscriptions_period", "current_period_start", "current_period_end"),
        CheckConstraint(
            "status IN ('trial', 'active', 'past_due', 'cancelled', 'expired')",
            name="ck_subscriptions_status",
        ),
    )

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, default=uuid4, server_default=text("gen_random_uuid()")
    )
    organization_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False
    )
    plan_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("subscription_plans.id", ondelete="RESTRICT"), nullable=False
    )
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="trial", server_default=text("'trial'")
    )
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    trial_end: Mapped[date | None] = mapped_column(Date)
    current_period_start: Mapped[date] = mapped_column(Date, nullable=False)
    current_period_end: Mapped[date] = mapped_column(Date, nullable=False)
    cancelled_at: Mapped[date | None] = mapped_column(Date)
    cancel_reason: Mapped[str | None] = mapped_column(Text)
    cancel_at_period_end: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default=text("false")
    )
    payment_method_id: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("payment_methods.id", ondelete="SET NULL")
    )
    external_subscription_id: Mapped[str | None] = mapped_column(String(100))
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

    organization: Mapped[Organization] = relationship(back_populates="subscriptions")
    plan: Mapped[SubscriptionPlan] = relationship(back_populates="subscriptions")
    payment_method: Mapped[PaymentMethod | None] = relationship(back_populates="subscriptions")
    payments: Mapped[list[Payment]] = relationship(back_populates="subscription", passive_deletes=True)
