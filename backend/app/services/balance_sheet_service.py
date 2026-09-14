from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.balance_sheet import BalanceSheetTemplate, BalanceSheetDraft, BalanceSheetItem
from app.core.exceptions import NotFoundException


class BalanceSheetCalculationService:
    def __init__(self, db: AsyncSession, org_id: UUID):
        self.db = db
        self.org_id = org_id

    ACTIF_CATEGORIES = {
        "immobilisations": ["20", "21", "22", "23"],
        "stocks": ["31", "32", "33", "34", "35"],
        "creances": ["411", "416", "445", "46"],
        "tresorerie": ["512", "513", "514"],
    }

    PASSIF_CATEGORIES = {
        "emprunts": ["161", "163", "164"],
        "dettes_fournisseurs": ["401", "408"],
        "dettes_fiscales": ["43", "44"],
        "provisions": ["151", "154"],
    }

    EQUITE_CATEGORIES = {
        "capital": ["101", "106"],
        "reserves": ["11"],
        "resultat": ["12"],
        "subventions": ["13"],
    }

    async def calculate_bilan_totals(self, draft: BalanceSheetDraft) -> dict[str, Any]:
        query = select(BalanceSheetItem).where(BalanceSheetItem.draft_id == draft.id)
        result = await self.db.execute(query)
        items = list(result.scalars().all())

        totals = {
            "actif": {"total": Decimal("0"), "categories": {}},
            "passif": {"total": Decimal("0"), "categories": {}},
            "capitaux_propres": {"total": Decimal("0"), "categories": {}},
        }

        for item in items:
            amount = item.amount
            category = item.category
            account_code = item.account_code

            if category == "asset":
                totals["actif"]["total"] += amount
                cat_name = self._get_actif_category(account_code)
                if cat_name:
                    totals["actif"]["categories"].setdefault(cat_name, Decimal("0"))
                    totals["actif"]["categories"][cat_name] += amount
            elif category == "liability":
                totals["passif"]["total"] += amount
                cat_name = self._get_passif_category(account_code)
                if cat_name:
                    totals["passif"]["categories"].setdefault(cat_name, Decimal("0"))
                    totals["passif"]["categories"][cat_name] += amount
            elif category == "equity":
                totals["capitaux_propres"]["total"] += amount
                cat_name = self._get_equite_category(account_code)
                if cat_name:
                    totals["capitaux_propres"]["categories"].setdefault(cat_name, Decimal("0"))
                    totals["capitaux_propres"]["categories"][cat_name] += amount

        return {
            "actif": {
                "total": float(totals["actif"]["total"]),
                "categories": {k: float(v) for k, v in totals["actif"]["categories"].items()},
            },
            "passif": {
                "total": float(totals["passif"]["total"]),
                "categories": {k: float(v) for k, v in totals["passif"]["categories"].items()},
            },
            "capitaux_propres": {
                "total": float(totals["capitaux_propres"]["total"]),
                "categories": {k: float(v) for k, v in totals["capitaux_propres"]["categories"].items()},
            },
        }

    def _get_actif_category(self, account_code: str) -> str | None:
        for cat, codes in self.ACTIF_CATEGORIES.items():
            for code in codes:
                if account_code.startswith(code):
                    return cat
        return None

    def _get_passif_category(self, account_code: str) -> str | None:
        for cat, codes in self.PASSIF_CATEGORIES.items():
            for code in codes:
                if account_code.startswith(code):
                    return cat
        return None

    def _get_equite_category(self, account_code: str) -> str | None:
        for cat, codes in self.EQUITE_CATEGORIES.items():
            for code in codes:
                if account_code.startswith(code):
                    return cat
        return None

    async def validate_bilan_balance(self, draft: BalanceSheetDraft) -> dict[str, Any]:
        totals = await self.calculate_bilan_totals(draft)

        total_actif = Decimal(str(totals["actif"]["total"]))
        total_passif = Decimal(str(totals["passif"]["total"]))
        total_equite = Decimal(str(totals["capitaux_propres"]["total"]))

        expected_passif = total_passif + total_equite
        difference = total_actif - expected_passif
        is_balanced = abs(difference) < Decimal("0.01")

        return {
            "is_balanced": is_balanced,
            "total_actif": float(total_actif),
            "total_passif_plus_equite": float(expected_passif),
            "difference": float(difference),
            "details": {
                "actif": float(total_actif),
                "passif": float(total_passif),
                "capitaux_propres": float(total_equite),
            },
        }

    async def calculate_liquidity_ratios(self, draft: BalanceSheetDraft) -> dict[str, Any]:
        totals = await self.calculate_bilan_totals(draft)

        actif_categories = totals["actif"]["categories"]
        passif_categories = totals["passif"]["categories"]

        current_assets = (
            Decimal(str(actif_categories.get("tresorerie", 0)))
            + Decimal(str(actif_categories.get("creances", 0)))
            + Decimal(str(actif_categories.get("stocks", 0)))
        )
        liquid_assets = (
            Decimal(str(actif_categories.get("tresorerie", 0)))
            + Decimal(str(actif_categories.get("creances", 0)))
        )
        current_liabilities = (
            Decimal(str(passif_categories.get("dettes_fournisseurs", 0)))
            + Decimal(str(passif_categories.get("dettes_fiscales", 0)))
        )
        total_debt = (
            Decimal(str(passif_categories.get("emprunts", 0)))
            + Decimal(str(passif_categories.get("dettes_fournisseurs", 0)))
            + Decimal(str(passif_categories.get("dettes_fiscales", 0)))
            + Decimal(str(passif_categories.get("provisions", 0)))
        )
        equity = Decimal(str(totals["capitaux_propres"]["total"]))

        ratios = {}
        if current_liabilities > 0:
            ratios["current_ratio"] = float(current_assets / current_liabilities)
            ratios["quick_ratio"] = float(liquid_assets / current_liabilities)
        else:
            ratios["current_ratio"] = None
            ratios["quick_ratio"] = None

        if equity > 0:
            ratios["debt_to_equity"] = float(total_debt / equity)
        else:
            ratios["debt_to_equity"] = None

        ratios["components"] = {
            "current_assets": float(current_assets),
            "liquid_assets": float(liquid_assets),
            "current_liabilities": float(current_liabilities),
            "total_debt": float(total_debt),
            "equity": float(equity),
        }

        return ratios

    async def generate_bilan_summary(self, draft: BalanceSheetDraft) -> dict[str, Any]:
        totals = await self.calculate_bilan_totals(draft)
        validation = await self.validate_bilan_balance(draft)
        ratios = await self.calculate_liquidity_ratios(draft)

        query = select(BalanceSheetItem).where(BalanceSheetItem.draft_id == draft.id)
        result = await self.db.execute(query)
        items = list(result.scalars().all())

        top_actif_items = sorted(
            [i for i in items if i.category == "asset"],
            key=lambda x: x.amount,
            reverse=True
        )[:5]

        top_passif_items = sorted(
            [i for i in items if i.category == "liability"],
            key=lambda x: x.amount,
            reverse=True
        )[:5]

        return {
            "draft_id": str(draft.id),
            "name": draft.name,
            "fiscal_year": draft.fiscal_year,
            "status": draft.status,
            "totals": totals,
            "validation": validation,
            "ratios": ratios,
            "top_actif_items": [
                {"account_code": i.account_code, "account_name": i.account_name, "amount": float(i.amount)}
                for i in top_actif_items
            ],
            "top_passif_items": [
                {"account_code": i.account_code, "account_name": i.account_name, "amount": float(i.amount)}
                for i in top_passif_items
            ],
            "generated_at": datetime.utcnow().isoformat(),
        }


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

    async def get_template_by_id(self, template_id: UUID, org_id: UUID) -> BalanceSheetTemplate | None:
        query = select(BalanceSheetTemplate).where(
            BalanceSheetTemplate.id == template_id,
            BalanceSheetTemplate.organization_id.in_([org_id, None]),
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def create_template(self, template_data: dict) -> BalanceSheetTemplate:
        template = BalanceSheetTemplate(
            organization_id=self.org_id,
            name=template_data["name"],
            description=template_data.get("description"),
            business_type=template_data.get("business_type"),
            is_default=template_data.get("is_default", False),
            is_active=template_data.get("is_active", True),
            structure=template_data["structure"],
        )
        if template.is_default:
            await self._unset_default_templates()
        self.db.add(template)
        await self.db.flush()
        return template

    async def update_template(self, template_id: UUID, data: dict) -> BalanceSheetTemplate:
        template = await self.get_template(template_id)
        if template.organization_id is not None and template.organization_id != self.org_id:
            raise NotFoundException("Template not found")

        if "name" in data:
            template.name = data["name"]
        if "description" in data:
            template.description = data["description"]
        if "business_type" in data:
            template.business_type = data["business_type"]
        if "is_default" in data:
            if data["is_default"]:
                await self._unset_default_templates()
            template.is_default = data["is_default"]
        if "is_active" in data:
            template.is_active = data["is_active"]
        if "structure" in data:
            template.structure = data["structure"]

        await self.db.flush()
        return template

    async def set_default_template(self, template_id: UUID) -> BalanceSheetTemplate:
        template = await self.get_template(template_id)
        await self._unset_default_templates()
        template.is_default = True
        await self.db.flush()
        return template

    async def delete_template(self, template_id: UUID) -> None:
        template = await self.get_template(template_id)
        if template.organization_id is not None and template.organization_id != self.org_id:
            raise NotFoundException("Template not found")
        template.is_active = False
        template.is_default = False
        await self.db.flush()

    async def _unset_default_templates(self) -> None:
        query = select(BalanceSheetTemplate).where(
            BalanceSheetTemplate.organization_id.in_([self.org_id, None]),
            BalanceSheetTemplate.is_default == True,
        )
        result = await self.db.execute(query)
        for t in result.scalars().all():
            t.is_default = False

    async def get_default_template(self) -> BalanceSheetTemplate | None:
        query = select(BalanceSheetTemplate).where(
            BalanceSheetTemplate.organization_id.in_([self.org_id, None]),
            BalanceSheetTemplate.is_default == True,
            BalanceSheetTemplate.is_active == True,
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

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
        draft.calculated_totals = await self.calculate_totals(draft.data)
        draft.finalized_at = datetime.now()
        await self.db.flush()
        return draft

    async def delete_draft(self, draft_id: UUID) -> None:
        draft = await self.get_draft(draft_id)
        draft.deleted_at = date.today()
        draft.status = "archived"
        await self.db.flush()

    async def get_templates_by_org(self, org_id: UUID, db: AsyncSession) -> list[BalanceSheetTemplate]:
        query = select(BalanceSheetTemplate).where(
            BalanceSheetTemplate.organization_id.in_([org_id, None]),
            BalanceSheetTemplate.is_active == True,
        ).order_by(BalanceSheetTemplate.is_default.desc(), BalanceSheetTemplate.name)
        result = await db.execute(query)
        return list(result.scalars().all())

    async def get_default_template(self, business_type: str, db: AsyncSession) -> BalanceSheetTemplate | None:
        query = select(BalanceSheetTemplate).where(
            BalanceSheetTemplate.business_type == business_type,
            BalanceSheetTemplate.is_default == True,
            BalanceSheetTemplate.is_active == True,
            BalanceSheetTemplate.organization_id.is_(None),
        )
        result = await db.execute(query)
        return result.scalar_one_or_none()

    async def create_draft_from_template(self, template_id: UUID, org_id: UUID, name: str) -> BalanceSheetDraft:
        template = await self.get_template(template_id)
        
        draft = BalanceSheetDraft(
            organization_id=org_id,
            template_id=template_id,
            name=name,
            fiscal_year=date.today().year,
            status="draft",
            data={},
        )
        self.db.add(draft)
        await self.db.flush()

        await self._initialize_items_from_template(draft, template)
        return draft

    async def calculate_balance_sheet(self, draft: BalanceSheetDraft) -> dict[str, Any]:
        from sqlalchemy import select as sa_select
        
        query = sa_select(BalanceSheetItem).where(BalanceSheetItem.draft_id == draft.id)
        result = await self.db.execute(query)
        items = list(result.scalars().all())
        
        totals_by_category = {}
        for item in items:
            cat = item.category
            if cat not in totals_by_category:
                totals_by_category[cat] = Decimal("0")
            totals_by_category[cat] += item.amount
        
        total_actif = totals_by_category.get("asset", Decimal("0"))
        total_passif = totals_by_category.get("liability", Decimal("0"))
        total_equity = totals_by_category.get("equity", Decimal("0"))
        total_passif_equity = total_passif + total_equity
        difference = total_actif - total_passif_equity
        equilibre = abs(difference) < Decimal("0.01")
        
        return {
            "total_actif": float(total_actif),
            "total_passif": float(total_passif),
            "total_equity": float(total_equity),
            "total_passif_equity": float(total_passif_equity),
            "difference": float(difference),
            "equilibre": equilibre,
            "by_category": {k: float(v) for k, v in totals_by_category.items()},
        }

    async def validate_balance(self, draft: BalanceSheetDraft) -> dict[str, Any]:
        calculated = await self.calculate_balance_sheet(draft)
        return {
            "is_valid": calculated["equilibre"],
            "difference": calculated["difference"],
            "total_actif": calculated["total_actif"],
            "total_passif_plus_equity": calculated["total_passif_equity"],
            "message": "Balance sheet is balanced" if calculated["equilibre"] else f"Imbalance detected: {calculated['difference']}",
        }

    async def duplicate_draft(self, draft_id: UUID, new_name: str | None = None) -> BalanceSheetDraft:
        original = await self.get_draft(draft_id)
        
        new_draft = BalanceSheetDraft(
            organization_id=self.org_id,
            template_id=original.template_id,
            name=new_name or f"{original.name} (copie)",
            fiscal_year=original.fiscal_year,
            status="draft",
            data=original.data.copy() if original.data else {},
        )
        self.db.add(new_draft)
        await self.db.flush()
        
        query = select(BalanceSheetItem).where(BalanceSheetItem.draft_id == original.id)
        result = await self.db.execute(query)
        items = list(result.scalars().all())
        
        for item in items:
            new_item = BalanceSheetItem(
                draft_id=new_draft.id,
                category=item.category,
                account_code=item.account_code,
                account_name=item.account_name,
                amount=item.amount,
                is_calculated=item.is_calculated,
            )
            self.db.add(new_item)
        
        await self.db.flush()
        return new_draft

    async def update_draft_status(self, draft_id: UUID, status: str) -> BalanceSheetDraft:
        draft = await self.get_draft(draft_id)
        draft.status = status
        draft.updated_at = date.today()
        if status == "completed":
            draft.finalized_at = datetime.now()
            draft.calculated_totals = await self.calculate_totals(draft.data)
        await self.db.flush()
        return draft