from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

from .base import BaseSchema


class ClientBase(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    name: str = Field(max_length=255, description="Client name")
    email: Optional[str] = Field(default=None, max_length=255, description="Email address")
    phone: Optional[str] = Field(default=None, max_length=20, description="Phone number")
    address: Optional[str] = Field(default=None, description="Address")
    city: Optional[str] = Field(default=None, max_length=100, description="City")
    postal_code: Optional[str] = Field(default=None, max_length=10, description="Postal code")
    country: str = Field(default="FR", min_length=2, max_length=2, description="Country code (ISO 3166-1 alpha-2)")
    siren: Optional[str] = Field(default=None, max_length=9, description="SIREN number")
    naf_code: Optional[str] = Field(default=None, max_length=5, description="NAF code")
    is_active: bool = Field(default=True, description="Whether the client is active")
    is_supplier: bool = Field(default=False, description="Whether the client is also a supplier")

    @field_validator("country")
    @classmethod
    def validate_country(cls, v: str) -> str:
        return v.upper()

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip().lower()
        return v


class ClientCreate(ClientBase):
    pass


class ClientUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: Optional[str] = Field(default=None, max_length=255)
    email: Optional[str] = Field(default=None, max_length=255)
    phone: Optional[str] = Field(default=None, max_length=20)
    address: Optional[str] = Field(default=None)
    city: Optional[str] = Field(default=None, max_length=100)
    postal_code: Optional[str] = Field(default=None, max_length=10)
    country: Optional[str] = Field(default=None, min_length=2, max_length=2)
    siren: Optional[str] = Field(default=None, max_length=9)
    naf_code: Optional[str] = Field(default=None, max_length=5)
    is_active: Optional[bool] = Field(default=None)
    is_supplier: Optional[bool] = Field(default=None)

    @field_validator("country")
    @classmethod
    def validate_country(cls, v: Optional[str]) -> Optional[str]:
        return v.upper() if v else v

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip().lower()
        return v


class ClientResponse(BaseSchema):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    country: str
    siren: Optional[str] = None
    naf_code: Optional[str] = None
    is_active: bool
    is_supplier: bool
    organization_id: UUID
    created_at: datetime
    updated_at: datetime
