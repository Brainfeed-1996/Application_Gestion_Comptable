from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

from .base import BaseSchema


class OrganizationBase(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    name: str = Field(max_length=255, description="Organization name")
    siret: Optional[str] = Field(default=None, max_length=14, description="SIRET number")
    vat_number: Optional[str] = Field(default=None, max_length=20, description="VAT number")
    address_line1: Optional[str] = Field(default=None, max_length=255, description="Address line 1")
    address_line2: Optional[str] = Field(default=None, max_length=255, description="Address line 2")
    city: Optional[str] = Field(default=None, max_length=100, description="City")
    postal_code: Optional[str] = Field(default=None, max_length=20, description="Postal code")
    country: str = Field(default="FR", min_length=2, max_length=2, description="Country code (ISO 3166-1 alpha-2)")
    currency: str = Field(default="EUR", min_length=3, max_length=3, description="Currency code (ISO 4217)")

    @field_validator("siret")
    @classmethod
    def validate_siret(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.replace(" ", "")
            if not v.isdigit() or len(v) != 14:
                raise ValueError("SIRET must be 14 digits")
        return v

    @field_validator("country")
    @classmethod
    def validate_country(cls, v: str) -> str:
        return v.upper()

    @field_validator("currency")
    @classmethod
    def validate_currency(cls, v: str) -> str:
        return v.upper()


class OrganizationCreate(OrganizationBase):
    pass


class OrganizationUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: Optional[str] = Field(default=None, max_length=255)
    siret: Optional[str] = Field(default=None, max_length=14)
    vat_number: Optional[str] = Field(default=None, max_length=20)
    address_line1: Optional[str] = Field(default=None, max_length=255)
    address_line2: Optional[str] = Field(default=None, max_length=255)
    city: Optional[str] = Field(default=None, max_length=100)
    postal_code: Optional[str] = Field(default=None, max_length=20)
    country: Optional[str] = Field(default=None, min_length=2, max_length=2)
    currency: Optional[str] = Field(default=None, min_length=3, max_length=3)

    @field_validator("siret")
    @classmethod
    def validate_siret(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.replace(" ", "")
            if not v.isdigit() or len(v) != 14:
                raise ValueError("SIRET must be 14 digits")
        return v

    @field_validator("country")
    @classmethod
    def validate_country(cls, v: Optional[str]) -> Optional[str]:
        return v.upper() if v else v

    @field_validator("currency")
    @classmethod
    def validate_currency(cls, v: Optional[str]) -> Optional[str]:
        return v.upper() if v else v


class OrganizationResponse(BaseSchema):
    name: str
    slug: str
    siret: Optional[str] = None
    vat_number: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    country: str
    currency: str
    member_count: int
    plan: str