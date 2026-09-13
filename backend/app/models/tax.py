from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from uuid import UUID, uuid4

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    CHAR,
    DateTime,
    ForeignKey,
    Index,
    Numeric,
    String,
    UniqueConstraint,
    func,
    text,
)
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, utc_now


class Tax(Base):
    __tablename__ = "taxes"

    __table_args__ = (
        UniqueConstraint("organization_id", "code", name="uq_taxes_organization_code"),
        Index("idx_taxes_org", "organization_id"),
        Index("idx_taxes_code", "organization_id", "code"),
        Index("idx_taxes_active", "organization_id", "is_active"),
        CheckConstraint("rate >= 0 AND rate <= 100", name="ck_taxes_rate"),
        CheckConstraint("type IN ('vat', 'gst', 'sst', 'other')", name="ck_taxes_type"),
        CheckConstraint("country ~ '^[A-Z]{2}$'", name="ck_taxes_country"),
    )

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, default=uuid4, server_default=text("gen_random_uuid()")
    )
    organization_id: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE")
    )
    code: Mapped[str] = mapped_column(String(20), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    rate: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    type: Mapped[str] = mapped_column(
        String(20), nullable=False, default="vat", server_default=text("'vat'")
    )
    country: Mapped[str | None] = mapped_column(CHAR(2))
    is_default: Mapped[bool] = mapped_column(
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

    organization: Mapped[Organization | None] = relationship(back_populates="taxes")
