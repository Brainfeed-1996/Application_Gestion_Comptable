from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from app.schemas.notification import NotificationCreate


class NotificationService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def send_notification(self, user_id: UUID, data: NotificationCreate) -> Notification:
        notification = Notification(
            user_id=user_id,
            type=data.type,
            title=data.title,
            message=data.message,
        )
        self.db.add(notification)
        await self.db.flush()
        return notification

    async def check_bill_due(self, user_id: UUID, bill_name: str, due_date: datetime) -> Optional[Notification]:
        now = datetime.now(timezone.utc)
        if due_date <= now:
            notification = await self.send_notification(
                user_id,
                NotificationCreate(
                    user_id=user_id,
                    type="warning",
                    title=f"Échéance: {bill_name}",
                    message=f"Le paiement de {bill_name} est en souffrance depuis le {due_date.strftime('%d/%m/%Y')}.",
                ),
            )
            return notification
        return None

    async def check_low_balance(self, user_id: UUID, balance: float, threshold: float = 100.0) -> Optional[Notification]:
        if balance < threshold:
            notification = await self.send_notification(
                user_id,
                NotificationCreate(
                    user_id=user_id,
                    type="error",
                    title="Solde insuffisant",
                    message=f"Votre solde actuel est de {balance:.2f} €, ce qui est en dessous du seuil de {threshold:.2f} €.",
                ),
            )
            return notification
        return None
