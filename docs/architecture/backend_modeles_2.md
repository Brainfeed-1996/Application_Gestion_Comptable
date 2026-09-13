# Backend - Modèles SQLAlchemy (Partie 2)

Ce document décrit les modèles SQLAlchemy utilisés dans l'application comptable :
`Account`, `TransactionCategory`, `Transaction`, `Invoice`, `InvoiceItem`.

---

## 1. Account (Compte comptable)

Représente un compte comptable (actif, passif, revenus, dépenses, etc.).

| Colonne | Type | Contraintes |
|---------|------|-------------|
| `id` | Integer (PK) | Identifiant auto-incrémenté |
| `code` | String(20) | Unique, non nul (ex: "401", "601") |
| `name` | String(150) | Non null, nom du compte |
| `type` | String(50) | Type de compte (asset, liability, revenue, expense, equity) |
| `parent_id` | Integer (FK) | Optionnel, compte parent hiérarchique |
| `is_active` | Boolean | True par défaut |
| `created_at` | DateTime | Date de création |
| `updated_at` | DateTime | Date de dernière modification |

**Relations :**
- `Account.parent` → `Account` (self-referential, many-to-one)
- `Account.children` → `Account` (one-to-many)

---

## 2. TransactionCategory (Catégorie de transaction)

Catégorise les transactions (ex: "Vente", "Achat", "Frais bancaires").

| Colonne | Type | Contraintes |
|---------|------|-------------|
| `id` | Integer (PK) | Identifiant auto-incrémenté |
| `name` | String(100) | Non null, nom unique |
| `code` | String(20) | Optionnel, code catégoriel |
| `type` | String(50) | revenue, expense, asset, liability |
| `account_id` | Integer (FK) | Compte comptable associé |
| `is_active` | Boolean | True par défaut |
| `created_at` | DateTime | Date de création |

**Relations :**
- `TransactionCategory.account` → `Account` (many-to-one)

---

## 3. Transaction (Transaction)

Enregistrement d'une opération financière.

| Colonne | Type | Contraintes |
|---------|------|-------------|
| `id` | Integer (PK) | Identifiant auto-incrémenté |
| `category_id` | Integer (FK) | Catégorie de la transaction |
| `account_id` | Integer (FK) | Compte comptable touché |
| `amount` | Numeric(15,2) | Montant, non nul |
| `type` | String(20) | debit ou credit |
| `transaction_date` | Date | Date de la transaction |
| `description` | Text | Description libre |
| `reference` | String(100) | Optionnel, référence externe |
| `status` | String(20) | pending, posted, cancelled |
| `created_at` | DateTime | Date de création |
| `updated_at` | DateTime | Date de dernière modification |

**Relations :**
- `Transaction.category` → `TransactionCategory` (many-to-one)
- `Transaction.account` → `Account` (many-to-one)

---

## 4. Invoice (Facture)

Facture émise ou reçue.

| Colonne | Type | Contraintes |
|---------|------|-------------|
| `id` | Integer (PK) | Identifiant auto-incrémenté |
| `invoice_number` | String(50) | Unique, non nul |
| `customer_id` | Integer (FK) | Client (table externe) |
| `supplier_id` | Integer (FK) | Fournisseur (table externe) |
| `invoice_date` | Date | Date de facturation |
| `due_date` | Date | Date d'échéance |
| `total_ht` | Numeric(15,2) | Total hors taxes |
| `total_tva` | Numeric(15,2) | Total TVA |
| `total_ttc` | Numeric(15,2) | Total TTC |
| `status` | String(20) | draft, sent, paid, cancelled |
| `type` | String(20) | sale (émise) ou purchase (reçue) |
| `currency` | String(3) | Devise (ex: EUR, USD) |
| `created_at` | DateTime | Date de création |
| `updated_at` | DateTime | Date de dernière modification |

**Relations :**
- `Invoice.items` → `InvoiceItem` (one-to-many)

---

## 5. InvoiceItem (Ligne de facture)

Ligne détaillée d'une facture.

| Colonne | Type | Contraintes |
|---------|------|-------------|
| `id` | Integer (PK) | Identifiant auto-incrémenté |
| `invoice_id` | Integer (FK) | Facture parente |
| `description` | String(255) | Non null, description du poste |
| `quantity` | Numeric(10,2) | Quantité, non nul |
| `unit_price` | Numeric(15,2) | Prix unitaire HT |
| `tva_rate` | Numeric(5,2) | Taux TVA (ex: 20.00 pour 20%) |
| `line_total_ht` | Numeric(15,2) | Total ligne HT |
| `line_total_tva` | Numeric(15,2) | TVA ligne |
| `line_total_ttc` | Numeric(15,2) | Total ligne TTC |

**Relations :**
- `InvoiceItem.invoice` → `Invoice` (many-to-one)

---

## Relations globales

```
Account (1) ────< TransactionCategory (N)
Account (1) ────< Transaction (N)
TransactionCategory (1) ────< Transaction (N)
Invoice (1) ────< InvoiceItem (N)
```

---

## Notes

- Tous les modèles héritent d'une base commune avec `created_at`/`updated_at`.
- Les montants utilisent `Numeric(15,2)` pour éviter les erreurs d'arrondis.
- Les index sont créés sur les clés étrangères et les champs de recherche fréquents
  (`invoice_number`, `transaction_date`, `status`).