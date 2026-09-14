from datetime import date
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.core.security import get_current_user
from app.models.user import User
from app.services.balance_sheet_service import BalanceSheetTemplateService
from app.schemas.balance_sheet import (
    BalanceSheetTemplateResponse,
    BalanceSheetDraftResponse,
    BalanceSheetDraftCreate,
    BalanceSheetDraftUpdate,
    BalanceSheetDraftStatusUpdate,
    BalanceSheetDuplicateRequest,
    BalanceSheetQuickCreate,
    BalanceSheetCalculatedResponse,
    BalanceSheetValidationResponse,
)

router = APIRouter(prefix="/balance-sheet", tags=["balance-sheet"])


@router.get("/templates", response_model=list[BalanceSheetTemplateResponse])
async def list_templates(
    business_type: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    service = BalanceSheetTemplateService(db, current_user.organization_id)
    templates = await service.list_templates(business_type)
    return templates


@router.get("/templates/{template_id}", response_model=BalanceSheetTemplateResponse)
async def get_template(
    template_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    service = BalanceSheetTemplateService(db, current_user.organization_id)
    template = await service.get_template(template_id)
    return template


@router.post("/templates/default", response_model=list[BalanceSheetTemplateResponse], status_code=status.HTTP_201_CREATED)
async def create_default_templates(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    service = BalanceSheetTemplateService(db, current_user.organization_id)
    templates = await service.create_default_templates()
    return templates


@router.get("/drafts", response_model=dict)
async def list_drafts(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    service = BalanceSheetTemplateService(db, current_user.organization_id)
    return await service.list_drafts(page, limit, status)


@router.get("/drafts/{draft_id}", response_model=BalanceSheetDraftResponse)
async def get_draft(
    draft_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    service = BalanceSheetTemplateService(db, current_user.organization_id)
    draft = await service.get_draft(draft_id)
    return draft


@router.post("/drafts", response_model=BalanceSheetDraftResponse, status_code=status.HTTP_201_CREATED)
async def create_draft(
    data: BalanceSheetDraftCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    service = BalanceSheetTemplateService(db, current_user.organization_id)
    draft = await service.create_draft(data.model_dump())
    return draft


@router.put("/drafts/{draft_id}", response_model=BalanceSheetDraftResponse)
async def update_draft(
    draft_id: UUID,
    data: BalanceSheetDraftUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    service = BalanceSheetTemplateService(db, current_user.organization_id)
    draft = await service.update_draft(draft_id, data.model_dump(exclude_unset=True))
    return draft


@router.post("/drafts/{draft_id}/calculate", response_model=BalanceSheetCalculatedResponse)
async def calculate_draft(
    draft_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    service = BalanceSheetTemplateService(db, current_user.organization_id)
    draft = await service.get_draft(draft_id)
    totals = await service.calculate_totals(draft.data)
    return {"totals": totals, "draft_id": draft_id}


@router.post("/drafts/{draft_id}/finalize", response_model=BalanceSheetDraftResponse)
async def finalize_draft(
    draft_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    service = BalanceSheetTemplateService(db, current_user.organization_id)
    draft = await service.finalize_draft(draft_id)
    return draft


@router.delete("/drafts/{draft_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_draft(
    draft_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    service = BalanceSheetTemplateService(db, current_user.organization_id)
    await service.delete_draft(draft_id)


@router.post("/quick", response_model=BalanceSheetCalculatedResponse)
async def quick_generate(
    data: BalanceSheetQuickCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    service = BalanceSheetTemplateService(db, current_user.organization_id)
    totals = await service.quick_generate(data.model_dump())
    return {"totals": totals, "draft_id": None}


@router.get("/templates/default/{business_type}", response_model=BalanceSheetTemplateResponse)
async def get_default_template(
    business_type: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    service = BalanceSheetTemplateService(db, current_user.organization_id)
    template = await service.get_default_template(business_type, db)
    if not template:
        from app.core.exceptions import NotFoundException
        raise NotFoundException(f"Default template for business type {business_type} not found")
    return template


@router.put("/drafts/{draft_id}/status", response_model=BalanceSheetDraftResponse)
async def update_draft_status(
    draft_id: UUID,
    data: BalanceSheetDraftStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    service = BalanceSheetTemplateService(db, current_user.organization_id)
    draft = await service.update_draft_status(draft_id, data.status)
    return draft


@router.post("/drafts/{draft_id}/duplicate", response_model=BalanceSheetDraftResponse)
async def duplicate_draft(
    draft_id: UUID,
    data: BalanceSheetDuplicateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    service = BalanceSheetTemplateService(db, current_user.organization_id)
    draft = await service.duplicate_draft(draft_id, data.name)
    return draft


@router.get("/drafts/{draft_id}/validate", response_model=BalanceSheetValidationResponse)
async def validate_draft(
    draft_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    service = BalanceSheetTemplateService(db, current_user.organization_id)
    draft = await service.get_draft(draft_id)
    validation = await service.validate_balance(draft)
    return validation