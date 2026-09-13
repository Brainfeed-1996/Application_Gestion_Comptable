from datetime import date
from decimal import Decimal
from typing import Optional
from uuid import UUID
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.transaction import Transaction
from app.models.invoice import Invoice
from app.models.account import Account


async def get_balance_sheet(org_id: UUID, as_of: Optional[date], db: AsyncSession):
    query = select(
        Account.name,
        func.sum(Transaction.amount).label("balance"),
    ).join(
        Transaction, Account.id == Transaction.account_id
    ).where(
        Transaction.organization_id == org_id,
        Transaction.transaction_date <= (as_of or date.today()),
    ).group_by(Account.name)
    result = await db.execute(query)
    assets = {"total": Decimal("0"), "accounts": []}
    liabilities = {"total": Decimal("0"), "accounts": []}
    equity = {"total": Decimal("0"), "accounts": []}
    for name, balance in result.all():
        item = {"name": name, "amount": balance}
        if balance >= 0:
            assets["accounts"].append(item)
            assets["total"] += balance
        else:
            liabilities["accounts"].append(item)
            liabilities["total"] += balance
    return {"assets": assets, "liabilities": liabilities, "equity": equity}


async def get_income_statement(org_id: UUID, start: date, end: date, db: AsyncSession):
    query = select(
        Account.name,
        func.sum(Transaction.amount).label("amount"),
        Transaction.direction,
    ).join(
        Transaction, Account.id == Transaction.account_id
    ).where(
        Transaction.organization_id == org_id,
        Transaction.transaction_date.between(start, end),
    ).group_by(Account.name, Transaction.direction)
    result = await db.execute(query)
    revenues = Decimal("0")
    expenses = Decimal("0")
    accounts = []
    for name, amount, direction in result.all():
        item = {"name": name, "amount": amount, "direction": direction}
        accounts.append(item)
        if direction == "credit":
            revenues += amount
        else:
            expenses += amount
    return {
        "revenues": revenues,
        "expenses": expenses,
        "net_income": revenues - expenses,
        "period": {"start": start, "end": end},
        "accounts": accounts,
    }
