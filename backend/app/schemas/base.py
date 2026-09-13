from datetime import datetime
from typing import Generic, TypeVar
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


class BaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: UUID
    created_at: datetime
    updated_at: datetime


T = TypeVar("T")


class PaginationParams(BaseModel):
    model_config = ConfigDict(extra="forbid")

    page: int = Field(default=1, ge=1, description="Page number")
    limit: int = Field(default=20, ge=1, le=100, description="Items per page")
    search: str | None = Field(default=None, max_length=255, description="Search query")


class PaginationMeta(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    page: int
    limit: int
    total: int
    total_pages: int


class PaginatedResponse(BaseModel, Generic[T]):
    model_config = ConfigDict(from_attributes=True)

    data: list[T]
    meta: PaginationMeta