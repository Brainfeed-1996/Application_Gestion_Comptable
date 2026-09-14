from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID, uuid4

from sqlalchemy import ARRAY, Boolean, CheckConstraint, DateTime, Index, Integer, String, Text, func, text
from sqlalchemy.dialects.postgresql import INET, JSONB, UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, utc_now


class User(Base):
    __tablename__ = "users"

    __table_args__ = (
        Index("idx_users_email", "email", unique=True),
        Index("idx_users_active", "is_active", postgresql_where=text("is_active = true")),
        Index("idx_users_last_login", "last_login_at"),
        Index("idx_users_deleted", "deleted_at", postgresql_where=text("deleted_at IS NULL")),
        CheckConstraint(
            "mfa_method IN ('none', 'totp', 'webauthn', 'sms')",
            name="ck_users_mfa_method",
        ),
    )

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
        server_default=text("gen_random_uuid()"),
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    email_verified: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default=text("false")
    )
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    first_name: Mapped[str | None] = mapped_column(String(100))
    last_name: Mapped[str | None] = mapped_column(String(100))
    phone: Mapped[str | None] = mapped_column(String(20))
    avatar_url: Mapped[str | None] = mapped_column(Text)
    locale: Mapped[str] = mapped_column(
        String(20), nullable=False, default="fr", server_default=text("'fr'")
    )
    timezone: Mapped[str] = mapped_column(
        String(100), nullable=False, default="Europe/Paris", server_default=text("'Europe/Paris'")
    )
    two_factor_enabled: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default=text("false")
    )
    two_factor_secret: Mapped[str | None] = mapped_column(String(255))
    two_factor_backup_codes: Mapped[list[str] | None] = mapped_column(ARRAY(String()))
    mfa_method: Mapped[str] = mapped_column(
        String(20), nullable=False, default="none", server_default=text("'none'")
    )
    webauthn_credential: Mapped[dict[str, Any] | None] = mapped_column(JSONB)
    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, server_default=text("true")
    )
    is_superadmin: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default=text("false")
    )
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    last_login_ip: Mapped[str | None] = mapped_column(INET)
    failed_login_count: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0, server_default=text("0")
    )
    locked_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
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

    notifications: Mapped[list[Notification]] = relationship(
        back_populates="user", passive_deletes=True
    )
    audit_logs: Mapped[list[AuditLog]] = relationship(back_populates="user", passive_deletes=True)
    created_transactions: Mapped[list[Transaction]] = relationship(
        back_populates="creator", foreign_keys="Transaction.created_by", passive_deletes=True
    )
    updated_transactions: Mapped[list[Transaction]] = relationship(
        back_populates="updater", foreign_keys="Transaction.updated_by", passive_deletes=True
    )
    created_invoices: Mapped[list[Invoice]] = relationship(
        back_populates="creator", foreign_keys="Invoice.created_by", passive_deletes=True
    )
    updated_invoices: Mapped[list[Invoice]] = relationship(
        back_populates="updater", foreign_keys="Invoice.updated_by", passive_deletes=True
    )
    created_quotes: Mapped[list[Quote]] = relationship(
        back_populates="creator", foreign_keys="Quote.created_by", passive_deletes=True
    )
    recurring_expenses: Mapped[list[RecurringExpense]] = relationship(
        back_populates="creator", foreign_keys="RecurringExpense.created_by", passive_deletes=True
    )
    financial_statements: Mapped[list[FinancialStatement]] = relationship(
        back_populates="generator", foreign_keys="FinancialStatement.generated_by", passive_deletes=True
    )
    created_entries: Mapped[list[TransactionEntry]] = relationship(
        back_populates="creator", foreign_keys="TransactionEntry.created_by", passive_deletes=True
    )
    updated_entries: Mapped[list[TransactionEntry]] = relationship(
        back_populates="updater", foreign_keys="TransactionEntry.updated_by", passive_deletes=True
    )
