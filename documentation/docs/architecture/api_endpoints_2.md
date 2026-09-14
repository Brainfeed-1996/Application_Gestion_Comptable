# API Endpoints Documentation

## Accounts

### Account List
- **Méthode:** `GET`
- **Chemin:** `/api/v1/accounts`
- **Paramètres:**
  - `sort` (string, optionnel) - `name`, `balance`, `-created_at`
  - `filter[is_active]` (bool, optionnel)
  - `page` (int, défaut 1)
  - `per_page` (int, défaut 25)
- **Réponse 200:**
```json
{
  "data": [
    {
      "id": "acc_123",
      "name": "Banque BNP",
      "iban": "FR7612345678901234567890185",
      "balance": 5420.50,
      "currency": "EUR",
      "type": "bank",
      "is_active": true,
      "created_at": "2025-01-15T10:30:00Z"
    }
  ],
  "meta": { "total": 12, "page": 1, "per_page": 25 }
}
```

### Create Account
- **Méthode:** `POST`
- **Chemin:** `/api/v1/accounts`
- **Body:**
```json
{
  "name": "Caisse Chèques",
  "iban": "FR7612345678901234567890185",
  "currency": "EUR",
  "type": "cash",
  "is_active": true
}
```
- **Réponse 201:**
```json
{
  "id": "acc_456",
  "name": "Caisse Chèques",
  "iban": "FR7612345678901234567890185",
  "balance": 0.0,
  "currency": "EUR",
  "type": "cash",
  "is_active": true,
  "created_at": "2025-09-13T12:00:00Z"
}
```

### Account Detail
- **Méthode:** `GET`
- **Chemin:** `/api/v1/accounts/{account_id}`
- **Réponse 200:**
```json
{
  "id": "acc_123",
  "name": "Banque BNP",
  "iban": "FR7612345678901234567890185",
  "balance": 5420.50,
  "currency": "EUR",
  "type": "bank",
  "is_active": true,
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-09-13T08:15:00Z"
}
```

### Update Account
- **Méthode:** `PATCH`
- **Chemin:** `/api/v1/accounts/{account_id}`
- **Body:**
```json
{ "name": "Banque BNP (Mis à jour)", "is_active": false }
```
- **Réponse 200:** *(même format que détail)*

### Delete Account
- **Méthode:** `DELETE`
- **Chemin:** `/api/v1/accounts/{account_id}`
- **Réponse 204:** *No content*

### Sync Accounts
- **Méthode:** `POST`
- **Chemin:** `/api/v1/accounts/sync`
- **Body:**
```json
{
  "provider": "fintech_bank",
  "credentials": { "login": "user@example.com", "password": "***" },
  "start_date": "2025-09-01"
}
```
- **Réponse 202:**
```json
{
  "sync_id": "sync_abc",
  "status": "in_progress",
  "message": "Synchronisation lancée. Utilisez GET /api/v1/accounts/sync/{sync_id} pour suivre."
}
```

### Sync Status
- **Méthode:** `GET`
- **Chemin:** `/api/v1/accounts/sync/{sync_id}`
- **Réponse 200:**
```json
{
  "sync_id": "sync_abc",
  "status": "completed",
  "accounts_created": 2,
  "accounts_updated": 3,
  "transactions_new": 15
}
```

---

## Transactions

### Transaction List
- **Méthode:** `GET`
- **Chemin:** `/api/v1/transactions`
- **Paramètres:**
  - `account_id` (string, optionnel)
  - `date_from` (date, optionnel)
  - `date_to` (date, optionnel)
  - `min_amount` / `max_amount` (decimal, optionnel)
  - `category_id` (string, optionnel)
  - `sort` - `date`, `-date`, `amount`
  - `page`, `per_page`
- **Réponse 200:**
```json
{
  "data": [
    {
      "id": "tx_789",
      "account_id": "acc_123",
      "date": "2025-09-10",
      "label": "Achat fournisseur",
      "amount": -250.00,
      "currency": "EUR",
      "type": "debit",
      "category_id": "cat_001",
      "category_name": "Fournitures",
      "is_reconciled": true,
      "created_at": "2025-09-10T14:00:00Z"
    }
  ],
  "meta": { "total": 342, "page": 1, "per_page": 25 }
}
```

### Create Transaction
- **Méthode:** `POST`
- **Chemin:** `/api/v1/transactions`
- **Body:**
```json
{
  "account_id": "acc_123",
  "date": "2025-09-13",
  "label": "Facture électricité",
  "amount": -85.40,
  "currency": "EUR",
  "category_id": "cat_005"
}
```
- **Réponse 201:**
```json
{
  "id": "tx_999",
  "account_id": "acc_123",
  "date": "2025-09-13",
  "label": "Facture électricité",
  "amount": -85.40,
  "currency": "EUR",
  "type": "debit",
  "category_id": "cat_005",
  "category_name": "Énergie",
  "is_reconciled": false,
  "created_at": "2025-09-13T12:00:00Z"
}
```

### Transaction Detail
- **Méthode:** `GET`
- **Chemin:** `/api/v1/transactions/{transaction_id}`
- **Réponse 200:** *(mêmes champs que liste)*

### Update Transaction
- **Méthode:** `PATCH`
- **Chemin:** `/api/v1/transactions/{transaction_id}`
- **Body:**
```json
{ "category_id": "cat_010", "label": "Facture EDF" }
```
- **Réponse 200:** *(mêmes champs que détail)*

### Delete Transaction
- **Méthode:** `DELETE`
- **Chemin:** `/api/v1/transactions/{transaction_id}`
- **Réponse 204:** *No content*

### Bulk Create Transactions
- **Méthode:** `POST`
- **Chemin:** `/api/v1/transactions/bulk`
- **Body:**
```json
{
  "transactions": [
    { "account_id": "acc_123", "date": "2025-09-12", "label": "Café", "amount": -4.50 },
    { "account_id": "acc_123", "date": "2025-09-12", "label": "Déjeuner", "amount": -18.20 }
  ]
}
```
- **Réponse 201:**
```json
{
  "created": 2,
  "errors": [],
  "data": [ { "id": "tx_a01", "amount": -4.50 }, { "id": "tx_a02", "amount": -18.20 } ]
}
```

### Categorize Transactions
- **Méthode:** `PATCH`
- **Chemin:** `/api/v1/transactions/categorize`
- **Body:**
```json
{
  "transaction_ids": ["tx_789", "tx_999"],
  "category_id": "cat_005"
}
```
- **Réponse 200:**
```json
{
  "updated": 2,
  "data": [ { "id": "tx_789", "category_id": "cat_005" }, { "id": "tx_999", "category_id": "cat_005" } ]
}
```

### Search Transactions
- **Méthode:** `POST`
- **Chemin:** `/api/v1/transactions/search`
- **Body:**
```json
{
  "query": "facture",
  "amount_min": -500,
  "amount_max": -10,
  "date_from": "2025-09-01",
  "category_ids": ["cat_001", "cat_005"],
  "account_ids": ["acc_123"]
}
```
- **Réponse 200:**
```json
{
  "data": [ { "id": "tx_789", "label": "Facture électricité", "amount": -85.40 } ],
  "meta": { "total": 1 }
}
```

---

## Invoices

### Invoice List
- **Méthode:** `GET`
- **Chemin:** `/api/v1/invoices`
- **Paramètres:** `status` (draft|sent|paid|void), `client_id`, `date_from`, `date_to`, `sort`, `page`, `per_page`
- **Réponse 200:**
```json
{
  "data": [
    {
      "id": "inv_001",
      "number": "F-2025-001",
      "client_id": "cli_100",
      "client_name": "Sarl Exemple",
      "issue_date": "2025-09-01",
      "due_date": "2025-09-30",
      "total": 1250.00,
      "tax_total": 210.00,
      "amount_paid": 0.00,
      "currency": "EUR",
      "status": "draft",
      "created_at": "2025-09-01T09:00:00Z"
    }
  ],
  "meta": { "total": 8, "page": 1, "per_page": 25 }
}
```

### Create Invoice
- **Méthode:** `POST`
- **Chemin:** `/api/v1/invoices`
- **Body:**
```json
{
  "client_id": "cli_100",
  "issue_date": "2025-09-13",
  "due_date": "2025-10-13",
  "currency": "EUR",
  "lines": [
    { "description": "Développement", "unit_price": 1000.00, "quantity": 1, "tax_rate": 20 },
    { "description": "Hébergement", "unit_price": 50.00, "quantity": 5, "tax_rate": 20 }
  ]
}
```
- **Réponse 201:**
```json
{
  "id": "inv_002",
  "number": "F-2025-002",
  "client_id": "cli_100",
  "client_name": "Sarl Exemple",
  "issue_date": "2025-09-13",
  "due_date": "2025-10-13",
  "subtotal": 1250.00,
  "tax_total": 250.00,
  "total": 1500.00,
  "amount_paid": 0.00,
  "currency": "EUR",
  "status": "draft",
  "lines": [
    { "id": "invli_1", "description": "Développement", "quantity": 1, "unit_price": 1000.00, "tax_rate": 20, "tax_amount": 200.00, "total": 1200.00 },
    { "id": "invli_2", "description": "Hébergement", "quantity": 5, "unit_price": 50.00, "tax_rate": 20, "tax_amount": 50.00, "total": 300.00 }
  ],
  "created_at": "2025-09-13T12:00:00Z"
}
```

### Invoice Detail
- **Méthode:** `GET`
- **Chemin:** `/api/v1/invoices/{invoice_id}`
- **Réponse 200:** *(format complet avec `lines`)*

### Update Invoice
- **Méthode:** `PATCH`
- **Chemin:** `/api/v1/invoices/{invoice_id}`
- **Body:**
```json
{ "due_date": "2025-10-20", "notes": "Paiement à reporter" }
```
- **Réponse 200:** *(format complet)*

### Delete Invoice
- **Méthode:** `DELETE`
- **Chemin:** `/api/v1/invoices/{invoice_id}`
- **Réponse 204:** *No content*

### Send Invoice
- **Méthode:** `POST`
- **Chemin:** `/api/v1/invoices/{invoice_id}/send`
- **Body (optionnel):**
```json
{ "email": "client@example.com", "message": "Veuillez trouver pièce jointe la facture." }
```
- **Réponse 200:**
```json
{
  "id": "inv_002",
  "status": "sent",
  "sent_at": "2025-09-13T12:30:00Z",
  "email": "client@example.com"
}
```

### Mark Invoice Paid
- **Méthode:** `POST`
- **Chemin:** `/api/v1/invoices/{invoice_id}/mark-paid`
- **Body:**
```json
{ "amount": 1500.00, "payment_date": "2025-09-13", "method": "bank_transfer" }
```
- **Réponse 200:**
```json
{
  "id": "inv_002",
  "status": "paid",
  "amount_paid": 1500.00,
  "balance": 0.00,
  "payments": [ { "id": "pay_1", "amount": 1500.00, "date": "2025-09-13", "method": "bank_transfer" } ]
}
```

### Void Invoice
- **Méthode:** `POST`
- **Chemin:** `/api/v1/invoices/{invoice_id}/void`
- **Body (optionnel):** `{ "reason": "Erreur de saisie" }`
- **Réponse 200:**
```json
{ "id": "inv_002", "status": "void", "void_reason": "Erreur de saisie", "voided_at": "2025-09-13T13:00:00Z" }
```

### Duplicate Invoice
- **Méthode:** `POST`
- **Chemin:** `/api/v1/invoices/{invoice_id}/duplicate`
- **Body (optionnel):**
```json
{ "issue_date": "2025-10-01", "due_date": "2025-10-31" }
```
- **Réponse 201:** *(nouvelle facture en draft, même structure)*

### Download Invoice PDF
- **Méthode:** `GET`
- **Chemin:** `/api/v1/invoices/{invoice_id}/pdf`
- **Paramètres:** `template` (string, optionnel)
- **Réponse 200:**
```json
{
  "invoice_id": "inv_002",
  "pdf_url": "https://api.example.com/files/inv_002.pdf",
  "expires_at": "2025-09-13T14:00:00Z"
}
```

---

## Invoice Items

### Invoice Item List
- **Méthode:** `GET`
- **Chemin:** `/api/v1/invoices/{invoice_id}/items`
- **Réponse 200:**
```json
{
  "data": [
    {
      "id": "invli_1",
      "invoice_id": "inv_002",
      "description": "Développement",
      "quantity": 1,
      "unit_price": 1000.00,
      "tax_rate": 20,
      "tax_amount": 200.00,
      "total": 1200.00,
      "account_id": "acc_200",
      "created_at": "2025-09-13T12:00:00Z"
    }
  ],
  "meta": { "total": 2 }
}
```

### Create Invoice Item
- **Méthode:** `POST`
- **Chemin:** `/api/v1/invoices/{invoice_id}/items`
- **Body:**
```json
{
  "description": "Maintenance",
  "quantity": 2,
  "unit_price": 75.00,
  "tax_rate": 20,
  "account_id": "acc_200"
}
```
- **Réponse 201:** *(même format que ligne de liste)*

### Invoice Item Detail
- **Méthode:** `GET`
- **Chemin:** `/api/v1/invoice-items/{item_id}`
- **Réponse 200:** *(même format)*

### Update Invoice Item
- **Méthode:** `PATCH`
- **Chemin:** `/api/v1/invoice-items/{item_id}`
- **Body:**
```json
{ "unit_price": 120.00, "quantity": 3 }
```
- **Réponse 200:** *(même format)*

### Delete Invoice Item
- **Méthode:** `DELETE`
- **Chemin:** `/api/v1/invoice-items/{item_id}`
- **Réponse 204:** *No content*

---

## Codes d'Erreur Communs

| Code | Description |
|------|-------------|
| 400 | Requête invalide / body manquant |
| 401 | Non authentifié |
| 403 | Accès refusé |
| 404 | Ressource introuvable |
| 409 | Conflit (ex: doublon) |
| 422 | Validation échouée |
| 429 | Trop de requêtes |
| 500 | Erreur serveur |

**Exemple erreur 422:**
```json
{
  "error": {
    "code": "validation_failed",
    "message": "Les données fournies sont invalides.",
    "details": [
      { "field": "amount", "message": "doit être un nombre positif" }
    ]
  }
}
```
