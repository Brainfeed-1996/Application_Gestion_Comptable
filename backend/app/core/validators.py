import re
import html
from typing import Optional

from app.models.user import User


EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
IBAN_REGEX = re.compile(r"^FR\d{2}[A-Z0-9]{23}$")
SIRET_REGEX = re.compile(r"^\d{14}$")
VAT_REGEX = re.compile(r"^(?:[A-Z]{2}\d{2,12}|[A-Z]{2}[A-Z0-9]{2,12})$")


def validate_email(email: str) -> bool:
    if not email or len(email) > 254:
        return False
    return bool(EMAIL_REGEX.match(email))


def validate_iban(iban: str) -> bool:
    if not iban:
        return False
    iban = iban.replace(" ", "").upper()
    if not IBAN_REGEX.match(iban):
        return False
    return _validate_iban_checksum(iban)


def _validate_iban_checksum(iban: str) -> bool:
    rearranged = iban[4:] + iban[:4]
    numeric = ""
    for char in rearranged:
        if char.isdigit():
            numeric += char
        else:
            numeric += str(ord(char) - ord('A') + 10)
    return int(numeric) % 97 == 1


def validate_siret(siret: str) -> bool:
    if not siret:
        return False
    siret = siret.replace(" ", "")
    if not SIRET_REGEX.match(siret):
        return False
    return _validate_luhn(siret)


def _validate_luhn(number: str) -> bool:
    total = 0
    for i, digit in enumerate(reversed(number)):
        d = int(digit)
        if i % 2 == 1:
            d *= 2
            if d > 9:
                d -= 9
        total += d
    return total % 10 == 0


def validate_vat(vat: str) -> bool:
    if not vat:
        return False
    vat = vat.replace(" ", "").upper()
    return bool(VAT_REGEX.match(vat))


def sanitize_input(input_str: str, max_length: int) -> str:
    if not input_str:
        return ""
    cleaned = html.escape(input_str.strip())
    return cleaned[:max_length]


def validate_rbac_permissions(user: User, resource: str, action: str) -> bool:
    rbac_matrix = {
        "admin": {"*": ["*"]},
        "accountant": {
            "transactions": ["create", "read", "update", "delete"],
            "reports": ["read", "export"],
            "clients": ["create", "read", "update"],
            "invoices": ["create", "read", "update", "delete"],
        },
        "manager": {
            "transactions": ["read"],
            "reports": ["read"],
            "clients": ["read"],
            "invoices": ["read"],
            "users": ["read"],
        },
        "viewer": {
            "transactions": ["read"],
            "reports": ["read"],
            "clients": ["read"],
            "invoices": ["read"],
        }
    }
    role_permissions = rbac_matrix.get(user.role, {})
    resource_permissions = role_permissions.get(resource, [])
    return "*" in resource_permissions or action in resource_permissions