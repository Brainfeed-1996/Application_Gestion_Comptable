from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.schemas.base import BaseResponse


class NotificationResponse(BaseResponse):
    user_id: UUID
    type: str
    title: str
    message: Optional[str] = None
    is_read: bool
    created_at: datetime


class NotificationCreate(BaseModel):
    user_id: UUID
    type: str
    title: str
    message: Optional[str] = None


class NotificationUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: Optional[str] = None
    message: Optional[str] = None


class NotificationMarkRead(BaseModel):
    model_config = ConfigDict(extra="forbid")

    is_read: bool = True
