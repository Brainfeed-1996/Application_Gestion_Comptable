# Backend — Modèles SQLAlchemy (Partie 5)

Modèles de pilotage financier, de reporting, de notifications et d’intégrations.

## Conventions

- Tous les modèles héritent de `Base`; les UUID utilisent `UUID(as_uuid=True)`.
- Les horodatages utilisent `DateTime(timezone=True)`; les montants utilisent `Numeric(15, 2)`.
- Les données flexibles utilisent `JSONB`; les clés étrangères sont indexées.

## 1. DashboardMetric

Métrique calculée pour le tableau de bord d’une organisation.

- **Champs** : `id` UUID PK; `organization_id` UUID FK non nul; `metric_key` String(100); `metric_value` JSONB; `period_type` String(20); `period_start` Date; `period_end` Date; `computed_at` DateTime.
- **Contraintes** : `period_type` vaut `daily`, `weekly`, `monthly`, `quarterly` ou `yearly`; unique sur `(organization_id, metric_key, period_type, period_start)`.
- **Relation** : `organization` → `Organization`.

## 2. CashFlowProjection

Projection de trésorerie par compte et par date.

- **Champs** : `id` UUID PK; `organization_id` UUID FK non nul; `account_id` UUID FK optionnel; `projection_date` Date; `projected_balance` Numeric(15,2); `expected_inflows` Numeric(15,2); `expected_outflows` Numeric(15,2); `confidence_level` String(20); `created_at` DateTime.
- **Contraintes** : `confidence_level` vaut `low`, `medium` ou `high`; les entrées et sorties valent `0` par défaut.
- **Relations** : `organization` → `Organization`; `account` → `Account`.

## 3. Alert

Règle d’alerte personnalisée et historique de déclenchement.

- **Champs** : `id` UUID PK; `organization_id` UUID FK non nul; `name` String(255); `description` Text; `type` String(50); `condition` JSONB; `threshold` JSONB; `is_active` Boolean; `severity` String(20); `notify_channels` ARRAY(String(50)); `last_triggered_at` DateTime; `trigger_count` Integer; `created_by` UUID FK; `created_at`/`updated_at` DateTime.
- **Contraintes** : `type` vaut `cash_flow`, `budget`, `tax`, `payment`, `invoice`, `reconciliation`, `security` ou `custom`; `severity` vaut `low`, `medium`, `high` ou `critical`; canal par défaut `['in_app']`.
- **Relations** : `organization` → `Organization`; `created_by` → `User`.

## 4. Budget

Budget organisationnel annuel, trimestriel ou mensuel.

- **Champs** : `id` UUID PK; `organization_id` UUID FK non nul; `name` String(255); `fiscal_year` Integer; `period_type` String(20); `status` String(20); `total_planned` Numeric(15,2); `total_actual` Numeric(15,2); `created_by` UUID FK; `created_at`/`updated_at` DateTime.
- **Contraintes** : `period_type` vaut `monthly`, `quarterly` ou `yearly`; `status` vaut `draft`, `active`, `closed` ou `archived`; totaux par défaut `0`.
- **Relations** : `organization` → `Organization`; `items` → `BudgetItem`; `created_by` → `User`.

## 5. BudgetItem

Ligne de budget associée à une catégorie et/ou un compte.

- **Champs** : `id` UUID PK; `budget_id` UUID FK non nul; `category_id` UUID FK optionnel; `account_id` UUID FK optionnel; `planned_amount` Numeric(15,2); `actual_amount` Numeric(15,2); `period` String(20).
- **Contraintes** : montants par défaut `0`; unique sur `(budget_id, category_id, period)`.
- **Relations** : `budget` → `Budget`; `category` → `TransactionCategory`; `account` → `Account`.

## 6. RecurringExpense

Dépense récurrente pouvant générer automatiquement des écritures.

- **Champs** : `id` UUID PK; `organization_id` UUID FK non nul; `account_id` UUID FK optionnel; `category_id` UUID FK optionnel; `name` String(255); `amount` Numeric(15,2); `currency` String(3); `frequency` String(20); `interval_count` Integer; `next_run_date` Date; `end_date` Date; `max_occurrences` Integer; `occurrence_count` Integer; `is_active` Boolean; `auto_book` Boolean; `counterparty` String(255); `created_by` UUID FK; `created_at`/`updated_at` DateTime.
- **Contraintes** : `amount > 0`; `interval_count > 0`; `frequency` vaut `daily`, `weekly`, `biweekly`, `monthly`, `quarterly` ou `yearly`; devise par défaut `EUR`.
- **Relations** : `organization` → `Organization`; `account` → `Account`; `category` → `TransactionCategory`; `created_by` → `User`.

## 7. FinancialStatement

Rapport financier généré pour une période donnée.

- **Champs** : `id` UUID PK; `organization_id` UUID FK non nul; `statement_type` String(20); `period_type` String(20); `period_start` Date; `period_end` Date; `data` JSONB; `total_assets`, `total_liabilities`, `total_equity`, `total_revenue`, `total_expenses`, `net_income` Numeric(15,2); `currency` String(3); `generated_at` DateTime; `generated_by` UUID FK; `is_locked` Boolean.
- **Contraintes** : `statement_type` vaut `balance_sheet`, `income_statement`, `cash_flow` ou `trial_balance`; `period_type` vaut `monthly`, `quarterly`, `yearly` ou `ytd`.
- **Relations** : `organization` → `Organization`; `generated_by` → `User`.

## 8. FECExport

Export FEC ou fichier comptable associé à une période.

- **Champs** : `id` UUID PK; `organization_id` UUID FK non nul; `file_name` String(255); `file_path` Text; `file_size` BigInteger; `format` String(20); `period_start` Date; `period_end` Date; `status` String(20); `transaction_count` Integer; `requested_by` UUID FK; `requested_at` DateTime; `completed_at` DateTime.
- **Contraintes** : `format` vaut `fec`, `csv`, `excel` ou `json`; `status` vaut `pending`, `generating`, `completed`, `failed` ou `archived`.
- **Relations** : `organization` → `Organization`; `requested_by` → `User`.

## 9. Notification

Notification intra-application, email ou push destinée à un utilisateur.

- **Champs** : `id` UUID PK; `organization_id` UUID FK optionnel; `user_id` UUID FK non nul; `type` String(50); `title` String(255); `message` Text; `link` String(500); `priority` String(10); `is_read` Boolean; `read_at` DateTime; `action_data` JSONB; `created_at` DateTime.
- **Contraintes** : `priority` vaut `low`, `normal`, `high` ou `urgent`; `is_read` vaut `False` par défaut.
- **Relations** : `organization` → `Organization`; `user` → `User`.

## 10. WebhookLog

Journal d’un webhook reçu et de son traitement.

- **Champs** : `id` BigInteger PK auto-incrémentée; `organization_id` UUID FK optionnel; `source` String(50); `event_type` String(100); `payload` JSONB; `headers` JSONB; `signature_valid` Boolean; `processing_status` String(20); `attempts` Integer; `max_attempts` Integer; `error_message` Text; `ip_address` INET/String(45); `created_at` DateTime.
- **Contraintes** : `processing_status` vaut `pending`, `processing`, `processed`, `failed` ou `retry`; tentatives par défaut `0`, maximum `5`.
- **Relation** : `organization` → `Organization`.

## Relations globales

```text
Organization (1) ──< DashboardMetric, CashFlowProjection, Alert, Budget
Organization (1) ──< RecurringExpense, FinancialStatement, FECExport, Notification
Organization (1) ──< WebhookLog
Account (1) ──< CashFlowProjection, BudgetItem, RecurringExpense
Budget (1) ──< BudgetItem
TransactionCategory (1) ──< BudgetItem, RecurringExpense
User (1) ──< Notification
User (1) ──< Alert, Budget, RecurringExpense, FinancialStatement, FECExport
```

## Notes techniques

- Les requêtes applicatives filtrent toujours par `organization_id` pour assurer l’isolation multi-tenant.
- Les index composites couvrent les périodes, statuts et prochaines échéances.
- `JSONB` conserve les métriques, conditions, rapports et payloads sans figer leur structure.
