# Module Facturation & Ventes — Analyse Technique

## 1. Vue d'Overview

**Objectifs** : Automatiser le cycle de vie client (Devis → Facture → Paiement → Relance → Abonnement), réduire le DSO, assurer conformité légale (mentions obligatoires, QR EPC).

**Cycle de vie client** :
```
Prospect → Devis (brouillon/envoyé/accepté/refusé)
    → Facture (brouillon/émise/partiellement payée/payée/annulée)
    → Paiement (en attente/complet/partiel/échoué/remboursé)
    → Relance (automatique/manuelle → paiement ou contentieux)
    → Abonnement (actif/pause/annulé/renouvelé)
```

**Bénéfices** : Réduction 40% temps facturation, traçabilité audit, paiement 1-clic, relances sans intervention humaine.

---

## 2. Éditeur Devis/Factures Interactif

### Architecture
- **Frontend** : React + TipTap/Slate pour édition WYSIWYG, state management (Zustand/Redux)
- **Backend** : Service `DocumentEngine` (Node.js/Go) — génération, versioning, numérotation séquentielle thread-safe (Redis `INCR` + préfixe annuel)

### Template Engine
- **Moteur** : Handlebars / Nunjucks (côté serveur) + prévisualisation temps réel via iframe sandboxée
- **Variables** : `{{client.name}}`, `{{document.number}}`, `{{items[]}}`, `{{totals.ht}}`, `{{totals.tva[]}}`, `{{totals.ttc}}`, `{{legal_mentions}}`
- **Héritage** : Layouts base (en-tête, pied de page, CGV) + blocs surchargeables par type (devis/facture/avoir)

### Mentions Légales Dynamiques
- Règles métier stockées en DB (`LegalMentionRule`: condition, template, priorité)
- Évaluation à la génération : TVA intracommunautaire, exonération, mention "TVA non applicable art. 293B CGI", délai paiement, pénalités retard, médiation

### QR Code Paiement (Spec EPC QR)
```text
BCD\n002\n1\nSCT\n{IBAN}\n{BENEFICIAIRE}\n\n{EUR}{MONTANT}\n\n\n{REFERENCE_FACTURE}\n\n\n
```
- Génération : `qrcode` npm (SVG) → embed dans PDF
- Validation IBAN (mod97), montant 2 décimales, référence ≤ 35 chars

### Formats PDF
| Outil | Usage | Avantages |
|-------|-------|-----------|
| **html2pdf.js** | Client-side preview | Rapide, zero-config, offline |
| **wkhtmltopdf** (via `node-wkhtmltopdf`) | Production batch | Fidélité CSS print, headers/footers natifs |
| **Puppeteer** | Documents complexes (graphiques, tableaux paginés) | Chrome headless, PDF/A-1b, emoji fonts |

**Stratégie** : Preview → html2pdf ; Génération définitive → Puppeteer (template `print.css` @page, marges, numérotation pages)

---

## 3. Portail Client

### Sécurité
- **Auth** : JWT RS256 (clé publique JWKS rotative), `access_token` 15min, `refresh_token` 30j (stocké hashé argon2id)
- **RBAC** : Rôles `client_admin`, `client_viewer`, `client_comptable` — permissions par ressource (devis, factures, abonnements)
- **Rate limit** : 100 req/min/IP, 10 req/min/user sur `/auth/*`
- **Audit log** : Chaque action (consultation, acceptation, paiement) tracée (user_id, ip, ua, timestamp)

### Fonctionnalités
| Fonction | Endpoint | Description |
|----------|----------|-------------|
| Lister devis | `GET /portal/quotations` | Filtres statut, date, pagination cursor |
| Détail devis | `GET /portal/quotations/:id` | HTML + PDF download |
| Accepter devis | `POST /portal/quotations/:id/accept` | Signature électronique (dessin/typed), horodatage RFC3161 |
| Payer facture | `POST /portal/invoices/:id/pay` | Redirection Stripe/PayPal, webhook confirmation |

### Intégration Stripe
- **Checkout Session** (paiement unique) : `mode: payment`, `success_url`, `cancel_url`, `metadata: {invoice_id, client_id}`
- **Payment Intents** (paiement partiel/récurrent) : `confirm=true`, `payment_method_types: ['card','sepa_debit']`
- **Webhooks** : `invoice.payment_succeeded`, `invoice.payment_failed`, `checkout.session.completed` — idempotency key `stripe_event_id`, vérification signature `stripe-signature`
- **Customer Portal** : Gestion moyens de paiement, factures historiques

### Intégration PayPal
- **Orders API v2** : `CREATE` → `APPROVE` (redirect) → `CAPTURE`
- Webhooks : `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.DENIED`
- Stockage `paypal_order_id`, `payer_id` sur table `Payments`

---

## 4. Workflows de Relance

### Scoring Risque Client
```python
score = (
    0.3 * (retards_moyens_jours / 30) +
    0.25 * (factures_impayees_90j / total_factures) +
    0.2 * (encours_ht / plafond_credit) +
    0.15 * (nb_relances_manuelles / nb_factures) +
    0.1 * (anciennete_mois / 12)
)
# Normalisé 0-100 → Tiers: Faible (<30), Moyen (30-60), Élevé (>60)
```
Recalcul nightly (cron) + temps réel sur nouvel événement (facture, paiement, relance).

### Scénarios Automatisés
| Scénario | Déclencheur | Canal | Template | Condition arrêt |
|----------|-------------|-------|----------|-----------------|
| Relance J+3 | `invoice.due_date + 3j` & impayée | Email | `reminder_soft` | Paiement reçu |
| Relance J+7 | `invoice.due_date + 7j` & impayée | Email + SMS | `reminder_firm` | Paiement reçu |
| Relance J+14 | `invoice.due_date + 14j` & impayée | Email (AR) + Courrier | `reminder_final` | Paiement ou contentieux |
| Pré-relance | `invoice.due_date - 3j` | Email | `pre_reminder` | — |

**Moteur** : Temporal.io / BullMQ (Redis) — jobs idempotents, retry exponentiel, dead-letter queue après 3 échecs.

### Personnalisation
- Templates par segment (PME, Grand compte, Particulier) + langue
- Variables : `{{client.name}}`, `{{invoice.number}}`, `{{amount_ttc}}`, `{{due_date}}`, `{{payment_link}}`, `{{contact_phone}}`
- A/B testing natif (pool templates, pondération)

---

## 5. Abonnements (Facturation Récurrente)

### Modèle de Données
- `SubscriptionPlan` : `billing_cycle` (monthly/quarterly/yearly), `price_ht`, `tva_rate`, `trial_days`, `setup_fee`
- `Subscription` : `plan_id`, `client_id`, `status`, `current_period_start`, `current_period_end`, `cancel_at_period_end`, `quantity`, `metadata`

### Prorata
- **Au démarrage** : `(jours_restants_période / jours_période) * prix_mensuel`
- **À l'upgrade/downgrade** : Crédit temps restant ancien plan → facture nouveau plan (Stripe `proration_behavior: create_prorations`)
- **À l'annulation** : Remboursement prorata si `cancel_immediately=true` sinon accès jusqu'à `current_period_end`

### Gestion Plans
- Versioning : `plan_v2` (nouveau prix) ne modifie pas abonnements existants → migration manuelle ou `subscription_schedule`
- Métadonnées : `features[]`, `limits{users, storage_gb, api_calls}`

### Renouvellements
- **Automatique** : Stripe `subscription_schedule` / webhook `invoice.upcoming` (J-7) → email rappel
- **Manuel** : Statut `pending_renewal` → action client portail
- **Échec paiement** : `past_due` → retry Stripe (smart retries) → `canceled` après 14j sans paiement

---

## 6. Schéma de Données (PostgreSQL)

```sql
-- Clients
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    siret VARCHAR(14), tva_intra VARCHAR(20),
    billing_address JSONB NOT NULL,
    shipping_address JSONB,
    payment_terms_days INT DEFAULT 30,
    credit_limit_ht DECIMAL(12,2) DEFAULT 0,
    risk_score INT DEFAULT 0,
    risk_tier VARCHAR(20) DEFAULT 'faible',
    portal_access BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Devis
CREATE TABLE quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number VARCHAR(50) UNIQUE NOT NULL, -- DEV-2026-00001
    client_id UUID REFERENCES clients(id),
    status VARCHAR(20) DEFAULT 'draft', -- draft/sent/accepted/refused/expired
    valid_until DATE NOT NULL,
    items JSONB NOT NULL, -- [{description, qty, unit_price_ht, tva_rate, discount_pct}]
    totals JSONB NOT NULL, -- {ht, tva_details[{rate, base, amount}], ttc}
    legal_mentions TEXT[],
    pdf_url TEXT,
    signed_at TIMESTAMPTZ,
    signature_data JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Factures
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number VARCHAR(50) UNIQUE NOT NULL, -- FAC-2026-00001
    quotation_id UUID REFERENCES quotations(id),
    client_id UUID REFERENCES clients(id),
    status VARCHAR(20) DEFAULT 'draft', -- draft/issued/partial/paid/cancelled/refunded
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    items JSONB NOT NULL,
    totals JSONB NOT NULL,
    legal_mentions TEXT[],
    pdf_url TEXT,
    epc_qr_code TEXT, -- payload EPC
    paid_amount_ht DECIMAL(12,2) DEFAULT 0,
    paid_amount_ttc DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Lignes facture (dénormalisé pour requêtes analytiques)
CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(10,3) NOT NULL,
    unit_price_ht DECIMAL(12,2) NOT NULL,
    tva_rate DECIMAL(4,2) NOT NULL,
    discount_pct DECIMAL(5,2) DEFAULT 0,
    line_total_ht DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_price_ht * (1 - discount_pct/100)) STORED,
    line_total_ttc DECIMAL(12,2) GENERATED ALWAYS AS (line_total_ht * (1 + tva_rate/100)) STORED,
    sort_order INT DEFAULT 0
);

-- Paiements
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id),
    client_id UUID REFERENCES clients(id),
    amount_ttc DECIMAL(12,2) NOT NULL,
    method VARCHAR(20) NOT NULL, -- stripe/paypal/virement/cheque/especes
    status VARCHAR(20) DEFAULT 'pending', -- pending/completed/failed/refunded/partially_refunded
    provider_payment_id VARCHAR(255), -- pi_xxx, paypal_capture_id
    provider_fee_ht DECIMAL(10,2) DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Plans abonnement
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    billing_cycle VARCHAR(20) NOT NULL, -- monthly/quarterly/yearly
    price_ht DECIMAL(12,2) NOT NULL,
    tva_rate DECIMAL(4,2) NOT NULL,
    trial_days INT DEFAULT 0,
    setup_fee_ht DECIMAL(12,2) DEFAULT 0,
    features JSONB DEFAULT '[]',
    limits JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Abonnements
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID REFERENCES subscription_plans(id),
    client_id UUID REFERENCES clients(id),
    status VARCHAR(20) DEFAULT 'active', -- active/trial/past_due/canceled/paused
    quantity INT DEFAULT 1,
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    trial_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT false,
    canceled_at TIMESTAMPTZ,
    stripe_subscription_id VARCHAR(255) UNIQUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Relances
CREATE TABLE reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id),
    client_id UUID REFERENCES clients(id),
    type VARCHAR(20) NOT NULL, -- pre_reminder/j3/j7/j14/final
    channel VARCHAR(10) NOT NULL, -- email/sms/letter
    template_code VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending/sent/delivered/failed/opened/clicked
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    error_message TEXT,
    idempotency_key VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index critiques
CREATE INDEX idx_invoices_client_status ON invoices(client_id, status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date) WHERE status IN ('issued','partial');
CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_reminders_invoice_type ON reminders(invoice_id, type);
CREATE INDEX idx_subscriptions_client_status ON subscriptions(client_id, status);
```

---

## 7. Endpoints API Nécessaires

### Devis
```
POST   /api/quotations                 # Créer
GET    /api/quotations                 # Lister (filtres, pagination cursor)
GET    /api/quotations/:id             # Détail
PATCH  /api/quotations/:id             # Modifier (brouillon only)
POST   /api/quotations/:id/send        # Envoyer email + PDF
POST   /api/quotations/:id/accept      # Accepter → créer facture
POST   /api/quotations/:id/refuse      # Refuser
POST   /api/quotations/:id/duplicate   # Dupliquer
GET    /api/quotations/:id/pdf         # Télécharger PDF
```

### Factures
```
POST   /api/invoices                   # Créer (depuis devis ou manuel)
GET    /api/invoices                   # Lister
GET    /api/invoices/:id               # Détail
PATCH  /api/invoices/:id               # Modifier (brouillon)
POST   /api/invoices/:id/issue         # Émettre (numérotation, PDF, email)
POST   /api/invoices/:id/cancel        # Annuler (créer avoir si payée)
POST   /api/invoices/:id/credit-note   # Créer avoir partiel/total
GET    /api/invoices/:id/pdf           # Télécharger PDF
GET    /api/invoices/:id/epc-qr        # Payload EPC QR (texte)
```

### Paiements
```
POST   /api/payments                   # Enregistrer paiement manuel
GET    /api/invoices/:id/payments      # Historique paiements
POST   /api/invoices/:id/pay/stripe    # Créer Checkout Session
POST   /api/invoices/:id/pay/paypal    # Créer Order PayPal
POST   /api/webhooks/stripe            # Webhook Stripe
POST   /api/webhooks/paypal            # Webhook PayPal
```

### Portail Client (auth JWT requis)
```
GET    /portal/quotations
GET    /portal/quotations/:id
POST   /portal/quotations/:id/accept
GET    /portal/invoices
GET    /portal/invoices/:id
POST   /portal/invoices/:id/pay
GET    /portal/subscriptions
GET    /portal/subscriptions/:id
POST   /portal/subscriptions/:id/cancel
POST   /portal/subscriptions/:id/pause
```

### Abonnements
```
POST   /api/subscriptions              # Créer (avec trial)
GET    /api/subscriptions
GET    /api/subscriptions/:id
PATCH  /api/subscriptions/:id          # Modifier plan/quantité
POST   /api/subscriptions/:id/cancel   # Annuler (immédiat ou fin période)
POST   /api/subscriptions/:id/pause    # Pause
POST   /api/subscriptions/:id/resume   # Reprendre
GET    /api/subscriptions/:id/invoices # Factures générées
```

### Relances
```
GET    /api/reminders                  # Lister (filtres)
POST   /api/reminders/:id/resend       # Renvoyer
POST   /api/reminders/trigger/:invoice_id  # Déclencher manuel
GET    /api/clients/:id/reminder-history
```

### Avoirs
```
POST   /api/credit-notes               # Créer (depuis facture ou libre)
GET    /api/credit-notes
GET    /api/credit-notes/:id
POST   /api/credit-notes/:id/refund    # Rembourser (Stripe/PayPal/virement)
GET    /api/credit-notes/:id/pdf
```

---

## 8. Gestion Avoirs (Credit Notes) & Remises

### Avoirs
- **Origine** : Annulation facture, retour marchandise, geste commercial, erreur facturation
- **Numérotation** : Série distincte `AV-2026-00001`
- **Liaison** : `credit_note.source_invoice_id` (nullable pour avoirs libres)
- **Imputation** : Automatique sur factures en cours (FIFO) ou manuel via `CreditNoteAllocation`
- **Remboursement** : Stripe `Refund` (linked to `PaymentIntent`), PayPal `Refund`, virement manuel → statut `refunded`
- **Comptabilité** : Écritures auto (706/709 produit, 411 client, 44571 TVA collectée)

### Remises
| Type | Application | Stockage |
|------|-------------|----------|
| **Ligne** | `%` ou montant fixe sur `InvoiceItem` | `discount_pct` / `discount_amount_ht` |
| **Global** | Sur total HT avant TVA | `invoice.global_discount_pct` |
| **Commercial** | Règle client (fidélité, volume) | `ClientDiscountRule` (seuil, %, date début/fin) |
| **Paiement anticipé** | Ex: 2% si paiement J+10 | `PaymentTermDiscount` (jours, %) |

**Calcul TVA** : Remise réduit assiette HT → TVA recalculée ligne par ligne.

---

## 9. Métriques de Succès (KPIs)

| Métrique | Formule | Cible | Fréquence |
|----------|---------|-------|-----------|
| **Taux de paiement à l'échéance** | `nb_factures_payées_à_j0 / nb_factures_émises` | > 75% | Hebdo |
| **Délai moyen de paiement (DSO)** | `Σ(jours_retard * montant_ttc) / Σ(montant_ttc)` | < 45j | Mensuel |
| **Taux de relance efficace** | `paiements_suivant_relance / relances_envoyées` | > 30% | Mensuel |
| **Taux conversion devis→facture** | `devis_acceptés / devis_envoyés` | > 40% | Mensuel |
| **Churn rate abonnements** | `abonnements_annulés_mois / abonnements_actifs_début_mois` | < 5% | Mensuel |
| **MRR (Monthly Recurring Revenue)** | `Σ(abonnements_actifs * prix_mensuel_ht)` | Croissance > 10%/mois | Temps réel |
| **Taux d'erreur paiement** | `paiements_échoués / tentatives_paiement` | < 2% | Quotidien |
| **Temps génération facture** | `moyenne(issued_at - created_at)` | < 2 min | Quotidien |
| **Disponibilité portail** | `uptime %` | 99.9% | Continu |

**Dashboards** : Grafana (Prometheus metrics) + exports CSV pour DSI/Compta.