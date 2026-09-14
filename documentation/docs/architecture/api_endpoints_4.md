# API endpoints (4)

## Taxes — GET `/taxes`
- Description : Liste les taxes avec pagination et filtres.
- Paramètres : `page` (query, entier), `limit` (query, entier), `active` (query, booléen).
- Réponse 200 : `{"data":[{"id":"tax_1","name":"TVA 20 %","rate":20,"active":true}],"meta":{"page":1,"limit":20,"total":1}}`
- Réponse 400 : `{"error":{"code":"INVALID_QUERY","message":"Paramètres de pagination invalides."}}`

## Taxes — POST `/taxes`
- Description : Crée une taxe.
- Paramètres : `name` (body, chaîne), `rate` (body, nombre), `active` (body, booléen, optionnel).
- Réponse 201 : `{"data":{"id":"tax_1","name":"TVA 20 %","rate":20,"active":true}}`
- Réponse 422 : `{"error":{"code":"VALIDATION_ERROR","message":"Le nom et le taux sont requis.","details":{}}}`

## Taxes — GET `/taxes/:id`
- Description : Récupère une taxe par son identifiant.
- Paramètres : `id` (path, UUID).
- Réponse 200 : `{"data":{"id":"tax_1","name":"TVA 20 %","rate":20,"active":true}}`
- Réponse 404 : `{"error":{"code":"TAX_NOT_FOUND","message":"Taxe introuvable."}}`

## Taxes — PUT `/taxes/:id`
- Description : Met à jour entièrement une taxe.
- Paramètres : `id` (path, UUID), `name` (body, chaîne), `rate` (body, nombre), `active` (body, booléen).
- Réponse 200 : `{"data":{"id":"tax_1","name":"TVA 20 %","rate":20,"active":true}}`
- Réponse 404 : `{"error":{"code":"TAX_NOT_FOUND","message":"Taxe introuvable."}}`

## Taxes — DELETE `/taxes/:id`
- Description : Supprime une taxe.
- Paramètres : `id` (path, UUID).
- Réponse 200 : `{"data":{"id":"tax_1","deleted":true}}`
- Réponse 404 : `{"error":{"code":"TAX_NOT_FOUND","message":"Taxe introuvable."}}`

## TaxDeclarations — POST `/tax-declarations`
- Description : Crée une déclaration fiscale.
- Paramètres : `taxId` (body, UUID), `period` (body, `YYYY-MM`), `amount` (body, nombre).
- Réponse 201 : `{"data":{"id":"decl_1","taxId":"tax_1","period":"2026-09","amount":1250.00,"status":"draft"}}`
- Réponse 422 : `{"error":{"code":"VALIDATION_ERROR","message":"Déclaration invalide.","details":{}}}`

## TaxDeclarations — GET `/tax-declarations/:id`
- Description : Récupère une déclaration fiscale.
- Paramètres : `id` (path, UUID).
- Réponse 200 : `{"data":{"id":"decl_1","taxId":"tax_1","period":"2026-09","amount":1250.00,"status":"draft"}}`
- Réponse 404 : `{"error":{"code":"DECLARATION_NOT_FOUND","message":"Déclaration introuvable."}}`

## TaxDeclarations — GET `/tax-declarations/:id/export`
- Description : Exporte une déclaration fiscale.
- Paramètres : `id` (path, UUID), `format` (query, `pdf` ou `csv`, optionnel).
- Réponse 200 : `{"data":{"id":"decl_1","format":"pdf","url":"https://storage.example.com/exports/decl_1.pdf","expiresAt":"2026-09-14T00:00:00Z"}}`
- Réponse 404 : `{"error":{"code":"DECLARATION_NOT_FOUND","message":"Déclaration introuvable."}}`

## AuditLogs — GET `/audit-logs`
- Description : Consulte les journaux d’audit filtrables.
- Paramètres : `userId` (query, UUID, optionnel), `action` (query, chaîne, optionnel), `from`/`to` (query, dates, optionnels), `page`/`limit` (query, optionnels).
- Réponse 200 : `{"data":[{"id":"log_1","userId":"user_1","action":"tax.update","timestamp":"2026-09-13T10:00:00Z","metadata":{}}],"meta":{"total":1}}`
- Réponse 400 : `{"error":{"code":"INVALID_FILTER","message":"Filtres de période invalides."}}`

## BankConnections — GET `/bank-connections`
- Description : Liste les connexions bancaires.
- Paramètres : `status` (query, chaîne, optionnel).
- Réponse 200 : `{"data":[{"id":"bank_1","provider":"plaid","accountName":"Compte courant","status":"active","lastSyncAt":"2026-09-13T09:00:00Z"}]}`
- Réponse 401 : `{"error":{"code":"UNAUTHORIZED","message":"Authentification requise."}}`

## BankConnections — POST `/bank-connections`
- Description : Crée une connexion bancaire.
- Paramètres : `provider` (body, chaîne), `accessToken` (body, chaîne), `accountId` (body, chaîne).
- Réponse 201 : `{"data":{"id":"bank_1","provider":"plaid","accountName":"Compte courant","status":"active"}}`
- Réponse 400 : `{"error":{"code":"PROVIDER_ERROR","message":"Impossible de connecter la banque."}}`

## BankConnections — DELETE `/bank-connections/:id`
- Description : Supprime une connexion bancaire.
- Paramètres : `id` (path, UUID).
- Réponse 200 : `{"data":{"id":"bank_1","deleted":true}}`
- Réponse 404 : `{"error":{"code":"BANK_CONNECTION_NOT_FOUND","message":"Connexion introuvable."}}`

## BankConnections — POST `/bank-connections/:id/sync`
- Description : Synchronise les opérations d’une connexion bancaire.
- Paramètres : `id` (path, UUID).
- Réponse 200 : `{"data":{"id":"bank_1","status":"completed","importedTransactions":12,"lastSyncAt":"2026-09-13T10:00:00Z"}}`
- Réponse 409 : `{"error":{"code":"SYNC_IN_PROGRESS","message":"Synchronisation déjà en cours."}}`

## OCRJobs — POST `/ocr/upload`
- Description : Soumet un document à l’OCR.
- Paramètres : `file` (multipart, fichier), `documentType` (formulaire, chaîne, optionnel).
- Réponse 202 : `{"data":{"id":"ocr_1","status":"queued","createdAt":"2026-09-13T10:00:00Z"}}`
- Réponse 415 : `{"error":{"code":"UNSUPPORTED_FILE","message":"Format de fichier non pris en charge."}}`

## OCRJobs — GET `/ocr/jobs/:id`
- Description : Récupère l’état et le résultat d’un traitement OCR.
- Paramètres : `id` (path, UUID).
- Réponse 200 : `{"data":{"id":"ocr_1","status":"completed","documentType":"invoice","text":"Facture F-001","confidence":0.97}}`
- Réponse 404 : `{"error":{"code":"OCR_JOB_NOT_FOUND","message":"Traitement OCR introuvable."}}`

## Dashboard — GET `/dashboard/metrics`
- Description : Retourne les indicateurs financiers principaux.
- Paramètres : `from`/`to` (query, dates, optionnels).
- Réponse 200 : `{"data":{"revenue":25000.00,"expenses":14000.00,"profit":11000.00,"cashBalance":32000.00,"currency":"EUR"}}`
- Réponse 400 : `{"error":{"code":"INVALID_DATE_RANGE","message":"Période invalide."}}`

## Dashboard — GET `/dashboard/cash-flow`
- Description : Retourne les encaissements et décaissements par période.
- Paramètres : `from`/`to` (query, dates), `interval` (query, `day`, `month` ou `year`).
- Réponse 200 : `{"data":[{"period":"2026-09","inflow":8000.00,"outflow":5000.00,"balance":3000.00}]}`
- Réponse 400 : `{"error":{"code":"INVALID_INTERVAL","message":"Intervalle non pris en charge."}}`

## Dashboard — GET `/dashboard/projections`
- Description : Calcule les projections de trésorerie.
- Paramètres : `months` (query, entier, optionnel), `scenario` (query, `base`, `optimistic` ou `pessimistic`).
- Réponse 200 : `{"data":[{"month":"2026-10","projectedBalance":35000.00,"confidence":0.82}]}`
- Réponse 422 : `{"error":{"code":"INSUFFICIENT_DATA","message":"Données historiques insuffisantes."}}`

## Alerts — GET `/alerts`
- Description : Liste les alertes de l’utilisateur.
- Paramètres : `status` (query, `active` ou `read`, optionnel), `type` (query, optionnel).
- Réponse 200 : `{"data":[{"id":"alert_1","type":"low_balance","message":"Solde faible","read":false,"createdAt":"2026-09-13T08:00:00Z"}]}`
- Réponse 401 : `{"error":{"code":"UNAUTHORIZED","message":"Authentification requise."}}`

## Alerts — PUT `/alerts/:id/read`
- Description : Marque une alerte comme lue.
- Paramètres : `id` (path, UUID).
- Réponse 200 : `{"data":{"id":"alert_1","read":true,"readAt":"2026-09-13T10:00:00Z"}}`
- Réponse 404 : `{"error":{"code":"ALERT_NOT_FOUND","message":"Alerte introuvable."}}`

## Alerts — DELETE `/alerts/:id`
- Description : Supprime une alerte.
- Paramètres : `id` (path, UUID).
- Réponse 200 : `{"data":{"id":"alert_1","deleted":true}}`
- Réponse 404 : `{"error":{"code":"ALERT_NOT_FOUND","message":"Alerte introuvable."}}`

## Budgets — GET `/budgets`
- Description : Liste les budgets.
- Paramètres : `year` (query, entier, optionnel), `status` (query, optionnel).
- Réponse 200 : `{"data":[{"id":"budget_1","name":"Budget 2026","year":2026,"status":"active","amount":50000.00}]}`
- Réponse 400 : `{"error":{"code":"INVALID_YEAR","message":"Année invalide."}}`

## Budgets — POST `/budgets`
- Description : Crée un budget.
- Paramètres : `name` (body, chaîne), `year` (body, entier), `amount` (body, nombre), `currency` (body, code ISO 4217).
- Réponse 201 : `{"data":{"id":"budget_1","name":"Budget 2026","year":2026,"status":"active","amount":50000.00,"currency":"EUR"}}`
- Réponse 422 : `{"error":{"code":"VALIDATION_ERROR","message":"Budget invalide.","details":{}}}`

## Budgets — GET `/budgets/:id`
- Description : Récupère un budget et ses totaux.
- Paramètres : `id` (path, UUID).
- Réponse 200 : `{"data":{"id":"budget_1","name":"Budget 2026","year":2026,"amount":50000.00,"spent":32000.00,"remaining":18000.00}}`
- Réponse 404 : `{"error":{"code":"BUDGET_NOT_FOUND","message":"Budget introuvable."}}`

## Budgets — PUT `/budgets/:id`
- Description : Met à jour un budget.
- Paramètres : `id` (path, UUID), `name` (body, optionnel), `year` (body, optionnel), `amount` (body, optionnel), `status` (body, optionnel).
- Réponse 200 : `{"data":{"id":"budget_1","name":"Budget 2026","year":2026,"amount":55000.00,"status":"active"}}`
- Réponse 404 : `{"error":{"code":"BUDGET_NOT_FOUND","message":"Budget introuvable."}}`

## Budgets — DELETE `/budgets/:id`
- Description : Supprime un budget.
- Paramètres : `id` (path, UUID).
- Réponse 200 : `{"data":{"id":"budget_1","deleted":true}}`
- Réponse 409 : `{"error":{"code":"BUDGET_IN_USE","message":"Le budget contient encore des éléments."}}`

## BudgetItems — GET `/budgets/:id/items`
- Description : Liste les postes d’un budget.
- Paramètres : `id` (path, UUID), `category` (query, chaîne, optionnel).
- Réponse 200 : `{"data":[{"id":"item_1","budgetId":"budget_1","category":"marketing","label":"Publicité","amount":5000.00}]}`
- Réponse 404 : `{"error":{"code":"BUDGET_NOT_FOUND","message":"Budget introuvable."}}`

## BudgetItems — POST `/budgets/:id/items`
- Description : Ajoute un poste à un budget.
- Paramètres : `id` (path, UUID), `category` (body, chaîne), `label` (body, chaîne), `amount` (body, nombre).
- Réponse 201 : `{"data":{"id":"item_1","budgetId":"budget_1","category":"marketing","label":"Publicité","amount":5000.00}}`
- Réponse 422 : `{"error":{"code":"VALIDATION_ERROR","message":"Poste de budget invalide.","details":{}}}`

## BudgetItems — PUT `/budget-items/:id`
- Description : Met à jour un poste de budget.
- Paramètres : `id` (path, UUID), `category` (body, optionnel), `label` (body, optionnel), `amount` (body, optionnel).
- Réponse 200 : `{"data":{"id":"item_1","budgetId":"budget_1","category":"marketing","label":"Publicité","amount":6000.00}}`
- Réponse 404 : `{"error":{"code":"BUDGET_ITEM_NOT_FOUND","message":"Poste introuvable."}}`

## BudgetItems — DELETE `/budget-items/:id`
- Description : Supprime un poste de budget.
- Paramètres : `id` (path, UUID).
- Réponse 200 : `{"data":{"id":"item_1","deleted":true}}`
- Réponse 404 : `{"error":{"code":"BUDGET_ITEM_NOT_FOUND","message":"Poste introuvable."}}`

## RecurringExpenses — GET `/recurring-expenses`
- Description : Liste les dépenses récurrentes.
- Paramètres : `active` (query, booléen, optionnel), `category` (query, optionnel).
- Réponse 200 : `{"data":[{"id":"rec_1","label":"Abonnement logiciel","amount":99.00,"frequency":"monthly","active":true,"nextDate":"2026-10-01"}]}`
- Réponse 401 : `{"error":{"code":"UNAUTHORIZED","message":"Authentification requise."}}`

## RecurringExpenses — POST `/recurring-expenses`
- Description : Crée une dépense récurrente.
- Paramètres : `label` (body, chaîne), `amount` (body, nombre), `frequency` (body, `weekly`, `monthly` ou `yearly`), `nextDate` (body, date), `active` (body, optionnel).
- Réponse 201 : `{"data":{"id":"rec_1","label":"Abonnement logiciel","amount":99.00,"frequency":"monthly","active":true,"nextDate":"2026-10-01"}}`
- Réponse 422 : `{"error":{"code":"VALIDATION_ERROR","message":"Dépense récurrente invalide.","details":{}}}`

## RecurringExpenses — PUT `/recurring-expenses/:id`
- Description : Met à jour une dépense récurrente.
- Paramètres : `id` (path, UUID), `label`/`amount`/`frequency`/`nextDate`/`active` (body, optionnels).
- Réponse 200 : `{"data":{"id":"rec_1","label":"Abonnement logiciel","amount":99.00,"frequency":"monthly","active":true,"nextDate":"2026-10-01"}}`
- Réponse 404 : `{"error":{"code":"RECURRING_EXPENSE_NOT_FOUND","message":"Dépense récurrente introuvable."}}`

## RecurringExpenses — DELETE `/recurring-expenses/:id`
- Description : Supprime une dépense récurrente.
- Paramètres : `id` (path, UUID).
- Réponse 200 : `{"data":{"id":"rec_1","deleted":true}}`
- Réponse 404 : `{"error":{"code":"RECURRING_EXPENSE_NOT_FOUND","message":"Dépense récurrente introuvable."}}`

## Reports — GET `/reports/bilan`
- Description : Génère le bilan comptable.
- Paramètres : `year` (query, entier), `format` (query, `json` ou `pdf`, optionnel).
- Réponse 200 : `{"data":{"year":2026,"assets":80000.00,"liabilities":30000.00,"equity":50000.00,"currency":"EUR"}}`
- Réponse 400 : `{"error":{"code":"INVALID_YEAR","message":"Année invalide."}}`

## Reports — GET `/reports/compte-resultat`
- Description : Génère le compte de résultat.
- Paramètres : `from`/`to` (query, dates), `format` (query, optionnel).
- Réponse 200 : `{"data":{"from":"2026-01-01","to":"2026-12-31","income":120000.00,"expenses":85000.00,"profit":35000.00}}`
- Réponse 400 : `{"error":{"code":"INVALID_DATE_RANGE","message":"Période invalide."}}`

## Reports — GET `/reports/tva`
- Description : Génère le rapport de TVA.
- Paramètres : `period` (query, `YYYY-MM`).
- Réponse 200 : `{"data":{"period":"2026-09","collectedVat":2500.00,"deductibleVat":1200.00,"payableVat":1300.00,"currency":"EUR"}}`
- Réponse 400 : `{"error":{"code":"INVALID_PERIOD","message":"Période invalide."}}`

## Reports — GET `/reports/fec`
- Description : Exporte le fichier des écritures comptables (FEC).
- Paramètres : `year` (query, entier), `format` (query, `txt` ou `csv`, optionnel).
- Réponse 200 : `{"data":{"year":2026,"format":"txt","url":"https://storage.example.com/reports/fec-2026.txt","recordCount":1250}}`
- Réponse 422 : `{"error":{"code":"ACCOUNTING_UNBALANCED","message":"Le grand livre n’est pas équilibré."}}`

## Notifications — GET `/notifications`
- Description : Liste les notifications de l’utilisateur.
- Paramètres : `unread` (query, booléen, optionnel), `page`/`limit` (query, optionnels).
- Réponse 200 : `{"data":[{"id":"notif_1","type":"payment_received","message":"Paiement reçu","read":false,"createdAt":"2026-09-13T09:00:00Z"}],"meta":{"total":1}}`
- Réponse 401 : `{"error":{"code":"UNAUTHORIZED","message":"Authentification requise."}}`

## Notifications — PUT `/notifications/:id/read`
- Description : Marque une notification comme lue.
- Paramètres : `id` (path, UUID).
- Réponse 200 : `{"data":{"id":"notif_1","read":true,"readAt":"2026-09-13T10:00:00Z"}}`
- Réponse 404 : `{"error":{"code":"NOTIFICATION_NOT_FOUND","message":"Notification introuvable."}}`

## Notifications — DELETE `/notifications/:id`
- Description : Supprime une notification.
- Paramètres : `id` (path, UUID).
- Réponse 200 : `{"data":{"id":"notif_1","deleted":true}}`
- Réponse 404 : `{"error":{"code":"NOTIFICATION_NOT_FOUND","message":"Notification introuvable."}}`

## Webhooks — POST `/webhooks/stripe`
- Description : Reçoit les événements Stripe et vérifie leur signature.
- Paramètres : `Stripe-Signature` (header, chaîne), `id`/`type`/`livemode`/`data` (body JSON).
- Réponse 200 : `{"received":true,"eventId":"evt_1","processed":true}`
- Réponse 400 : `{"error":{"code":"INVALID_SIGNATURE","message":"Signature Stripe invalide."}}`

## Webhooks — POST `/webhooks/plaid`
- Description : Reçoit les événements de connexion et de transactions Plaid.
- Paramètres : `Plaid-Version` (header, chaîne, optionnel), `webhook_code`/`webhook_type`/`item_id` (body JSON).
- Réponse 200 : `{"received":true,"webhookCode":"DEFAULT_UPDATE","processed":true}`
- Réponse 400 : `{"error":{"code":"INVALID_WEBHOOK","message":"Webhook Plaid invalide."}}`
