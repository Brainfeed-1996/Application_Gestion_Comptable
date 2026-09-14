"""Seed script to create an admin user in the database."""

import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.security import get_password_hash, verify_password
from app.database import async_session_maker, create_tables
from app.models.user import User


ADMIN_EMAIL = "admin@comptable.com"
ADMIN_PASSWORD = "AdminPass2024!"


async def seed_admin():
    await create_tables()

    async with async_session_maker() as session:
        result = await session.execute(
            select(User).where(User.email == ADMIN_EMAIL)
        )
        existing = result.scalar_one_or_none()

        if existing:
            print(f"Admin user already exists: {ADMIN_EMAIL}")
            if verify_password(ADMIN_PASSWORD, existing.hashed_password):
                print("Password matches.")
            else:
                print("Updating password...")
                existing.hashed_password = get_password_hash(ADMIN_PASSWORD)
                await session.commit()
                print("Password updated.")
            return

        admin = User(
            email=ADMIN_EMAIL,
            full_name="Administrateur",
            hashed_password=get_password_hash(ADMIN_PASSWORD),
            is_active=True,
            is_superuser=True,
            role="admin",
        )
        session.add(admin)
        await session.commit()
        print(f"Admin user created: {ADMIN_EMAIL}")
        print(f"Password: {ADMIN_PASSWORD}")


if __name__ == "__main__":
    asyncio.run(seed_admin())
