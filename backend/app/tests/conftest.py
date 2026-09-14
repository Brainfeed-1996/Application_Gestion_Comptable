"""Shared pytest fixtures for the backend test suite."""

from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from typing import Any, AsyncIterator, Optional
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import UUID, uuid4

import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.organization import Organization
from app.models.user import User


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def mock_db_session() -> AsyncMock:
    """Return a mock AsyncSession with common methods stubbed."""
    session = AsyncMock(spec=AsyncSession)
    session.execute = AsyncMock()
    session.add = MagicMock()
    session.flush = AsyncMock()
    session.commit = AsyncMock()
    session.rollback = AsyncMock()
    session.close = AsyncMock()
    session.delete = AsyncMock()
    return session


@pytest.fixture
def mock_session_factory(mock_db_session: AsyncMock):
    """Patch async_session_maker to always return the mock session."""
    with patch("app.database.async_session_maker") as factory:
        factory.return_value.__aenter__ = AsyncMock(return_value=mock_db_session)
        factory.return_value.__aexit__ = AsyncMock(return_value=None)
        yield factory


@pytest.fixture
def org_id() -> UUID:
    return uuid4()


@pytest.fixture
def user_id() -> UUID:
    return uuid4()


@pytest.fixture
def make_organization():
    """Factory for creating Organization instances."""
    def _make(
        org_id: Optional[UUID] = None,
        name: str = "Test Org",
        **kwargs: Any,
    ) -> Organization:
        org = Organization(
            id=org_id or uuid4(),
            name=name,
            legal_name=kwargs.pop("legal_name", name),
            country=kwargs.pop("country", "FR"),
            currency=kwargs.pop("currency", "EUR"),
            fiscal_year_start=kwargs.pop("fiscal_year_start", 1),
            created_at=kwargs.pop("created_at", datetime.now(timezone.utc)),
            updated_at=kwargs.pop("updated_at", datetime.now(timezone.utc)),
        )
        return org

    return _make


@pytest.fixture
def make_user():
    """Factory for creating User instances."""
    def _make(
        user_id: Optional[UUID] = None,
        email: str = "user@example.com",
        password_hash: str = "$2b$12$hash",
        first_name: str = "John",
        last_name: str = "Doe",
        is_active: bool = True,
        is_superuser: bool = False,
        role: str = "user",
        **kwargs: Any,
    ) -> User:
        user = User(
            id=user_id or uuid4(),
            email=email,
            password_hash=password_hash,
            first_name=first_name,
            last_name=last_name,
            is_active=is_active,
            is_superuser=is_superuser,
            role=role,
            locale=kwargs.pop("locale", "fr"),
            timezone=kwargs.pop("timezone", "Europe/Paris"),
            two_factor_enabled=kwargs.pop("two_factor_enabled", False),
            mfa_method=kwargs.pop("mfa_method", "none"),
            failed_login_count=kwargs.pop("failed_login_count", 0),
            created_at=kwargs.pop("created_at", datetime.now(timezone.utc)),
            updated_at=kwargs.pop("updated_at", datetime.now(timezone.utc)),
        )
        return user

    return _make


@pytest.fixture
def patched_password_hash(monkeypatch):
    """Patch get_password_hash to return a deterministic value."""
    def _fake_hash(password: str) -> str:
        return f"$2b$12${hash(password) & 0xFFFFFFFF:08x}"

    monkeypatch.setattr("app.core.security.get_password_hash", _fake_hash)
    return _fake_hash


@pytest.fixture
def patched_verify_password(monkeypatch):
    """Patch verify_password to a controllable callable."""
    def _make(expected: str):
        def _fake(password: str, hash_value: str) -> bool:
            return hash_value == expected

        monkeypatch.setattr("app.core.security.verify_password", _fake)
        return _fake

    return _make