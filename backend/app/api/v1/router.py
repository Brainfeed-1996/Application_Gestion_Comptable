from fastapi import APIRouter

from app.api.v1.endpoints.accounts import router as accounts_router
from app.api.v1.endpoints.balance_sheet import router as balance_sheet_router
from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.invoices import router as invoices_router
from app.api.v1.endpoints.notifications import router as notifications_router
from app.api.v1.endpoints.payments import router as payments_router
from app.api.v1.endpoints.system import router as system_router

api_router = APIRouter()

api_router.include_router(accounts_router)
api_router.include_router(balance_sheet_router)
api_router.include_router(auth_router)
api_router.include_router(invoices_router)
api_router.include_router(notifications_router)
api_router.include_router(payments_router)
api_router.include_router(system_router)