from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.balance_sheet import BalanceSheetTemplate, BalanceSheetDraft, BalanceSheetItem
from app.core.exceptions import NotFoundException


class BalanceSheetTemplateService:
    def __init__(self, db: AsyncSession, org_id: UUID):
        self.db = db
        self.org_id = org_id

    # Default PCG structure for French accounting
    DEFAULT_PCG_STRUCTURE = {
        "assets": {
            "label": "Actif",
            "categories": [
                {"code": "20-28", "name": "Immobilisations", "accounts": [
                    {"code": "20", "name": "Immobilisations incorporelles"},
                    {"code": "21", "name": "Immobilisations corporelles"},
                    {"code": "22", "name": "Immobilisations en cours"},
                    {"code": "23", "name": "Immobilisations financières"},
                ]},
                {"code": "3", "name": "Stocks et en-cours", "accounts": [
                    {"code": "31", "name": "Matières premières"},
                    {"code": "32", "name": "En cours de production"},
                    {"code": "33", "name": "Produits intermédiaires"},
                    {"code": "34", "name": "Produits finis"},
                    {"code": "35", "name": "Marchandises"},
                ]},
                {"code": "4", "name": "Créances", "accounts": [
                    {"code": "411", "name": "Clients"},
                    {"code": "416", "name": "Clients douteux"},
                    {"code": "445", "name": "État - TVA"},
                    {"code": "46", "name": "Autres créances"},
                ]},
                {"code": "5", "name": "Trésorerie", "accounts": [
                    {"code": "512", "name": "Banque"},
                    {"code": "513", "name": "Caisse"},
                    {"code": "514", "name": "Valeurs à l'encaissement"},
                ]},
            ]
        },
        "liabilities": {
            "label": "Passif",
            "categories": [
                {"code": "1", "name": "Capitaux propres", "accounts": [
                    {"code": "101", "name": "Capital social"},
                    {"code": "106", "name": "Primes liées au capital"},
                    {"code": "11", "name": "Réserves"},
                    {"code": "12", "name": "Résultat de l'exercice"},
                    {"code": "13", "name": "Subventions d'investissement"},
                ]},
                {"code": "15", "name": "Provisions pour risques et charges", "accounts": [
                    {"code": "151", "name": "Provisions pour risques"},
                    {"code": "154", "name": "Provisions pour charges"},
                ]},
                {"code": "16", "name": "Emprunts et dettes assimilées", "accounts": [
                    {"code": "161", "name": "Emprunts obligataires"},
                    {"code": "163", "name": "Emprunts auprès établissements de crédit"},
                    {"code": "164", "name": "Emprunts divers"},
                ]},
                {"code": "4", "name": "Dettes", "accounts": [
                    {"code": "401", "name": "Fournisseurs"},
                    {"code": "408", "name": "Fournisseurs - factures non parvenues"},
                    {"code": "43", "name": "Personnel - rémunérations dues"},
                    {"code": "44", "name": "État - dettes fiscales et sociales"},
                ]},
            ]
        }
    }

    BUSINESS_TYPE_DEFAULTS = {
        "SARL": {"capital_min": 1, "structure_mods": {}},
        "SAS": {"capital_min": 1, "structure_mods": {}},
        "EI": {"capital_min": 0, "structure_mods": {"remove": ["101", "106"]}},
        "SCI": {"capital_min": 1, "structure_mods": {}},
        "SA": {"capital_min": 37000, "structure_mods": {}},
        "EURL": {"capital_min": 1, "structure_mods": {}},
        "SASU": {"capital_min": 1, "structure_mods": {}},
        "ASSOCIATION": {"capital_min": 0, "structure_mods": {"remove": ["101", "106"]}},
    }

    async def list_templates(self, business_type: str | None = None) -> list[BalanceSheetTemplate]:
        query = select(BalanceSheetTemplate).where(
            BalanceSheetTemplate.organization_id.in_([self.org_id, None]),
            BalanceSheetTemplate.is_active == True,
        )
        if business_type:
            query = query.where(BalanceSheetTemplate.business_type == business_type)
        query = query.order_by(BalanceSheetTemplate.is_default.desc(), BalanceSheetTemplate.name)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_template(self, template_id: UUID) -> BalanceSheetTemplate:
        query = select(BalanceSheetTemplate).where(
            BalanceSheetTemplate.id == template_id,
            BalanceSheetTemplate.organization_id.in_([self.org_id, None]),
        )
        result = await self.db.execute(query)
        template = result.scalar_one_or_none()
        if not template:
            raise NotFoundException("Template not found")
        return template

    async def create_default_templates(self) -> list[BalanceSheetTemplate]:
        templates = []
        for biz_type in ["SARL", "SAS", "EI", "SCI", "SA", "EURL", "SASU", "ASSOCIATION"]:
            existing = await self.db.execute(
                select(BalanceSheetTemplate).where(
                    BalanceSheetTemplate.organization_id == self.org_id,
                    BalanceSheetTemplate.business_type == biz_type,
                )
            )
            if existing.scalar_one_or_none():
                continue

            structure = self._adapt_structure_for_business_type(self.DEFAULT_PCG_STRUCTURE, biz_type)
            template = BalanceSheetTemplate(
                organization_id=self.org_id,
                name=f"Bilan standard {biz_type}",
                description=f"Modèle de bilan pré-rempli pour {biz_type} selon le PCG",
                business_type=biz_type,
                is_default=True,
                is_active=True,
                structure=structure,
            )
            self.db.add(template)
            templates.append(template)

        await self.db.flush()
        return templates

    def _adapt_structure_for_business_type(self, structure: dict, business_type: str) -> dict:
        config = self.BUSINESS_TYPE_DEFAULTS.get(business_type, {})
        remove_codes = config.get("structure_mods", {}).get("remove", [])
        if not remove_codes:
            return structure

        import copy
        adapted = copy.deepcopy(structure)
        for side in ["assets", "liabilities"]:
            for cat in adapted[side]["categories"]:
                cat["accounts"] = [a for a in cat["accounts"] if a["code"] not in remove_codes]
        return adapted

    async def create_draft(self, data: dict) -> BalanceSheetDraft:
        template_id = data.get("template_id")
        if not template_id:
            default_templates = await self.list_templates()
            if not default_templates:
                await self.create_default_templates()
                default_templates = await self.list_templates()
            template_id = default_templates[0].id

        template = await self.get_template(template_id)

        draft = BalanceSheetDraft(
            organization_id=self.org_id,
            template_id=template_id,
            name=data.get("name", f"Bilan {date.today().year}"),
            fiscal_year=data.get("fiscal_year", date.today().year),
            status="draft",
            data=data.get("data", {}),
        )
        self.db.add(draft)
        await self.db.flush()

        await self._initialize_items_from_template(draft, template)
        return draft

    async def _initialize_items_from_template(self, draft: BalanceSheetDraft, template: BalanceSheetTemplate):
        structure = template.structure
        for side_key, side_data in structure.items():
            category = "asset" if side_key == "assets" else "liability"
            for cat in side_data["categories"]:
                for acc in cat["accounts"]:
                    item = BalanceSheetItem(
                        draft_id=draft.id,
                        category=category,
                        account_code=acc["code"],
                        account_name=acc["name"],
                        amount=Decimal("0"),
                        is_calculated=False,
                    )
                    self.db.add(item)

        # Add equity items
        equity_items = [
            ("101", "Capital social", "equity"),
            ("106", "Primes liées au capital", "equity"),
            ("11", "Réserves", "equity"),
            ("12", "Résultat de l'exercice", "equity"),
        ]
        for code, name, cat in equity_items:
            item = BalanceSheetItem(
                draft_id=draft.id,
                category=cat,
                account_code=code,
                account_name=name,
                amount=Decimal("0"),
                is_calculated=False,
            )
            self.db.add(item)

        await self.db.flush()

    async def get_draft(self, draft_id: UUID) -> BalanceSheetDraft:
        query = select(BalanceSheetDraft).where(
            BalanceSheetDraft.id == draft_id,
            BalanceSheetDraft.organization_id == self.org_id,
        )
        result = await self.db.execute(query)
        draft = result.scalar_one_or_none()
        if not draft:
            raise NotFoundException("Draft not found")
        return draft

    async def list_drafts(self, page: int = 1, limit: int = 20, status: str | None = None) -> dict:
        query = select(BalanceSheetDraft).where(
            BalanceSheetDraft.organization_id == self.org_id,
            BalanceSheetDraft.deleted_at.is_(None),
        )
        if status:
            query = query.where(BalanceSheetDraft.status == status)
        query = query.order_by(BalanceSheetDraft.updated_at.desc())
        query = query.offset((page - 1) * limit).limit(limit)
        result = await self.db.execute(query)
        drafts = list(result.scalars().all())
        return {"data": drafts, "page": page, "limit": limit, "total": len(drafts)}

    async def update_draft(self, draft_id: UUID, data: dict) -> BalanceSheetDraft:
        draft = await self.get_draft(draft_id)

        if "name" in data:
            draft.name = data["name"]
        if "fiscal_year" in data:
            draft.fiscal_year = data["fiscal_year"]
        if "status" in data:
            draft.status = data["status"]
        if "data" in data:
            draft.data = {**draft.data, **data["data"]}
            draft.calculated_totals = self.calculate_totals(draft.data)

        draft.updated_at = date.today()
        await self.db.flush()
        return draft

    async def calculate_totals(self, input_data: dict) -> dict[str, Any]:
        quick = input_data.get("quick", {})
        detailed = input_data.get("detailed", {})

        tresorerie = Decimal(str(quick.get("tresorerie", detailed.get("512", 0))))
        creances = Decimal(str(quick.get("creances", detailed.get("411", 0))))
        stocks = Decimal(str(quick.get("stocks", detailed.get("3", 0))))
        immobilisations = Decimal(str(quick.get("immobilisations", detailed.get("20-28", 0))))

        capital = Decimal(str(quick.get("capital", detailed.get("101", 0))))
        resultat = Decimal(str(quick.get("resultat", detailed.get("12", 0))))
        reserves = Decimal(str(quick.get("reserves", detailed.get("11", 0))))

        dettes_fournisseurs = Decimal(str(quick.get("dettes_fournisseurs", detailed.get("401", 0))))
        emprunts = Decimal(str(quick.get("emprunts", detailed.get("16", 0))))
        dettes_fiscales = Decimal(str(quick.get("dettes_fiscales", detailed.get("44", 0))))

        total_actif = tresorerie + creances + stocks + immobilisations
        total_dettes = dettes_fournisseurs + emprunts + dettes_fiscales
        capitaux_propres = capital + reserves + resultat
        total_passif = total_dettes + capitaux_propres

        difference = total_actif - total_passif
        equilibre = abs(difference) < Decimal("0.01")

        return {
            "total_actif": float(total_actif),
            "total_passif": float(total_passif),
            "capitaux_propres": float(capitaux_propres),
            "total_dettes": float(total_dettes),
            "difference": float(difference),
            "equilibre": equilibre,
            "breakdown": {
                "actif": {
                    "tresorerie": float(tresorerie),
                    "creances": float(creances),
                    "stocks": float(stocks),
                    "immobilisations": float(immobilisations),
                },
                "passif": {
                    "dettes_fournisseurs": float(dettes_fournisseurs),
                    "emprunts": float(emprunts),
                    "dettes_fiscales": float(dettes_fiscales),
                },
                "capitaux_propres": {
                    "capital": float(capital),
                    "reserves": float(reserves),
                    "resultat": float(resultat),
                },
            }
        }

    async def quick_generate(self, quick_data: dict) -> dict[str, Any]:
        totals = await self.calculate_totals({"quick": quick_data})

        draft = BalanceSheetDraft(
            organization_id=self.org_id,
            template_id=None,
            name=f"Bilan rapide {date.today().year}",
            fiscal_year=date.today().year,
            status="completed",
            data={"quick": quick_data, "detailed": {}},
            calculated_totals=totals,
        )
        self.db.add(draft)
        await self.db.flush()
        return totals

    async def finalize_draft(self, draft_id: UUID) -> BalanceSheetDraft:
        draft = await self.get_draft(draft_id)
        draft.status = "completed"
        draft.calculated_totals = self.calculate_totals(draft.data)
        await self.db.flush()
        return draft

    async def delete_draft(self, draft_id: UUID) -> None:
        draft = await self.get_draft(draft_id)
        draft.deleted_at = date.today()
        draft.status = "archived"
        await self.db.flush()