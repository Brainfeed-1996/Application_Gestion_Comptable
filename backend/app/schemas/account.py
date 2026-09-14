from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

from .base import BaseSchema


class AccountBase(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    name: str = Field(max_length=255, description="Account name")
    account_type: str = Field(description="Account type: bank, cash, credit_card, paypal, crypto, other")
    iban: Optional[str] = Field(default=None, max_length=34, description="IBAN")
    bic: Optional[str] = Field(default=None, max_length=11, description="BIC/SWIFT")
    bank_name: Optional[str] = Field(default=None, max_length=255, description="Bank name")
    account_number: Optional[str] = Field(default=None, max_length=50, description="Account number")
    currency: str = Field(default="EUR", min_length=3, max_length=3, description="Currency code")
    opening_balance: Decimal = Field(default=Decimal("0"), description="Opening balance")
    opening_date: Optional[date] = Field(default=None, description="Opening date")

    @field_validator("account_type")
    @classmethod
    def validate_account_type(cls, v: str) -> str:
        allowed = {"bank", "cash", "credit_card", "paypal", "crypto", "other"}
        if v not in allowed:
            raise ValueError(f"account_type must be one of: {', '.join(allowed)}")
        return v

    @field_validator("iban")
    @classmethod
    def validate_iban(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.replace(" ", "").upper()
            if not v.startswith("FR") and len(v) == 27:
                raise ValueError("French IBAN must start with FR and be 27 characters")
        return v

    @field_validator("bic")
    @classmethod
    def validate_bic(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.upper()
            if len(v) not in (8, 11):
                raise ValueError("BIC must be 8 or 11 characters")
        return v

    @field_validator("currency")
    @classmethod
    def validate_currency(cls, v: str) -> str:
        return v.upper()


class AccountCreate(AccountBase):
    pass


class AccountUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: Optional[str] = Field(default=None, max_length=255)
    account_type: Optional[str] = Field(default=None)
    currency: Optional[str] = Field(default=None, min_length=3, max_length=3)
    is_active: Optional[bool] = None

    @field_validator("account_type")
    @classmethod
    def validate_account_type(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            allowed = {"bank", "cash", "credit_card", "paypal", "crypto", "other"}
            if v not in allowed:
                raise ValueError(f"account_type must be one of: {', '.join(allowed)}")
        return v

    @field_validator("currency")
    @classmethod
    def validate_currency(cls, v: Optional[str]) -> Optional[str]:
        return v.upper() if v else v


class AccountResponse(BaseSchema):
    id: UUID
    organization_id: UUID
    name: str
    account_type: str
    iban: Optional[str] = None
    bic: Optional[str] = None
    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    currency: str
    current_balance: Decimal
    opening_balance: Decimal
    opening_date: Optional[date] = None
    is_active: bool
    is_archived: bool
    external_id: Optional[str] = None


class AccountBalance(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    current_balance: Decimal
    opening_balance: Decimal

    @property
    def balance(self) -> Decimal:
        return self.current_balance + self.opening_balance