# Backend - Partie 1 : Configuration & Infrastructure

## 1. Structure des dossiers (FastAPI)

```
backend/
├── app/
│   ├── __init__.py, main.py
│   ├── api/
│   │   ├── __init__.py
│   │   └── v1/
│   │       ├── __init__.py, deps.py, router.py
│   │       └── endpoints/
│   │           ├── __init__.py, auth.py, users.py, accounting.py
│   ├── core/
│   │   ├── __init__.py, config.py, database.py, security.py, exceptions.py
│   ├── models/
│   │   ├── __init__.py, base.py, user.py, account.py
│   ├── schemas/
│   │   ├── __init__.py, auth.py, user.py, account.py
│   ├── crud/
│   │   ├── __init__.py, base.py, user.py, account.py
│   └── tests/
│       ├── __init__.py, conftest.py
│       └── v1/
│           ├── __init__.py, test_auth.py, test_users.py, test_accounting.py
├── alembic/
│   ├── env.py, script.py.mako
│   └── versions/
├── .env, .env.example, .gitignore, pyproject.toml, Makefile
```

## 2. pyproject.toml

```toml
[build-system]
requires = ["setuptools>=61.0", "wheel"]
build-backend = "setuptools.build_meta"

[project]
name = "accounting-app"
version = "0.1.0"
description = "Application comptable - Backend FastAPI"
readme = "README.md"
requires-python = ">=3.11"
license = { text = "MIT" }
authors = [{ name = "Scott Adams", email = "scott@example.com" }]
classifiers = [
    "Development Status :: 3 - Alpha",
    "License :: OSI Approved :: MIT License",
    "Programming Language :: Python :: 3.11",
    "Framework :: FastAPI",
]
dependencies = [
    "fastapi>=0.110.0,<1.0.0", "uvicorn>=0.29.0,<1.0.0",
    "sqlalchemy>=2.0.29,<3.0.0", "psycopg2-binary>=2.9.9,<3.0.0",
    "asyncpg>=0.29.0,<1.0.0", "alembic>=1.13.1,<2.0.0",
    "pydantic>=2.6.4,<3.0.0", "pydantic-settings>=2.2.1,<3.0.0",
    "python-jose[cryptography]>=3.3.0,<4.0.0", "passlib[bcrypt]>=1.7.4,<2.0.0",
    "python-multipart>=0.0.9", "email-validator>=2.1.0.post1,<3.0.0",
    "redis>=5.0.3,<6.0.0", "httpx>=0.27.0,<1.0.0",
    "tenacity>=8.2.3,<9.0.0", "structlog>=24.1.0,<25.0.0",
    "sentry-sdk>=2.0.1,<3.0.0",
]
[project.optional-dependencies]
dev = [
    "pytest>=8.0.0,<9.0.0", "pytest-asyncio>=0.23.5,<1.0.0",
    "pytest-cov>=5.0.0,<6.0.0", "ruff>=0.3.0,<1.0.0",
    "mypy>=1.8.0,<2.0.0", "pre-commit>=3.6.0,<4.0.0",
]
prod = ["gunicorn>=21.2.0,<22.0.0", "prometheus-client>=0.20.0,<1.0.0"]

[tool.ruff]
target-version = "py311"
line-length = 100
exclude = [".eggs", ".git", ".venv", "build", "dist"]
[tool.ruff.lint]
select = ["E", "W", "F", "I", "B", "C4", "UP", "N", "SIM", "RUF"]
ignore = ["E501", "B008", "C901"]
[tool.ruff.lint.isort]
known-first-party = ["app"]
known-third-party = ["fastapi", "pydantic", "sqlalchemy"]
[tool.ruff.format]
quote-style = "double"
indent-style = "space"

[tool.mypy]
python_version = "3.11"
strict = true
disallow_untyped_defs = true
warn_return_any = true
[[tool.mypy.overrides]]
module = "alembic.*"
ignore_missing_imports = true
[[tool.mypy.overrides]]
module = "psycopg2.*"
ignore_missing_imports = true

[tool.pytest.ini_options]
minversion = "8.0.0"
asyncio_mode = "auto"
testpaths = ["app/tests"]
addopts = ["-v", "--strict-markers", "--tb=short"]
markers = [
    "slow: marks tests as slow",
    "integration: marks tests as integration tests",
    "unit: marks tests as unit tests",
]
[tool.coverage.run]
source = ["app"]
branch = true
omit = ["*/tests/*", "*/alembic/*", "*/__init__.py"]
[tool.coverage.report]
exclude_lines = ["pragma: no cover", "if __name__ == .__main__.:", "if TYPE_CHECKING:"]

[tool.uvicorn]
app = "app.main:app"
host = "0.0.0.0"
port = 8000
log-level = "info"
reload = true
```

## 3. .env.example

```env
APP_NAME=Accounting App
ENVIRONMENT=development
DEBUG=true
VERSION=0.1.0
HOST=0.0.0.0
PORT=8000
RELOAD=true
POSTGRES_DRIVER=postgresql+psycopg2
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=accounting_dev
POSTGRES_USER=accounting_user
POSTGRES_PASSWORD=changeme_secret_password
POSTGRES_SCHEMA=public
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
REDIS_PASSWORD=
REDIS_PROTOCOL=redis://
REDIS_SSL=false
JWT_SECRET_KEY=super_secret_jwt_key_change_in_production_32chars_min
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7
JWT_AUDIENCE=https://accounting-api.example.com
JWT_ISSUER=accounting-app
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
CORS_CREDENTIALS=true
CORS_METHODS=GET,POST,PUT,PATCH,DELETE,OPTIONS
CORS_HEADERS=*
SENTRY_DSN=https://example@o0.ingest.sentry.io/0
SENTRY_TRACES_SAMPLE_RATE=1.0
SENTRY_PROFILES_SAMPLE_RATE=1.0
LOG_LEVEL=INFO
LOG_FORMAT=JSON
RATE_LIMIT_PER_MINUTE=60
RATE_LIMIT_LOGIN_PER_MINUTE=10
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@example.com
SMTP_PASSWORD=changeme_smtp_password
SMTP_TLS=true
SMTP_FROM=noreply@example.com
ENCRYPTION_KEY=base64_encoded_fernet_key_32_bytes_url_safe
ALEMBIC_DB_URL=postgresql+psycopg2://user:password@local:5432/accounting_dev
```

## 4. config.py (Pydantic Settings)

```python
"""Configuration management using Pydantic Settings."""
from functools import lru_cache
from pathlib import Path
from typing import Any
from pydantic import Field, SecretStr, computed_field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE = BASE_DIR / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=ENV_FILE, env_file_encoding="utf-8",
        case_sensitive=True, extra="ignore",
        env_nested_delimiter="__", validate_default=True,
    )
    app_name: str = Field(default="Accounting App", max_length=100)
    environment: str = Field(default="development")
    debug: bool = Field(default=False)
    version: str = Field(default="0.1.0")
    host: str = Field(default="0.0.0.0")
    port: int = Field(default=8000, ge=1, le=65535)
    reload: bool = Field(default=True)
    postgres_driver: str = Field(default="postgresql+psycopg2")
    postgres_host: str = Field(default="localhost")
    postgres_port: int = Field(default=5432, ge=1, le=65535)
    postgres_db: str = Field(default="accounting_dev", min_length=1)
    postgres_user: str = Field(default="accounting_user", min_length=1)
    postgres_password: SecretStr = Field(default=SecretStr("changeme"))
    postgres_schema: str = Field(default="public")
    redis_host: str = Field(default="localhost")
    redis_port: int = Field(default=6379, ge=1, le=65535)
    redis_db: int = Field(default=0, ge=0, le=255)
    redis_password: SecretStr | None = Field(default=None)
    redis_protocol: str = Field(default="redis://")
    redis_ssl: bool = Field(default=False)
    jwt_secret_key: SecretStr = Field(default=SecretStr("super_secret_jwt_key_change_in_prod_32chars"), min_length=32)
    jwt_algorithm: str = Field(default="HS256")
    jwt_access_token_expire_minutes: int = Field(default=30, ge=1, le=1440)
    jwt_refresh_token_expire_days: int = Field(default=7, ge=1, le=365)
    jwt_audience: str = Field(default="https://accounting-api.example.com")
    jwt_issuer: str = Field(default="accounting-app")
    cors_origins: list[str] = Field(default=["http://localhost:3000", "http://localhost:5173"])
    cors_credentials: bool = Field(default=True)
    cors_methods: list[str] = Field(default=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
    cors_headers: list[str] = Field(default=["*"])
    bcrypt_rounds: int = Field(default=12, ge=4, le=31)
    password_min_length: int = Field(default=8, ge=6, le=128)
    password_max_length: int = Field(default=128, ge=8, le=128)
    encryption_key: SecretStr | None = Field(default=None)
    sentry_dsn: str | None = Field(default=None)
    sentry_traces_sample_rate: float = Field(default=1.0, ge=0.0, le=1.0)
    sentry_profiles_sample_rate: float = Field(default=1.0, ge=0.0, le=1.0)
    smtp_host: str = Field(default="smtp.example.com")
    smtp_port: int = Field(default=587, ge=1, le=65535)
    smtp_user: str | None = Field(default=None)
    smtp_password: SecretStr | None = Field(default=None)
    smtp_tls: bool = Field(default=True)
    smtp_from: str | None = Field(default=None)
    rate_limit_per_minute: int = Field(default=60, ge=1, le=10000)
    rate_limit_login_per_minute: int = Field(default=10, ge=1, le=10000)
    log_level: str = Field(default="INFO", pattern=r"^(DEBUG|INFO|WARNING|ERROR|CRITICAL)$")
    log_format: str = Field(default="json", pattern=r"^(json|text)$")
    prometheus_enabled: bool = Field(default=False)
    prometheus_port: int = Field(default=9090, ge=1, le=65535)

    @computed_field
    @property
    def database_url(self) -> str:
        return f"{self.postgres_driver}://{self.postgres_user}:{self.postgres_password.get_secret_value()}@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"

    @computed_field
    @property
    def redis_url(self) -> str | None:
        if not self.redis_host:
            return None
        scheme = "rediss" if self.redis_ssl else "redis"
        pw = f"{self.redis_password.get_secret_value()}@" if self.redis_password else ""
        return f"{self.redis_protocol}{scheme}://{pw}{self.redis_host}:{self.redis_port}/{self.redis_db}"

    @computed_field
    @property
    def is_production(self) -> bool: return self.environment == "production"

    @computed_field
    @property
    def is_development(self) -> bool: return self.environment == "development"

    @computed_field
    @property
    def is_test(self) -> bool: return self.environment == "test"

    @field_validator("environment")
    @classmethod
    def validate_environment(cls, v: str) -> str:
        allowed = {"development", "staging", "production", "test"}
        if v.lower() not in allowed:
            raise ValueError(f"ENVIRONMENT must be one of {allowed}, got '{v}'")
        return v.lower()
    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: Any) -> list[str]:
        if isinstance(v, str):
            return [o.strip() for o in v.split(",") if o.strip()]
        return v
    @field_validator("encryption_key")
    @classmethod
    def validate_encryption_key(cls, v: SecretStr | None) -> SecretStr | None:
        if v is None:
            return v
        import base64
        try:
            kb = base64.urlsafe_b64decode(v.get_secret_value())
            if len(kb) != 32:
                raise ValueError(f"Encryption key must be 32 bytes, got {len(kb)}")
        except Exception as e:
            raise ValueError(f"Invalid base64 encryption key: {e}") from e
        return v
    @field_validator("postgres_schema")
    @classmethod
    def validate_schema(cls, v: str) -> str:
        if not v.replace("_", "").isalnum():
            raise ValueError("Schema must be alphanumeric (underscores allowed)")
        return v
    @field_validator("jwt_secret_key")
    @classmethod
    def validate_jwt_key_length(cls, v: SecretStr) -> SecretStr:
        if len(v.get_secret_value()) < 32:
            raise ValueError("JWT secret key must be at least 32 characters")
        return v
@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return cached application settings (singleton pattern)."""
    return Settings()
settings = get_settings()
```

## 5. database.py (Engine, Session, Base, Connection Pool)

```python
"""Database module - SQLAlchemy 2.0 engine, session management, Base, pool config."""
from collections.abc import AsyncGenerator
from sqlalchemy import MetaData, event, text
from sqlalchemy.ext.asyncio import (
    AsyncAttrs, AsyncSession, async_sessionmaker, create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool, QueuePool
from app.core.config import settings

DB_URL_ASYNC = str(settings.database_url).replace(settings.postgres_driver, "postgresql+asyncpg", 1)
POOL_SIZE, MAX_OVERFLOW, POOL_RECYCLE, POOL_TIMEOUT = 20, 30, 3600, 30
ECHO_SQL = settings.debug


class Base(AsyncAttrs, DeclarativeBase):
    """Base class for all database models with naming conventions."""
    metadata = MetaData(naming_convention={"ix": "ix_%(column_0_label)s",
        "uq": "uq_%(table_name)s_%(column_0_name)s",
        "ck": "ck_%(table_name)s_`%(constraint_name)s`",
        "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
        "pk": "pk_%(table_name)s"})

def _get_pool_class():
    return NullPool if settings.environment == "test" else QueuePool

engine = create_async_engine(
    DB_URL_ASYNC, echo=ECHO_SQL,
    poolclass=_get_pool_class(),
    pool_size=POOL_SIZE if not settings.is_test and not settings.is_development else None,
    max_overflow=MAX_OVERFLOW, pool_recycle=POOL_RECYCLE,
    pool_timeout=POOL_TIMEOUT, pool_pre_ping=True,
    pool_reset_on_return="rollback",
    connect_args={"server_settings": {"application_name": settings.app_name, "timezone": "UTC"},
                  "command_timeout": 60, "autocommit": False, "statement_cache_size": 500},
    future=True,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine, class_=AsyncSession,
    expire_on_commit=False, autoflush=False, autocommit=False,
)

async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """Dependency: scoped async DB session with auto-rollback on error."""
    async with AsyncSessionLocal() as session:
        async with session.begin():
            try:
                yield session
            except Exception:
                await session.rollback()
                raise

async def get_session_no_commit() -> AsyncGenerator[AsyncSession, None]:
    """Session without automatic transaction (caller manages commit)."""
    async with AsyncSessionLocal() as session:
        yield session

@event.listens_for(engine.sync_engine, "connect")
def set_search_path(conn, record):
    """Set PostgreSQL schema on new connections."""
    if settings.postgres_schema and settings.postgres_schema != "public":
        conn.execute(text(f"SET search_path TO {settings.postgres_schema}"))

@event.listens_for(engine.sync_engine, "engine_connect")
def ping_connection(connection, branch):
    """Validate connection health on connect."""
    if branch: return
    try:
        connection.execute(text("SELECT 1"))
    except Exception:
        connection.execute(text("ROLLBACK"))
async def create_tables() -> None:
    """Create all tables (development only). Use Alembic in production."""
    if settings.is_production:
        raise RuntimeError("create_tables() must not be used in production. Use Alembic.")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
async def close_database() -> None:
    """Gracefully dispose of the connection pool on application shutdown."""
    await engine.dispose()
```
