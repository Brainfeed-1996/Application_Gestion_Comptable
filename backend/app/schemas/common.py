from enum import Enum
from typing import Optional
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class Currency(str, Enum):
    EUR = "EUR"
    USD = "USD"
    GBP = "GBP"
    CHF = "CHF"
    CAD = "CAD"
    AUD = "AUD"
    JPY = "JPY"
    CNY = "CNY"
    SEK = "SEK"
    NOK = "NOK"
    DKK = "DKK"
    PLN = "PLN"
    CZK = "CZK"
    HUF = "HUF"
    RON = "RON"
    BGN = "BGN"
    HRK = "HRK"


class TransactionDirection(str, Enum):
    DEBIT = "debit"
    CREDIT = "credit"


class InvoiceStatus(str, Enum):
    DRAFT = "draft"
    SENT = "sent"
    PAID = "paid"
    PARTIALLY_PAID = "partially_paid"
    OVERDUE = "overdue"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"


class QuoteStatus(str, Enum):
    DRAFT = "draft"
    SENT = "sent"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    EXPIRED = "expired"


class AccountType(str, Enum):
    BANK = "bank"
    CASH = "cash"
    CREDIT_CARD = "credit_card"
    PAYPAL = "paypal"
    CRYPTO = "crypto"
    OTHER = "other"


class PaymentType(str, Enum):
    INVOICE = "invoice"
    SUBSCRIPTION = "subscription"
    ONE_TIME = "one_time"
    REFUND = "refund"


class PaymentStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"
    CANCELLED = "cancelled"


class TransactionStatus(str, Enum):
    PENDING = "pending"
    POSTED = "posted"
    RECONCILED = "reconciled"
    CANCELLED = "cancelled"


class TransactionSource(str, Enum):
    MANUAL = "manual"
    BANK_IMPORT = "bank_import"
    INVOICE = "invoice"
    PAYMENT = "payment"
    RECONCILIATION = "reconciliation"


class BankConnectionStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    ERROR = "error"
    EXPIRED = "expired"
    REVOKED = "revoked"


class SyncFrequency(str, Enum):
    DAILY = "daily"
    HOURLY = "hourly"
    REALTIME = "realtime"
    WEEKLY = "weekly"


class PaginationMeta(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    page: int
    limit: int
    total: int
    total_pages: int


class ErrorResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    error: str
    details: Optional[dict] = None
    status_code: int


class SuccessResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    success: bool = True
    message: str


class IDResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    message: str = "Created successfully"