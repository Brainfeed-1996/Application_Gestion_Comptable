from __future__ import annotations

from datetime import date, datetime
from uuid import UUID, uuid4

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Index,
    String,
    Text,
    func,
    text,
)
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, utc_now


class Journal(Base):
    __tablename__ = "journals"

    __table_args__ = (
        Index("idx_journals_organization", "organization_id"),
        Index("idx_journals_type", "organization_id", "type"),
        Index("idx_journals_code", "organization_id", "code"),
        Index("idx_journals_active", "organization_id", postgresql_where=text("is_active = true")),
        CheckConstraint(
            "type IN ('sales', 'purchases', 'cash', 'bank', 'other')",
            name="ck_journals_type",
        ),
    )

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, default=uuid4, server_default=text("gen_random_uuid()")
    )
    organization_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    code: Mapped[str] = mapped_column(String(10), nullable=False)
    type: Mapped[str] = mapped_column(String(20), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
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
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    organization: Mapped[Organization] = relationship(back_populates="journals")
    entries: Mapped[list[TransactionEntry]] = relationship(
        back_populates="journal", cascade="all, delete-orphan", passive_deletes=True
    )


class TransactionEntry(Base):
    __tablename__ = "transaction_entries"

    __table_args__ = (
        Index("idx_transaction_entries_organization", "organization_id"),
        Index("idx_transaction_entries_journal", "journal_id"),
        Index("idx_transaction_entries_date", "organization_id", "entry_date"),
        Index("idx_transaction_entries_reference", "organization_id", "reference"),
        CheckConstraint(
            "status IN ('draft', 'posted', 'cancelled', 'reconciled')",
            name="ck_transaction_entries_status",
        ),
    )

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, default=uuid4, server_default=text("gen_random_uuid()")
    )
    organization_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False
    )
    journal_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("journals.id", ondelete="CASCADE"), nullable=False
    )
    entry_date: Mapped[date] = mapped_column(Date, nullable=False)
    description: Mapped[str] = mapped_column(String(500), nullable=False)
    reference: Mapped[str | None] = mapped_column(String(100))
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="draft", server_default=text("'draft'")
    )
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

    organization: Mapped[Organization] = relationship(back_populates="transaction_entries")
    journal: Mapped[Journal] = relationship(back_populates="entries")
    creator: Mapped[User | None] = relationship(
        back_populates="created_entries", foreign_keys="TransactionEntry.created_by"
    )
    updater: Mapped[User | None] = relationship(
        back_populates="updated_entries", foreign_keys="TransactionEntry.updated_by"
    )