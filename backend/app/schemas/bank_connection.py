from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

from .base import BaseSchema


class BankConnectionBase(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    provider: str = Field(max_length=50, description="Provider name (e.g., 'plaid', 'budget-insight', 'nordigen')")
    sync_frequency: str = Field(default="daily", description="Sync frequency: daily, hourly, realtime, weekly")
    auto_import: bool = False

    @field_validator("sync_frequency")
    @classmethod
    def validate_sync_frequency(cls, v: str) -> str:
        allowed = {"daily", "hourly", "realtime", "weekly"}
        if v not in allowed:
            raise ValueError(f"sync_frequency must be one of: {', '.join(allowed)}")
        return v


class BankConnectionCreate(BankConnectionBase):
    pass


class BankConnectionUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    status: Optional[str] = None
    sync_frequency: Optional[str] = None
    auto_import: Optional[bool] = None

    @field_validator("sync_frequency")
    @classmethod
    def validate_sync_frequency(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            allowed = {"daily", "hourly", "realtime", "weekly"}
            if v not in allowed:
                raise ValueError(f"sync_frequency must be one of: {', '.join(allowed)}")
        return v


class BankConnectionResponse(BaseSchema):
    organization_id: UUID
    provider: str
    provider_connection_id: str
    status: str
    last_sync_at: Optional[datetime] = None
    sync_frequency: str
    auto_import: bool
    encrypted_token: str
    expires_at: Optional[datetime] = None