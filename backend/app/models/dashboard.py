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
    Numeric,
    String,
    UniqueConstraint,
    func,
    text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, utc_now


class DashboardMetric(Base):
    __tablename__ = "dashboard_metrics"

    __table_args__ = (
        UniqueConstraint(
            "organization_id",
            "metric_key",
            "period_type",
            "period_start",
            name="uq_dashboard_metrics_org_key_period",
        ),
        Index("idx_dashboard_metrics_org", "organization_id"),
        Index("idx_dashboard_metrics_key", "organization_id", "metric_key"),
        Index("idx_dashboard_metrics_period", "organization_id", "period_type", "period_start"),
        CheckConstraint(
            "period_type IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')",
            name="ck_dashboard_metrics_period_type",
        ),
    )

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, default=uuid4, server_default=text("gen_random_uuid()")
    )
    organization_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False
    )
    metric_key: Mapped[str] = mapped_column(String(100), nullable=False)
    metric_value: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    period_type: Mapped[str] = mapped_column(String(20), nullable=False)
    period_start: Mapped[date] = mapped_column(Date, nullable=False)
    period_end: Mapped[date] = mapped_column(Date, nullable=False)
    computed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now, server_default=func.now()
    )

    organization: Mapped[Organization] = relationship(back_populates="dashboard_metrics")


class CashFlowProjection(Base):
    __tablename__ = "cash_flow_projections"

    __table_args__ = (
        Index("idx_cash_flow_projections_org", "organization_id"),
        Index("idx_cash_flow_projections_date", "organization_id", "projection_date"),
        CheckConstraint(
            "confidence_level IN ('low', 'medium', 'high')",
            name="ck_cash_flow_projections_confidence_level",
        ),
    )

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, default=uuid4, server_default=text("gen_random_uuid()")
    )
    organization_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False
    )
    account_id: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("accounts.id", ondelete="CASCADE")
    )
    projection_date: Mapped[date] = mapped_column(Date, nullable=False)
    projected_balance: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    expected_inflows: Mapped[Decimal] = mapped_column(
        Numeric(15, 2), nullable=False, default=Decimal("0"), server_default=text("0")
    )
    expected_outflows: Mapped[Decimal] = mapped_column(
        Numeric(15, 2), nullable=False, default=Decimal("0"), server_default=text("0")
    )
    confidence_level: Mapped[str] = mapped_column(
        String(20), nullable=False, default="medium", server_default=text("'medium'")
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now, server_default=func.now()
    )

    organization: Mapped[Organization] = relationship(back_populates="cash_flow_projections")
    account: Mapped[Account | None] = relationship(back_populates="cash_flow_projections")


class FinancialStatement(Base):
    __tablename__ = "financial_statements"

    __table_args__ = (
        Index("idx_financial_statements_org", "organization_id"),
        Index("idx_financial_statements_type", "organization_id", "statement_type"),
        CheckConstraint(
            "statement_type IN ('balance_sheet', 'income_statement', 'cash_flow', 'trial_balance')",
            name="ck_financial_statements_statement_type",
        ),
        CheckConstraint(
            "period_type IN ('monthly', 'quarterly', 'yearly', 'ytd')",
            name="ck_financial_statements_period_type",
        ),
        CheckConstraint("currency ~ '^[A-Z]{3}$'", name="ck_financial_statements_currency"),
    )

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, default=uuid4, server_default=text("gen_random_uuid()")
    )
    organization_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False
    )
    statement_type: Mapped[str] = mapped_column(String(20), nullable=False)
    period_type: Mapped[str] = mapped_column(String(20), nullable=False)
    period_start: Mapped[date] = mapped_column(Date, nullable=False)
    period_end: Mapped[date] = mapped_column(Date, nullable=False)
    data: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    total_assets: Mapped[Decimal | None] = mapped_column(Numeric(15, 2))
    total_liabilities: Mapped[Decimal | None] = mapped_column(Numeric(15, 2))
    total_equity: Mapped[Decimal | None] = mapped_column(Numeric(15, 2))
    total_revenue: Mapped[Decimal | None] = mapped_column(Numeric(15, 2))
    total_expenses: Mapped[Decimal | None] = mapped_column(Numeric(15, 2))
    net_income: Mapped[Decimal | None] = mapped_column(Numeric(15, 2))
    currency: Mapped[str] = mapped_column(
        String(3), nullable=False, default="EUR", server_default=text("'EUR'")
    )
    generated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now, server_default=func.now()
    )
    generated_by: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )
    is_locked: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default=text("false")
    )

    organization: Mapped[Organization] = relationship(back_populates="financial_statements")
    generator: Mapped[User | None] = relationship(
        back_populates="financial_statements", foreign_keys="FinancialStatement.generated_by"
    )
