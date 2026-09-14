from __future__ import annotations

from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    String,
    Text,
    UniqueConstraint,
    func,
    text,
)
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, utc_now


class BankConnectionAccount(Base):
    __tablename__ = "bank_connection_accounts"

    __table_args__ = (
        UniqueConstraint("bank_connection_id", "account_id", name="uq_bank_connection_accounts_pair"),
        Index("idx_bank_connection_accounts_connection", "bank_connection_id"),
        Index("idx_bank_connection_accounts_account", "account_id"),
    )

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, default=uuid4, server_default=text("gen_random_uuid()")
    )
    bank_connection_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("bank_connections.id", ondelete="CASCADE"), nullable=False
    )
    account_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False
    )
    external_account_id: Mapped[str | None] = mapped_column(String(100))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now, server_default=func.now()
    )

    bank_connection: Mapped[BankConnection] = relationship(back_populates="account_links")
    account: Mapped[Account] = relationship(back_populates="bank_connection_links")


class BankConnection(Base):
    __tablename__ = "bank_connections"

    __table_args__ = (
        Index("idx_bank_connections_org", "organization_id"),
        Index("idx_bank_connections_provider", "organization_id", "provider"),
        Index("idx_bank_connections_status", "organization_id", "status"),
        Index("idx_bank_connections_last_sync", "last_sync_at"),
        Index("idx_bank_connections_deleted", "deleted_at", postgresql_where=text("deleted_at IS NULL")),
        CheckConstraint(
            "status IN ('pending', 'connected', 'error', 'disconnected', 'suspended')",
            name="ck_bank_connections_status",
        ),
        CheckConstraint(
            "sync_frequency IN ('realtime', 'hourly', 'daily', 'weekly')",
            name="ck_bank_connections_sync_frequency",
        ),
    )

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, default=uuid4, server_default=text("gen_random_uuid()")
    )
    organization_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False
    )
    provider: Mapped[str] = mapped_column(String(50), nullable=False)
    provider_connection_id: Mapped[str | None] = mapped_column(String(100))
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="pending", server_default=text("'pending'")
    )
    last_sync_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    sync_frequency: Mapped[str] = mapped_column(
        String(20), nullable=False, default="daily", server_default=text("'daily'")
    )
    auto_import: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default=text("false")
    )
    encrypted_token: Mapped[str | None] = mapped_column(Text)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
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

    organization: Mapped[Organization] = relationship(back_populates="bank_connections")
    account_links: Mapped[list[BankConnectionAccount]] = relationship(
        back_populates="bank_connection", cascade="all, delete-orphan", passive_deletes=True
    )
    ocr_jobs: Mapped[list[OCRJob]] = relationship(back_populates="bank_connection", passive_deletes=True)
