# API Endpoints

## Quotes

### List Quotes (GET)
- **Path:** `/api/v1/quotes`
- **Parameters:** `page` (int), `per_page` (int), `status` (string)
- **Response 200:**
```json
{ "data": [{ "id": "q_001", "client": "Dupont", "total": 1200.00, "status": "pending" }], "page": 1, "per_page": 20 }
```

### Create Quote (POST)
- **Path:** `/api/v1/quotes`
- **Parameters:** `client_id`, `items[]`, `note`
- **Response 201:**
```json
{ "id": "q_002", "client_id": "cli_10", "total": 1200.00, "status": "draft", "created_at": "2026-09-13T04:00:00Z" }
```

### Get Quote (GET)
- **Path:** `/api/v1/quotes/{id}`
- **Parameters:** `id` (path)
- **Response 200:**
```json
{ "id": "q_001", "client": { "id": "cli_10", "name": "Dupont" }, "items": [], "total": 1200.00, "status": "pending" }
```

### Update Quote (PUT)
- **Path:** `/api/v1/quotes/{id}`
- **Parameters:** `id` (path), `note`, `items[]`
- **Response 200:**
```json
{ "id": "q_001", "total": 1350.00, "status": "pending", "updated_at": "2026-09-13T05:00:00Z" }
```

### Delete Quote (DELETE)
- **Path:** `/api/v1/quotes/{id}`
- **Parameters:** `id` (path)
- **Response 204:** No content

### Accept Quote (POST)
- **Path:** `/api/v1/quotes/{id}/accept`
- **Parameters:** `id` (path)
- **Response 200:**
```json
{ "id": "q_001", "status": "accepted", "accepted_at": "2026-09-13T06:00:00Z" }
```

### Reject Quote (POST)
- **Path:** `/api/v1/quotes/{id}/reject`
- **Parameters:** `id` (path), `reason`
- **Response 200:**
```json
{ "id": "q_001", "status": "rejected", "reason": "Budget insuffisant" }
```

### Convert Quote to Invoice (POST)
- **Path:** `/api/v1/quotes/{id}/convert`
- **Parameters:** `id` (path)
- **Response 201:**
```json
{ "invoice_id": "inv_001", "quote_id": "q_001", "total": 1200.00, "status": "open" }
```

---

## QuoteItems

### List Quote Items (GET)
- **Path:** `/api/v1/quote-items`
- **Parameters:** `quote_id`, `page`, `per_page`
- **Response 200:**
```json
{ "data": [{ "id": "qi_01", "quote_id": "q_001", "description": "Conseil", "qty": 2, "unit_price": 500.00 }] }
```

### Create Quote Item (POST)
- **Path:** `/api/v1/quote-items`
- **Parameters:** `quote_id`, `description`, `qty`, `unit_price`
- **Response 201:**
```json
{ "id": "qi_02", "quote_id": "q_001", "description": "Formation", "qty": 1, "unit_price": 300.00 }
```

### Get Quote Item (GET)
- **Path:** `/api/v1/quote-items/{id}`
- **Parameters:** `id` (path)
- **Response 200:**
```json
{ "id": "qi_01", "quote_id": "q_001", "description": "Conseil", "qty": 2, "unit_price": 500.00 }
```

### Update Quote Item (PUT)
- **Path:** `/api/v1/quote-items/{id}`
- **Parameters:** `id` (path), `description`, `qty`, `unit_price`
- **Response 200:**
```json
{ "id": "qi_01", "description": "Conseil", "qty": 3, "unit_price": 500.00 }
```

### Delete Quote Item (DELETE)
- **Path:** `/api/v1/quote-items/{id}`
- **Parameters:** `id` (path)
- **Response 204:** No content

---

## Payments

### List Payments (GET)
- **Path:** `/api/v1/payments`
- **Parameters:** `invoice_id`, `method`, `page`, `per_page`
- **Response 200:**
```json
{ "data": [{ "id": "pay_01", "invoice_id": "inv_001", "amount": 1200.00, "method": "bank_transfer", "status": "completed" }] }
```

### Create Payment (POST)
- **Path:** `/api/v1/payments`
- **Parameters:** `invoice_id`, `amount`, `method`, `reference`
- **Response 201:**
```json
{ "id": "pay_02", "invoice_id": "inv_001", "amount": 600.00, "method": "card", "status": "pending" }
```

### Get Payment (GET)
- **Path:** `/api/v1/payments/{id}`
- **Parameters:** `id` (path)
- **Response 200:**
```json
{ "id": "pay_01", "invoice_id": "inv_001", "amount": 1200.00, "method": "bank_transfer", "status": "completed" }
```

### Update Payment (PUT)
- **Path:** `/api/v1/payments/{id}`
- **Parameters:** `id` (path), `reference`, `note`
- **Response 200:**
```json
{ "id": "pay_01", "reference": "REF-2026-001", "status": "completed" }
```

### Delete Payment (DELETE)
- **Path:** `/api/v1/payments/{id}`
- **Parameters:** `id` (path)
- **Response 204:** No content

### Refund Payment (POST)
- **Path:** `/api/v1/payments/{id}/refund`
- **Parameters:** `id` (path), `amount`, `reason`
- **Response 201:**
```json
{ "refund_id": "ref_01", "payment_id": "pay_01", "amount": 600.00, "reason": "Annulation service", "status": "refunded" }
```

---

## PaymentMethods

### List Payment Methods (GET)
- **Path:** `/api/v1/payment-methods`
- **Parameters:** `page`, `per_page`
- **Response 200:**
```json
{ "data": [{ "id": "pm_01", "type": "bank_transfer", "label": "Virement bancaire", "is_default": true }] }
```

### Create Payment Method (POST)
- **Path:** `/api/v1/payment-methods`
- **Parameters:** `type`, `label`, `details`, `is_default`
- **Response 201:**
```json
{ "id": "pm_02", "type": "card", "label": "Carte bancaire", "details": { "provider": "stripe" }, "is_default": false }
```

### Get Payment Method (GET)
- **Path:** `/api/v1/payment-methods/{id}`
- **Parameters:** `id` (path)
- **Response 200:**
```json
{ "id": "pm_01", "type": "bank_transfer", "label": "Virement bancaire", "details": { "iban": "FR76..." } }
```

### Update Payment Method (PUT)
- **Path:** `/api/v1/payment-methods/{id}`
- **Parameters:** `id` (path), `label`, `details`, `is_default`
- **Response 200:**
```json
{ "id": "pm_01", "label": "Virement SEPA", "is_default": true }
```

### Delete Payment Method (DELETE)
- **Path:** `/api/v1/payment-methods/{id}`
- **Parameters:** `id` (path)
- **Response 204:** No content

---

## Subscriptions

### List Subscriptions (GET)
- **Path:** `/api/v1/subscriptions`
- **Parameters:** `client_id`, `status`, `page`, `per_page`
- **Response 200:**
```json
{ "data": [{ "id": "sub_01", "client_id": "cli_10", "plan": "premium", "status": "active", "starts_at": "2026-01-01" }] }
```

### Create Subscription (POST)
- **Path:** `/api/v1/subscriptions`
- **Parameters:** `client_id`, `plan_id`, `starts_at`
- **Response 201:**
```json
{ "id": "sub_02", "client_id": "cli_10", "plan_id": "plan_premium", "status": "active", "starts_at": "2026-09-13" }
```

### Get Subscription (GET)
- **Path:** `/api/v1/subscriptions/{id}`
- **Parameters:** `id` (path)
- **Response 200:**
```json
{ "id": "sub_01", "client_id": "cli_10", "plan": { "id": "plan_premium", "name": "Premium" }, "status": "active" }
```

### Update Subscription (PUT)
- **Path:** `/api/v1/subscriptions/{id}`
- **Parameters:** `id` (path), `plan_id`, `starts_at`
- **Response 200:**
```json
{ "id": "sub_01", "plan_id": "plan_enterprise", "status": "active" }
```

### Delete Subscription (DELETE)
- **Path:** `/api/v1/subscriptions/{id}`
- **Parameters:** `id` (path)
- **Response 204:** No content

### Cancel Subscription (POST)
- **Path:** `/api/v1/subscriptions/{id}/cancel`
- **Parameters:** `id` (path), `reason`
- **Response 200:**
```json
{ "id": "sub_01", "status": "cancelled", "cancelled_at": "2026-09-13T04:00:00Z", "reason": "Changement de forfait" }
```

### Resume Subscription (POST)
- **Path:** `/api/v1/subscriptions/{id}/resume`
- **Parameters:** `id` (path)
- **Response 200:**
```json
{ "id": "sub_01", "status": "active", "resumed_at": "2026-10-01T00:00:00Z" }
```

---

## SubscriptionPlans

### List Subscription Plans (GET)
- **Path:** `/api/v1/subscription-plans`
- **Parameters:** `page`, `per_page`
- **Response 200:**
```json
{ "data": [{ "id": "plan_basic", "name": "Basic", "price": 29.99, "interval": "monthly" }] }
```

### Create Subscription Plan (POST)
- **Path:** `/api/v1/subscription-plans`
- **Parameters:** `name`, `price`, `interval`, `features[]`
- **Response 201:**
```json
{ "id": "plan_pro", "name": "Pro", "price": 79.99, "interval": "monthly", "features": ["reporting", "api"] }
```

### Get Subscription Plan (GET)
- **Path:** `/api/v1/subscription-plans/{id}`
- **Parameters:** `id` (path)
- **Response 200:**
```json
{ "id": "plan_basic", "name": "Basic", "price": 29.99, "interval": "monthly", "features": ["support_email"] }
```

### Update Subscription Plan (PUT)
- **Path:** `/api/v1/subscription-plans/{id}`
- **Parameters:** `id` (path), `name`, `price`, `interval`, `features[]`
- **Response 200:**
```json
{ "id": "plan_basic", "name": "Basic", "price": 34.99, "interval": "monthly" }
```

### Delete Subscription Plan (DELETE)
- **Path:** `/api/v1/subscription-plans/{id}`
- **Parameters:** `id` (path)
- **Response 204:** No content
