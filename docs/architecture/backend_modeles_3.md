# Backend — Modèles SQLAlchemy (Partie 3)

Ce document décrit les modèles SQLAlchemy suivants : `Quote`, `QuoteItem`, `PaymentMethod`, `Payment`, `SubscriptionPlan`, `Subscription`.

---

## 1. Quote (Devis)

Représente un devis émis à un client.

| Colonne | Type | Contraintes |
|---------|------|-------------|
| `id` | Integer (PK) | Identifiant auto-incrémenté |
| `quote_number` | String(50) | Unique, non nul |
| `customer_id` | Integer (FK) | Client (table externe) |
| `issue_date` | Date | Date de création du devis |
| `expiration_date` | Date | Date d'expiration |
| `status` | String(20) | draft, sent, accepted, refused, cancelled |
| `currency` | String(3) | Devise (ex: EUR) |
| `total_ht` | Numeric(15,2) | Total hors taxes |
| `total_tva` | Numeric(15,2) | Total TVA |
| `total_ttc` | Numeric(15,2) | Total TTC |
| `created_at` | DateTime | Date de création |
| `updated_at` | DateTime | Dernière modification |

**Relations :**
- `Quote.items` → `QuoteItem` (one-to-many)
- `Quote.payments` → `Payment` (one-to-many)

---

## 2. QuoteItem (Ligne de devis)

Ligne détaillée d'un devis.

| Colonne | Type | Contraintes |
|---------|------|-------------|
| `id` | Integer (PK) | Identifiant auto-incrémenté |
| `quote_id` | Integer (FK) | Devis parent |
| `description` | String(255) | Non null |
| `quantity` | Numeric(10,2) | Quantité, non nul |
| `unit_price` | Numeric(15,2) | Prix unitaire HT |
| `tva_rate` | Numeric(5,2) | Taux TVA (ex: 20.00) |
| `line_total_ht` | Numeric(15,2) | Total ligne HT |
| `line_total_tva` | Numeric(15,2) | TVA ligne |
| `line_total_ttc` | Numeric(15,2) | Total ligne TTC |
| `account_id` | Integer (FK) | Compte comptable associé (optionnel) |

**Relations :**
- `QuoteItem.quote` → `Quote` (many-to-one)
- `QuoteItem.account` → `Account` (many-to-one)

---

## 3. PaymentMethod (Moyen de paiement)

Définit les moyens de paiement acceptés (virement, carte bancaire, chèque, etc.).

| Colonne | Type | Contraintes |
|---------|------|-------------|
| `id` | Integer (PK) | Identifiant auto-incrémenté |
| `name` | String(100) | Non null, unique |
| `code` | String(20) | Non null, unique (ex: `bank_transfer`, `card`, `check`) |
| `is_active` | Boolean | True par défaut |
| `created_at` | DateTime | Date de création |
| `updated_at` | DateTime | Dernière modification |

**Relations :**
- `PaymentMethod.payments` → `Payment` (one-to-many)

---

## 4. Payment (Paiement)

Enregistrement d'un règlement partiel ou total lié à un devis.

| Colonne | Type | Contraintes |
|---------|------|-------------|
| `id` | Integer (PK) | Identifiant auto-incrémenté |
| `quote_id` | Integer (FK) | Devis rattaché |
| `payment_method_id` | Integer (FK) | Moyen de paiement |
| `amount` | Numeric(15,2) | Montant du paiement, non nul |
| `payment_date` | DateTime | Non null, défaut `now` |
| `reference` | String(100) | Référence bancaire ou externe (optionnel) |
| `currency` | String(3) | Devise (ex: EUR) |
| `status` | String(20) | pending, completed, failed, cancelled |
| `created_at` | DateTime | Date de création |
| `updated_at` | DateTime | Dernière modification |

**Relations :**
- `Payment.quote` → `Quote` (many-to-one)
- `Payment.payment_method` → `PaymentMethod` (many-to-one)

---

## 5. SubscriptionPlan (Plan d'abonnement)

Plan tarifaire d'un abonnement récurrent.

| Colonne | Type | Contraintes |
|---------|------|-------------|
| `id` | Integer (PK) | Identifiant auto-incrémenté |
| `name` | String(100) | Non null |
| `code` | String(20) | Non null, unique (ex: `monthly_basic`, `annual_pro`) |
| `description` | Text | Optionnel |
| `price` | Numeric(15,2) | Prix unitaire, non nul |
| `currency` | String(3) | Devise, défaut `EUR` |
| `interval` | String(20) | `month` ou `year` |
| `interval_count` | Integer | Nombre de périodes (ex: 1 pour mensuel) |
| `is_active` | Boolean | True par défaut |
| `created_at` | DateTime | Date de création |
| `updated_at` | DateTime | Dernière modification |

**Relations :**
- `SubscriptionPlan.subscriptions` → `Subscription` (one-to-many)

---

## 6. Subscription (Abonnement)

Instance d'un abonnement souscrit par un client à un plan tarifaire.

| Colonne | Type | Contraintes |
|---------|------|-------------|
| `id` | Integer (PK) | Identifiant auto-incrémenté |
| `customer_id` | Integer (FK) | Client (table externe) |
| `plan_id` | Integer (FK) | Plan d'abonnement |
| `status` | String(20) | active, cancelled, expired, past_due |
| `start_date` | Date | Date de début |
| `end_date` | Date | Date de fin prévue |
| `cancelled_at` | DateTime | Date d'annulation (optionnel) |
| `next_billing_date` | Date | Prochain prélèvement |
| `payment_method_id` | Integer (FK) | Moyen de paiement par défaut |
| `created_at` | DateTime | Date de création |
| `updated_at` | DateTime | Dernière modification |

**Relations :**
- `Subscription.plan` → `SubscriptionPlan` (many-to-one)
- `Subscription.payment_method` → `PaymentMethod` (many-to-one)

---

## Relations globales

```
Quote (1) ────< QuoteItem (N)
Quote (1) ────< Payment (N)
PaymentMethod (1) ────< Payment (N)
SubscriptionPlan (1) ────< Subscription (N)
PaymentMethod (1) ────< Subscription (N)
```

---

## Notes

- Tous les montants utilisent `Numeric(15,2)` pour garantir la précision des calculs comptables.
- Les clés étrangères sont indexées pour optimiser les jointures.
- Les statuts sont normalisés via des chaînes de caractères (`String`) pour rester lisibles dans les logs.
- Le modèle `Subscription` supporte les scénarios d'essai et de périodicité (`interval`, `interval_count`).
- Le lien entre `Quote` et `Payment` permet de suivre les règlements partiels d'un devis.