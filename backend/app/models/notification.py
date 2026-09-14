from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID, uuid4

from sqlalchemy import Boolean, CheckConstraint, DateTime, ForeignKey, Index, String, Text, func, text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, utc_now


class Notification(Base):
    __tablename__ = "notifications"

    __table_args__ = (
        Index("idx_notifications_user", "user_id", "is_read", "created_at"),
        Index("idx_notifications_org", "organization_id", "created_at"),
        Index(
            "idx_notifications_unread",
            "user_id",
            "created_at",
            postgresql_where=text("is_read = false"),
        ),
        CheckConstraint(
            "type IN ('info', 'warning', 'error', 'success', 'invoice_overdue', 'payment_received', 'low_balance', 'tax_due', 'subscription', 'system')",
            name="ck_notifications_type",
        ),
        CheckConstraint(
            "priority IN ('low', 'normal', 'high', 'urgent')", name="ck_notifications_priority"
        ),
    )

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, default=uuid4, server_default=text("gen_random_uuid()")
    )
    organization_id: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE")
    )
    user_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str | None] = mapped_column(Text)
    link: Mapped[str | None] = mapped_column(String(500))
    priority: Mapped[str] = mapped_column(
        String(10), nullable=False, default="normal", server_default=text("'normal'")
    )
    is_read: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default=text("false")
    )
    read_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    action_data: Mapped[dict[str, Any] | None] = mapped_column(JSONB)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now, server_default=func.now()
    )

    organization: Mapped[Organization | None] = relationship(back_populates="notifications")
    user: Mapped[User] = relationship(back_populates="notifications")
