from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    project_name: str = "Comptable API"
    version: str = "1.0.0"
    api_prefix: str = "/api/v1"
    database_url: str = "postgresql+asyncpg://comptable:comptable@localhost:5432/comptable"
    redis_url: str = "redis://localhost:6379/0"
    secret_key: str = "secret-key-change-in-production"
    jwt_secret_key: str = "secret-key-change-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    email_verification_token_expire_hours: int = 24
    password_reset_token_expire_hours: int = 1
    smtp_host: str = "smtp.example.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from: str = "noreply@example.com"
    google_client_id: str = ""
    google_client_secret: str = ""
    microsoft_client_id: str = ""
    microsoft_client_secret: str = ""
    allowed_origins: list[str] = ["http://localhost:3000"]
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:6000"]
    cors_credentials: bool = True
    cors_methods: list[str] = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    cors_headers: list[str] = ["*"]
    environment: str = "development"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


settings = Settings()