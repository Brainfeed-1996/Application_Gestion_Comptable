# Backend — Modèles SQLAlchemy (Partie 4)

Ce document décrit les modèles SQLAlchemy suivants : `Tax`, `TaxDeclaration`, `AuditLog`, `BankConnection`, `BankConnectionAccount`, `OCRJob`.

---

## 1. Tax (Taxe)

Représente un taux de taxe applicable (TVA, taxe d'achat, prélèvements sociaux, etc.).

| Colonne | Type | Contraintes |
|---------|------|-------------|
| `id` | Integer (PK) | Identifiant auto-incrémenté |
| `code` | String(20) | Unique, non nul (ex: `tva_20`, `tva_5_5`, `taxe_achat`) |
| `name` | String(100) | Non null (ex: `TVA 20%`) |
| `rate` | Numeric(5,2) | Taux en pourcentage (ex: `20.00`), non nul |
| `type` | String(20) | `vat`, `sales_tax`, `purchase_tax`, `social` |
| `country` | String(2) | Code ISO 3166-1 alpha-2 (ex: `FR`), optionnel |
| `is_active` | Boolean | True par défaut |
| `is_compound` | Boolean | Indique un taux composé, défaut `False` |
| `min_amount` | Numeric(15,2) | Seuil d'application, optionnel |
| `created_at` | DateTime | Date de création |
| `updated_at` | DateTime | Dernière modification |

**Relations :**
- `Tax.declarations` → `TaxDeclaration` (one-to-many)

---

## 2. TaxDeclaration (Déclaration de taxe)

Enregistrement d'une déclaration fiscale périodique (TVA, etc.) pour une organisation.

| Colonne | Type | Contraintes |
|---------|------|-------------|
| `id` | Integer (PK) | Identifiant auto-incrémenté |
| `organization_id` | Integer (FK) | Organisation (table externe), indexé |
| `tax_id` | Integer (FK) | Taxe déclarée, non nul |
| `period` | String(20) | Période (ex: `2025-01`, `Q1-2025`) |
| `start_date` | Date | Début de la période |
| `end_date` | Date | Fin de la période |
| `due_date` | Date | Date limite de dépôt |
| `base_amount` | Numeric(15,2) | Base imposable |
| `tax_amount` | Numeric(15,2) | Montant de la taxe due |
| `currency` | String(3) | Devise (ex: `EUR`) |
| `status` | String(20) | `pending`, `filed`, `paid`, `cancelled` |
| `reference` | String(100) | Numéro de référence fiscale (optionnel) |
| `file_path` | String(500) | Chemin du fichier PDF joint (optionnel) |
| `declared_at` | DateTime | Date de dépôt, optionnel |
| `created_at` | DateTime | Date de création |
| `updated_at` | DateTime | Dernière modification |

**Relations :**
- `TaxDeclaration.tax` → `Tax` (many-to-one)
- `TaxDeclaration.organization` → `Organization` (many-to-one)

---

## 3. AuditLog (Journal d'audit)

Enregistrement immuable de toutes les actions sensibles du système.

| Colonne | Type | Contraintes |
|---------|------|-------------|
| `id` | Integer (PK) | Identifiant auto-incrémenté |
| `organization_id` | Integer (FK) | Organisation concernée, indexé |
| `user_id` | Integer (FK) | Utilisateur ayant effectué l'action, indexé |
| `action` | String(100) | Type d'action (ex: `invoice.create`, `payment.delete`) |
| `resource_type` | String(50) | Type de ressource (ex: `Invoice`, `Payment`) |
| `resource_id` | Integer | Identifiant de la ressource ciblée |
| `ip_address` | String(45) | Adresse IP de l'appel |
| `user_agent` | Text | Agent utilisateur HTTP |
| `details` | JSON / Text | Données contextuelles supplémentaires |
| `success` | Boolean | True si l'action a réussi |
| `created_at` | DateTime | Horodatage de l'événement |

**Relations :**
- `AuditLog.organization` → `Organization` (many-to-one)
- `AuditLog.user` → `User` (many-to-one)

---

## 4. BankConnection (Connexion bancaire)

Connexion sécurisée à un établissement bancaire via un prestataire (ex: TrueLayer, Plaid, Salt Edge).

| Colonne | Type | Contraintes |
|---------|------|-------------|
| `id` | Integer (PK) | Identifiant auto-incrémenté |
| `organization_id` | Integer (FK) | Organisation propriétaire, indexé |
| `provider` | String(50) | Prestataire (ex: `truelayer`, `plaid`, `saltedge`) |
| `provider_connection_id` | String(255) | Identifiant externe du prestataire |
| `status` | String(20) | `active`, `error`, `expired`, `revoked` |
| `access_token` | Text | Token d'accès chiffré |
| `refresh_token` | Text | Token de rafraîchissement chiffré |
| `token_expires_at` | DateTime | Expiration du token d'accès |
| `last_sync_at` | DateTime | Dernière synchronisation réussie |
| `sync_error` | Text | Dernier message d'erreur (optionnel) |
| `created_at` | DateTime | Date de création |
| `updated_at` | DateTime | Dernière modification |

**Relations :**
- `BankConnection.accounts` → `BankConnectionAccount` (one-to-many)
- `BankConnection.organization` → `Organization` (many-to-one)

---

## 5. BankConnectionAccount (Compte bancaire lié)

Compte bancaire synchronisé via une `BankConnection`.

| Colonne | Type | Contraintes |
|---------|------|-------------|
| `id` | Integer (PK) | Identifiant auto-incrémenté |
| `bank_connection_id` | Integer (FK) | Connexion bancaire parente, indexé |
| `provider_account_id` | String(255) | Identifiant du compte chez le prestataire |
| `iban` | String(34) | IBAN chiffré, optionnel |
| `bic` | String(11) | Code BIC, optionnel |
| `account_number` | String(50) | Numéro de compte masqué |
| `currency` | String(3) | Devise (ex: `EUR`) |
| `label` | String(255) | Intitulé du compte |
| `balance` | Numeric(15,2) | Solde actuel |
| `balance_updated_at` | DateTime | Date de la dernière mise à jour du solde |
| `account_type` | String(30) | `checking`, `savings`, `credit`, `card` |
| `is_active` | Boolean | True par défaut |
| `created_at` | DateTime | Date de création |
| `updated_at` | DateTime | Dernière modification |

**Relations :**
- `BankConnectionAccount.bank_connection` → `BankConnection` (many-to-one)

---

## 6. OCRJob (Tâche OCR)

Tâche asynchrone d'extraction de données depuis un document scanné (facture, reçu, etc.).

| Colonne | Type | Contraintes |
|---------|------|-------------|
| `id` | Integer (PK) | Identifiant auto-incrémenté |
| `organization_id` | Integer (FK) | Organisation propriétaire, indexé |
| `document_id` | Integer (FK) | Document source, indexé |
| `status` | String(20) | `pending`, `processing`, `completed`, `failed` |
| `provider` | String(50) | Moteur OCR (ex: `google_vision`, `azure_forms`, `tesseract`) |
| `result` | JSON | Données extraites (lignes, totaux, TVA, etc.) |
| `confidence` | Numeric(5,2) | Score de confiance (0-100), optionnel |
| `error_message` | Text | Message d'erreur en cas d'échec, optionnel |
| `started_at` | DateTime | Début du traitement |
| `completed_at` | DateTime | Fin du traitement, optionnel |
| `created_at` | DateTime | Date de création |

**Relations :**
- `OCRJob.organization` → `Organization` (many-to-one)
- `OCRJob.document` → `Document` (many-to-one)

---

## Relations globales

```
Tax (1) ────< TaxDeclaration (N)
BankConnection (1) ────< BankConnectionAccount (N)
Organization (1) ────< BankConnection (N)
Organization (1) ────< AuditLog (N)
Organization (1) ────< OCRJob (N)
Document (1) ────< OCRJob (N)
```

---

## Notes

- `Tax` et `TaxDeclaration` sont liés à `Organization` via l'intermédiaire de `TaxDeclaration`.
- `AuditLog` est immuable : les entrées sont uniquement insérées, jamais modifiées ou supprimées.
- `BankConnection` chiffre les tokens bancaires (`access_token`, `refresh_token`, `iban`) au repos.
- `OCRJob` utilise un provider configurable (`provider`) pour supporter plusieurs moteurs d'OCR.
- Tous les montants monétaires utilisent `Numeric(15,2)` pour garantir la précision comptable.
- Les clés étrangères sont indexées pour optimiser les jointures courantes.

*(Fin du document — 160 lignes)*
