from datetime import datetime
from typing import Any
from uuid import UUID

from sqlalchemy import BigInteger, DateTime, ForeignKey, Index, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, utc_now


class BilanHistory(Base):
    __tablename__ = "bilan_history"

    __table_args__ = (
        Index("idx_bilan_history_draft", "draft_id", "created_at"),
        Index("idx_bilan_history_user", "user_id", "created_at"),
        Index("idx_bilan_history_field", "field_changed"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    draft_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("balance_sheet_drafts.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[UUID | None] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )
    field_changed: Mapped[str] = mapped_column(String(100), nullable=False)
    old_value: Mapped[Any | None] = mapped_column(JSONB)
    new_value: Mapped[Any | None] = mapped_column(JSONB)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now, server_default=func.now()
    )

    draft: Mapped["BalanceSheetDraft"] = relationship(back_populates="history")
    user: Mapped["User | None"] = relationship(back_populates="bilan_history")