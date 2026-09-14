# Backend - Logique Métier

## 1. Moteur de réconciliation bancaire

### 1.1 Algorithme de matching

#### Matching exact
Le matching exact compare les écritures bancaires aux écritures comptables sur la base de critères stricts :

- **Montant** : correspondance exacte (égalité à l'éuro près, avec arrondi bancaire)
- **Date** : écart autorisé de N jours ouvrables (généralement 1 à 3 jours)
- **Libellé** : normalisation puis comparaison (suppression des espaces, punctuation, préfinxes de numéros d'opération)

```python
class ExactMatcher:
    def __init__(self, tolerance_days: int = 2, tolerance_cents: int = 0):
        self.tolerance_days = tolerance_days
        self.tolerance_cents = tolerance_cents

    def match(self, bank_lines, ledger_lines):
        matched, unmatched_bank, unmatched_ledger = [], [], list(ledger_lines)
        for bl in bank_lines:
            candidates = [
                ll for ll in unmatched_ledger
                if abs((bl.date - ll.date).days) <= self.tolerance_days
                and abs(bl.amount - ll.amount) <= self.tolerance_cents / 100
            ]
            if candidates:
                best = min(candidates, key=lambda c: abs((bl.date - c.date).days))
                matched.append((bl, best))
                unmatched_ledger.remove(best)
            else:
                unmatched_bank.append(bl)
        return matched, unmatched_bank, unmatched_ledger
```

#### Matching fuzzy
Le matching fuzzy utilise la distance de Levenshtein et des règles sémantiques pour trouver des correspondances imparfaites :

- **Normalisation des libellés** : suppression des préfixes bancaires (VIREMENT, CHQ, PRELEVEMENT), des numéros de référence, des espaces superflus
- **Distance de similarité** : ratio de similarité `difflib.SequenceMatcher` ou `rapidfuzz.fuzz.ratio`
- **Heuristiques** : correspondance partielle (ex: "PRElevement X" ↔ "Paiement X"), groupement par tiers

```python
import re
from rapidfuzz import fuzz, process

class FuzzyMatcher:
    def __init__(self, threshold: float = 85.0):
        self.threshold = threshold

    @staticmethod
    def _normalize(label: str) -> str:
        label = label.upper()
        label = re.sub(r'\b(VIREMENT|CHQ|PRELEVEMENT|PAIEMENT|REF|N°)\b', '', label)
        label = re.sub(r'\d+', '', label)
        label = re.sub(r'[^\w\s]', '', label)
        return ' '.join(label.split())

    def match(self, bank_lines, ledger_lines):
        matches = []
        for bl in bank_lines:
            bank_label = self._normalize(bl.label)
            best_score, best_ll = 0, None
            for ll in ledger_lines:
                score = fuzz.ratio(bank_label, self._normalize(ll.label))
                if score > best_score:
                    best_score, best_ll = score, ll
            if best_score >= self.threshold and best_ll:
                matches.append((bl, best_ll, best_score))
        return matches
```

### 1.2 Score de confiance

Le score de confiance agrège plusieurs signaux pour classer les correspondances :

| Critère | Poids | Description |
|--------|-------|-------------|
| Montant exact | 40 | Correspondance à l'éuro prêt |
| Date proche | 20 | Écart ≤ 3 jours ouvrables |
| Libellé similaire | 25 | Ratio de similarité ≥ 85% |
| Tiers identique | 15 | Même contrepartie/tiers |

```python
class ConfidenceScorer:
    def __init__(self):
        self.weights = {'amount': 0.4, 'date': 0.2, 'label': 0.25, 'party': 0.15}

    def score(self, bank_line, ledger_line):
        s_amount = 1.0 if abs(bank_line.amount - ledger_line.amount) < 0.01 else 0.0
        s_date = max(0, 1 - abs((bank_line.date - ledger_line.date).days) / 7)
        s_label = fuzz.ratio(
            self._norm(bank_line.label), self._norm(ledger_line.label)
        ) / 100
        s_party = 1.0 if bank_line.party_id == ledger_line.party_id else 0.0
        return (
            self.weights['amount'] * s_amount
            + self.weights['date'] * s_date
            + self.weights['label'] * s_label
            + self.weights['party'] * s_party
        )
```

### 1.3 Gestion des écarts

Les écarts sont gérés selon leur type :

- **Écarts de change** : générés par la conversion des devises (appliquée via le taux du jour)
- **Écarts d'arrondi** : différences inférieures au centime (regroupées par compte)
- **Écarts de change constatés** : écritures spécifiques avec les comptes 44566 (acheteurs) / 44567 (vendeurs)

```python
class GapHandler:
    def reconcile_gaps(self, bank_ops, ledger_ops):
        # Regrouper les écarts inférieurs au centime
        tiny_gaps = [g for g in self.find_gaps(bank_ops, ledger_ops) if abs(g.amount) < 0.01]
        if len(tiny_gaps) > 1:
            offset = sum(g.amount for g in tiny_gaps)
            self.create_entry(account="44566", amount=-offset, label="Écarts d'arrondi")

        # Écarts de change
        fx_gaps = [g for g in self.find_gaps(bank_ops, ledger_ops) if g.is_fx]
        for gap in fx_gaps:
            self.create_entry(
                account="44566" if gap.amount > 0 else "44567",
                amount=gap.amount, label=f"Écart de change {gap.currency}"
            )
```

## 2. Calculatrice de TVA

### 2.1 Calcul de la TVA collectée et déductible

La TVA est calculée sur chaque opération selon le sens de la charge :

- **TVA collectée** (produits) : TVA perçue sur les ventes
- **TVA déductible** (charges) : TVA supportée sur les achats

```python
class VatCalculator:
    def __init__(self, rates: dict = None):
        self.rates = rates or {
            'normal': 0.20,
            'reduced': 0.055,
            'super_reduced': 0.025,
            'zero': 0.0,
            'exempt': None,  # Pas de TVA
        }

    def calculate(self, amount_ht: float, rate_key: str) -> dict:
        rate = self.rates.get(rate_key)
        if rate is None:
            return {'vat': 0.0, 'exempt': True}
        vat = round(amount_ht * rate, 2)
        return {'vat': vat, 'total': amount_ht + vat, 'exempt': False}
```

### 2.2 Taux multiples

Le système gère les taux applicables selon les catégories de produits :

```python
VAT_RATES = {
    # Taux normal 20%
    'services': 0.20,
    'biens_meuble': 0.20,
    # Taux réduit 10% (anciennement 5.5%)
    'restauration': 0.10,
    'hotels': 0.10,
    'transport': 0.10,
    # Taux réduit 5.5%
    'livres': 0.055,
    '_presse': 0.055,
    # Taux super réduit 2.5%
    'alimentation': 0.025,
    # Taux zéro
    'export': 0.0,
}
```

### 2.3 Opérations exonérées

Les opérations exonérées n'engendrent pas de TVA ni de droit à déduction :

- Transport et logement de la personne
- Activités bancaires et assurances
- Jeux de hasard
- Certains services d'abattage et de transformation

```python
def is_exempt(activity_type: str) -> bool:
    EXEMPT_ACTIVITIES = {
        'banking', 'insurance', 'gambling', 'healthcare',
        'education', 'nonprofit', 'religious',
    }
    return activity_type.lower() in EXEMPT_ACTIVITIES

def vat_due(operation):
    """Calcule le montant de TVA dû pour une opération."""
    if is_exempt(operation.activity_type):
        return 0.0
    if operation.rate == 0.0:  # Export
        return 0.0
    return operation.net_amount * operation.rate
```

### 2.4 TVA intra-communautaire

La TVA intra-communautaire s'applique aux transactions entre États membres :

- **Livraison intra-communautaire** : exonérée de TVA (taux 0%) avec mention "Intracommunauté"
- **Prestation de service intra-communautaire** : taxée au taux de l'État du client (règle du lieu de prestation)

```python
class EUVatHandler:
    def __init__(self, country_rates: dict):
        self.country_rates = country_rates  # {'FR': 0.20, 'DE': 0.19, ...}

    def eu_transaction(self, seller_country, buyer_country, amount, goods=True):
        if seller_country == buyer_country:
            return self.domestic_vat(amount, seller_country)
        if goods:
            # Livraison: taux 0%, autoliquidation par le client
            return {'vat': 0.0, 'reverse_charge': True}
        else:
            # Service: taux du client
            buyer_rate = self.country_rates.get(buyer_country, 0.0)
            return {'vat': amount * buyer_rate, 'reverse_charge': True}
```

## 3. Moteur d'écritures comptables

### 3.1 Lettrage

Le lettrage reconstitue des mouvements rapprochés entre eux :

- **Lettrage simple** : rapprochement d'une débit à un crédit identique
- **Lettrage multiple** : regoupement de plusieurs écritures

```python
class LedgerEngine:
    def _letrage(self, account: str, currency: str = "EUR"):
        """Lettrage des écritures d'un compte."""
        entries = self.get_unlettered_entries(account, currency)
        groups = []
        for entry in entries:
            matched = False
            for group in groups:
                if group['currency'] == entry.currency and self._can_letrage(group, entry):
                    group['entries'].append(entry)
                    group['debit'] += entry.debit
                    group['credit'] += entry.credit
                    matched = True
                    break
            if not matched:
                groups.append({
                    'entries': [entry], 'debit': entry.debit,
                    'credit': entry.credit, 'currency': entry.currency
                })
        return groups

    def _can_letrage(self, group: dict, entry) -> bool:
        """Vérifie la compatibilité de lettrage."""
        return (
            abs(group['debit'] - group['credit']) > 0.01
            and entry.currency == group['currency']
            and self._same_party(entry, group['entries'][0])
        )
```

### 3.2 Rapprochement bancaire

Le rapprochement compare les mouvements comptables aux relevés bancaires :

```python
class BankReconciler:
    def reconcile(self, account_number: str, statement: BankStatement):
        ledger_entries = self.get_ledger_entries(account_number)
        statement_entries = statement.get_entries()

        # 1. Matching exact
        matcher = ExactMatcher(tolerance_days=2)
        exact, unmatched_bank, unmatched_ledger = matcher.match(
            statement_entries, ledger_entries
        )

        # 2. Matching fuzzy pour le reste
        fuzzy = FuzzyMatcher(threshold=85.0)
        fuzzy_matches = fuzzy.match(unmatched_bank, unmatched_ledger)

        # 3. Génération du rapprochement
        reconciliation = Reconciliation(
            account=account_number,
            date=statement.date,
            matched=exact + fuzzy_matches,
            diffs=self._compute_diffs(statement_entries, ledger_entries),
        )
        return reconciliation
```

### 3.3 Règles de comptabilisation

Les règles définissent les comptes à utiliser selon le type d'opération :

```python
COMPTING_RULES = {
    'sale': {
        'debit': '512', 'credit': '706',  # Clients / CA
        'vat_debit': None, 'vat_credit': '44566',
    },
    'purchase': {
        'debit': '607', 'credit': '404',  # Achats / Fournisseurs
        'vat_debit': '44566', 'vat_credit': None,
    },
    'bank_transfer': {
        'debit': '512', 'credit': '514',  # Virement entre comptes
    },
    'salary_payment': {
        'debit': '645', 'credit': '514',  # Salaires / Banque
        'charges': '431',  # Charges sociales
    },
}

class PostingRuleEngine:
    def __init__(self, rules: dict):
        self.rules = rules

    def apply(self, operation_type: str, amount_ht: float, vat: float = 0):
        rule = self.rules[operation_type]
        entries = []
        if rule.get('debit'):
            entries.append(Entry(rule['debit'], amount_ht + vat, 'D'))
        if rule.get('credit'):
            entries.append(Entry(rule['credit'], amount_ht, 'C'))
        if vat and rule.get('vat_credit'):
            entries.append(Entry(rule['vat_credit'], vat, 'C'))
        if vat and rule.get('vat_debit'):
            entries.append(Entry(rule['vat_debit'], vat, 'D'))
        return entries
```

## 4. Workflow de closing

### 4.1 Clôture mensuelle

La clôture mensuelle suit une procédure standardisée :

1. **Encaissement et rapprochement bancaire** : rapprocher tous les comptes bancaires
2. **Lettrage des comptes** : lettrer les comptes de tiers ( clients, fournisseurs)
3. **Calcul de la TVA** : produire le formulaire de déclaration de TVA
4. **Amortissements** : calculer les amortissements du mois
5. **Constats et provisions** : passer les constats d'expiration et provisions pour risques
6. **Clôture des charges et produits** : clôturer les comptes 6xx et 7xx
7. **Récapitulatif** : vérifier l'équilibre du bilan et du compte de résultat

```python
class ClosingWorkflow:
    def __init__(self, period: str, company: Company):
        self.period = period
        self.company = company
        self.steps = [
            self.reconcile_banks,
            self.letrage_tiers,
            self.calculate_vat,
            self.book_depreciations,
            self.book_provisions,
            self.close_incomes_expenses,
            self.verify_balances,
        ]

    def execute(self):
        results = {}
        for step in self.steps:
            step_name = step.__name__
            try:
                result = step()
                results[step_name] = {'status': 'success', 'result': result}
            except Exception as e:
                results[step_name] = {'status': 'error', 'error': str(e)}
                if step_name not in ['verify_balances']:  # Critical steps
                    raise
        return results

    def reconcile_banks(self):
        for account in self.company.bank_accounts:
            stmt = BankStatement.from_account(account, self.period)
            return self.bank_reconciler.reconcile(account.number, stmt)

    def close_incomes_expenses(self):
        """Clôturer les comptes de charge et de produit."""
        balance = 0
        for account in self.company.accounts:
            if account.number.startswith(('6', '7')):
                amount = account.balance(self.period)
                self.ledger.create_entry(
                    account=f"{account.number}.CL",
                    amount=amount,
                    label=f"Clôture {account.label}"
                )
                balance += amount
        # Affectation au compte 120 ou 129
        if balance != 0:
            target = "120" if balance > 0 else "129"
            self.ledger.create_entry(
                account=target,
                amount=abs(balance),
                label="Report à nouveau"
            )
```

### 4.2 Vérifications d'équilibre

Les vérifications garantissent l'exactitude des écritures :

- **Test d'équilibre des écritures** : chaque échéance doit être équilibrée (total débit = total crédit)
- **Test de sincérité** : validation des contreparties et tiers
- **Test de cohérence** : cohérence entre les montants déclarés et les écritures

```python
class BalanceChecker:
    def __init__(self, ledger: LedgerEngine):
        self.ledger = ledger

    def check_trial_balance(self, period: str) -> BalanceReport:
        report = BalanceReport()
        for account in self.ledger.accounts:
            debit, credit = account.totals(period)
            if abs(debit - credit) > 1.0:  # Tolérance 1€
                report.add_imbalance(account.number, debit, credit)
        return report

    def verify_opening_closing(self, period: str) -> ClosingReport:
        opening = self.ledger.get_opening_balance(period)
        movements = self.ledger.get_movements(period)
        closing = self.ledger.get_closing_balance(period)
        diff = (opening + movements) - closing
        if abs(diff) > 0.01:
            return ClosingReport(imbalance=diff, status='ERROR')
        return ClosingReport(status='OK')
```

### 4.3 Génération du bilan et du compte de résultat

Le bilan et le compte de résultat sont générés à partir des soldes comptables :

```python
class FinancialStatementGenerator:
    def generate_balance_sheet(self, period: str) -> BalanceSheet:
        assets = self._sum_accounts('1', period)
        liabilities = self._sum_accounts('2', period)
        equity = self._sum_accounts('3', period)
        return BalanceSheet(
            assets=assets, liabilities=liabilities, equity=equity,
            total_assets=sum(assets.values()),
            total_liabilities=sum(liabilities.values()) + sum(equity.values())
        )

    def generate_income_statement(self, period: str) -> IncomeStatement:
        revenues = self._sum_accounts('7', period)
        charges = self._sum_accounts('6', period)
        vat_collect = self._sum_accounts('44566', period)
        vat_deduct = self._sum_accounts('44566', period)  # débit
        net_income = sum(revenues.values()) - sum(charges.values())
        return IncomeStatement(
            revenues=revenues, charges=charges,
            vat_collect=vat_collect, vat_deduct=vat_deduct,
            net_income=net_income
        )
```

## 5. Exemples de code Python

### 5.1 Modèle de données simplifié

```python
from dataclasses import dataclass
from datetime import date
from enum import Enum
from typing import Optional, List

class VatRate(Enum):
    NORMAL = "20%"
    REDUCED = "10%"
    SUPER_REDUCED = "5.5%"
    ZERO = "0%"
    EXEMPT = "exempt"

@dataclass
class Account:
    number: str
    label: str
    nature: str  # asset, liability, equity, revenue, charge

@dataclass
class LedgerEntry:
    account: Account
    date: date
    debit: float = 0.0
    credit: float = 0.0
    label: str = ""
    party: Optional[str] = None
    reference: Optional[str] = None
    currency: str = "EUR"

@dataclass
class BankLine:
    date: date
    amount: float
    label: str
    currency: str = "EUR"
    party_id: Optional[str] = None

@dataclass
class Operation:
    date: date
    amount_ht: float
    vat_rate: VatRate
    description: str
    party: Optional[str] = None
    is_eu: bool = False
```

### 5.2 Service de TVA avec calculs

```python
from decimal import Decimal, ROUND_HALF_UP

class VatService:
    RATES = {
        VatRate.NORMAL: Decimal('0.20'),
        VatRate.REDUCED: Decimal('0.10'),
        VatRate.SUPER_REDUCED: Decimal('0.055'),
        VatRate.ZERO: Decimal('0.0'),
        VatRate.EXEMPT: None,
    }

    @staticmethod
    def compute_vat(amount_ht: Decimal, rate: VatRate) -> Optional[Decimal]:
        vat_rate = VatService.RATES.get(rate)
        if vat_rate is None:
            return None
        return (amount_ht * vat_rate).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

    @staticmethod
    def total_amount(amount_ht: Decimal, rate: VatRate) -> Decimal:
        vat = VatService.compute_vat(amount_ht, rate)
        if vat is None:
            return amount_ht
        return amount_ht + vat
```

### 5.3 Pipeline de réconciliation complète

```python
import asyncio
from typing import Tuple, List

class ReconciliationPipeline:
    def __init__(self):
        self.exact_matcher = ExactMatcher()
        self.fuzzy_matcher = FuzzyMatcher()
        self.scorer = ConfidenceScorer()

    async def run(self, bank_lines: List[BankLine],
                  ledger_lines: List[LedgerEntry]) -> ReconciliationResult:
        # Étape 1: Matching exact (rapide, parallèle)
        exact = await asyncio.get_event_loop().run_in_executor(
            None, self.exact_matcher.match, bank_lines, ledger_lines
        )
        matched, rest_bank, rest_ledger = exact

        # Étape 2: Scoring de confiance sur les restants
        scored = self._score_candidates(rest_bank, rest_ledger)

        # Étape 3: Matching fuzzy filtré par score
        fuzzy = self.fuzzy_matcher.match(
            [s.bank for s in scored if s.confidence > 0.7], rest_ledger
        )
        matched.extend(fuzzy)

        return ReconciliationResult(
            matched=matched,
            unmatched_bank=self._remaining(rest_bank, [m.bank for m in fuzzy]),
            unmatched_ledger=self._remaining(rest_ledger, [m.ledger for m in fuzzy]),
            scores=[s for s in scored if s.confidence < 0.7],
        )

    def _score_candidates(self, bank_lines, ledger_lines):
        scored = []
        for bl in bank_lines:
            for ll in ledger_lines:
                score = self.scorer.score(bl, ll)
                scored.append(ScoredCandidate(bl, ll, score))
        return sorted(scored, key=lambda x: x.confidence, reverse=True)
```

### 5.4 Clôture automatique

```python
class AutomatedClosing:
    def __init__(self, company_id: str):
        self.company_id = company_id
        self.ledger = LedgerEngine()
        self.checker = BalanceChecker(self.ledger)

    def run_monthly_closing(self, period: str) -> ClosingReport:
        if not self._can_close(period):
            return ClosingReport(status='BLOCKED', reason='Unbalanced')

        # 1. Lettrage automatique
        self.ledger.auto_letrage_all(period)

        # 2. Amortissements
        depreciations = self._compute_depreciations(period)
        self.ledger.book_batch(depreciations)

        # 3. TVA
        vat_entries = self._compute_vat_entries(period)
        self.ledger.book_batch(vat_entries)

        # 4. Clôture résultat
        self._close_profit_and_loss(period)

        # 5. Vérification finale
        report = self.checker.check_trial_balance(period)
        if report.has_imbalances:
            report.status = 'WARNING'
        else:
            report.status = 'SUCCESS'
        return report

    def _can_close(self, period: str) -> bool:
        report = self.checker.check_trial_balance(period)
        return not report.has_imbalances
```
