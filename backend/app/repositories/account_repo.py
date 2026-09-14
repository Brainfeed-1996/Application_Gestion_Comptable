from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.account import Account
from app.schemas.account import AccountCreate, AccountUpdate


class AccountRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, account_id: UUID) -> Optional[Account]:
        result = await self.db.execute(
            select(Account).where(Account.id == account_id)
        )
        return result.scalar_one_or_none()

    async def list(
        self,
        organization_id: UUID,
        account_type: Optional[str] = None,
        is_active: Optional[bool] = None,
        page: int = 1,
        limit: int = 20,
    ) -> tuple[list[Account], int]:
        query = select(Account).where(
            Account.organization_id == organization_id,
            Account.deleted_at.is_(None),
        )
        if account_type:
            query = query.where(Account.account_type == account_type)
        if is_active is not None:
            query = query.where(Account.is_active == is_active)

        count_result = await self.db.execute(
            query.with_only_columns(select(Account.id).count()).order_by(None)
        )
        total = count_result.scalar() or 0

        accounts = await self.db.execute(
            query.order_by(Account.created_at.desc())
            .offset((page - 1) * limit)
            .limit(limit)
        )
        return accounts.scalars().all(), total

    async def create(self, organization_id: UUID, data: AccountCreate) -> Account:
        account = Account(
            organization_id=organization_id,
            name=data.name,
            account_type=data.account_type,
            iban=data.iban,
            bic=data.bic,
            bank_name=data.bank_name,
            account_number=data.account_number,
            currency=data.currency,
            opening_balance=data.opening_balance,
            current_balance=data.opening_balance,
            opening_date=data.opening_date,
        )
        self.db.add(account)
        await self.db.flush()
        return account

    async def update(self, account: Account, data: AccountUpdate) -> Account:
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            if hasattr(account, key):
                setattr(account, key, value)
        await self.db.flush()
        return account

    async def soft_delete(self, account: Account, deleted_at: Optional[datetime] = None) -> Account:
        account.is_active = False
        account.deleted_at = deleted_at or datetime.utcnow()
        await self.db.flush()
        return account