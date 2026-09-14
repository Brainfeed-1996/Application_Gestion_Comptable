# MODULE TRÉSORERIE & TABLEAU DE BORD

---

## 1. Vue d'overview

### Objectifs
- Centraliser la visibilité de la trésorerie en temps réel
- Anticiper les tensions de liquidité via l'IA
- Automatiser la détection d'anomalies et la génération d'alertes
- Fournir une prise de décision basée sur des projections quantifiées

### Bénéfices
- Réduction du risque de uncovered cash
- Diminution du temps de préparation des reportings (de jours à minutes)
- Détection précoce des dépassements de budget
- Amélioration du BFR (Besoin de Fonds de Roulement) par optimisation des flux

### Cas d'usage
- Contrôle quotidien de la trésorerie par le trésorier
- Planification stratégique (3/6/12 mois) par la direction
- Audits et conformité (traçabilité des alertes et décisions)
- Négociation bancaire avec des projections fiables

---

## 2. Dashboard 360°

### Architecture
- **Frontend** : React + TypeScript (composants modulaires)
- **State** : Redux Toolkit ou Zustand pour état global temps réel
- **Data layer** : WebSocket (Socket.IO) ou SSE (Server-Sent Events) pour mises à jour en temps réel
- **Backend** : Node.js/Express ou NestJS, API REST + WebSocket
- **Cache** : Redis pour les métriques fréquemment accédées

### Choix de bibliothèque de graphiques

| Critère | D3.js | Chart.js | Recharts |
|---------|-------|----------|----------|
| Flexibilité | Maximale | Modérée | Élevée |
| Courbe d'apprentissage | Élevée | Faible | Faible |
| Performance | Bonne | Très bonne | Bonne |
| Animations | Complètes | Limitées | Bonnes |
| Interaction | Totale | Basique | Bonne |

**Recommandation** : **Recharts** pour la majorité des graphiques (simplicité, bon équilibre) + **D3.js** pour les visualisations complexes (cash-flow interactif, heatmaps).

### Composants principaux
1. **Cash-flow** : Courbe cumulée entrées/sorties avec projection IA
2. **BFR** : Indicateur de Besoin de Fonds de Roulement (temps réel)
3. **Runaway** : Jours de trésorerie restant avant épuisement
4. **Burn Rate** : Taux de consommation de trésorerie (mensuel)
5. **Alertes** : Feed d'alertes en temps réel
6. **Projections IA** : Graphiques 3/6/12 mois avec intervalles de confiance

### Temps réel
- **WebSocket** (Socket.IO) pour les mises à jour push des métriques
- **SSE** comme alternative légère pour les navigateurs non compatibles WebSocket
- **Ping/keep-alive** every 30s pour maintenir la connexion

### Design System
- **Palette** : Ton corporate (ex: bleu #1e40af, vert #16a34a, orange #ea580c, rouge #dc2626)
- **Typographie** : Inter / Roboto, échelle typographique 1.25
- **Spacing** : système 4px (4, 8, 12, 16, 24, 32, 48)
- **Composants** : shadcn/ui ou Mantine pour cohérence
- **Accessibilité** : WCAG AA, contrastes vérifiés, labels ARIA
---

## 3. Prédictif IA

### Modèles de projection
| Modèle | Type | Avantages | Inconvénients | Choix |
|--------|------|-----------|---------------|-------|
| ARIMA | Série temporelle classique | Interprétable, bon pour séries stationnaires | Limité sur motifs complexes | Baseline |
| Prophet | Série temporelle (Meta) | Saisonnalité, tendance, fêtes | Moins précis sur données bruitées | Recommandé |
| LSTM | Réseau de neurones récurrent | Apprentissage de motifs complexes | Besoin de données massives, boîte noire | Cas avancés |

**Approche hybride** : Prophet pour les projections 3/6/12 mois + LSTM pour la détection d'anomalies.

### Features d'entrée
- **Historique bancaire** : Flux entrants/sortants 12-24 mois
- **Factures en attente** : Montant, date d'échéance, probabilité de paiement (score client)
- **Dépenses récurrentes** : Loyers, salaires, abonnements (montant, fréquence)
- **Saisonnalité** : Jours fériés, trimestres, cycles business
- **Indicateurs externes** : Taux d'intérêt, conjoncture (optionnel)

### Projections
- **3 mois** : Court terme, haute précision (±5%)
- **6 mois** : Milieu terme, précision moyenne (±10%)
- **12 mois** : Long terme, précision réduite (±20%)
- **Intervalles de confiance** : 95% (1.96σ), 99% (2.58σ)

### Pipeline
1. Collecte → Nettoyage → Feature engineering
2. Entrainement (retrain hebdomadaire)
3. Inférence → Stockage en DB → Exposition API
4. Evaluation : MAE, RMSE, MAPE
---

## 4. Alertes intelligentes

### Types d'alertes
| Type | Description | Seuil par défaut | Gravité |
|------|-------------|------------------|---------|
| Découvert imminent | Solde < 0 dans N jours | 7 jours | Critique |
| Anomalie dépense | Dépassement > 2σ de la moyenne | 2 écart-types | Élevée |
| Retard paiement | Facture échue non payée | 3 jours | Moyenne |
| BFR négatif | Besoin de Fonds de Roulement < 0 | 0 € | Élevée |
| Burn rate élevé | Consommation > 30% du capital | 30% | Moyenne |

### Canaux de notification
- **Push** : In-app (Toast + badge)
- **Email** : HTML structuré, priorité selon gravité
- **SMS** : Alertes critiques uniquement (découvert, BFR critique)

### Configuration
- **Seuils configurables** : Par entreprise, par compte, par profil
- **Fréquentiation** : Temps réel / Horaires (ex: 8h-18h) / Batch quotidien
- **Escalade** : Silencieuse → Push → Email → SMS (selon non-réponse)
- **Deduplication** : Fenêtre de 24h pour éviter les doublons

### Architecture
```
Engine de règles → Filtre seuils → Gestion fréquentiation
    → Filtre horaires → Routage canal → Envoi
```
---

## 5. Schéma de données

### DashboardMetrics
```sql
CREATE TABLE dashboard_metrics (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id),
    metric_date DATE NOT NULL,
    cash_balance DECIMAL(15,2) NOT NULL,
    bfr DECIMAL(15,2),
    runaway_days INT,
    burn_rate DECIMAL(5,2),
    net_flow DECIMAL(15,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_metrics_company_date ON dashboard_metrics(company_id, metric_date DESC);
```

### CashFlowProjections
```sql
CREATE TABLE cash_flow_projections (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id),
    horizon_months INT NOT NULL, -- 3, 6, 12
    projected_balance DECIMAL(15,2) NOT NULL,
    confidence_lower DECIMAL(15,2),
    confidence_upper DECIMAL(15,2),
    model_version VARCHAR(20),
    generated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Alerts
```sql
CREATE TABLE alerts (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id),
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    metadata JSONB,
    channels_sent JSONB,
    status VARCHAR(20) DEFAULT 'unread', -- unread, read, resolved
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_alerts_company_status ON alerts(company_id, status, created_at DESC);
```

### RecurringExpenses
```sql
CREATE TABLE recurring_expenses (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id),
    label VARCHAR(255) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    frequency VARCHAR(20) NOT NULL, -- daily, weekly, monthly, quarterly, yearly
    next_due_date DATE NOT NULL,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE
);
```

### Budgets
```sql
CREATE TABLE budgets (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id),
    category VARCHAR(100) NOT NULL,
    period VARCHAR(20) NOT NULL, -- monthly, quarterly, yearly
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    allocated DECIMAL(15,2) NOT NULL,
    spent DECIMAL(15,2) DEFAULT 0,
    remaining AS (allocated - spent) STORED
);
CREATE UNIQUE INDEX idx_budget_unique ON budgets(company_id, category, period_start);
```
---

## 6. Endpoints API nécessaires

### Métriques
- `GET /api/v1/metrics/current` — Solde, BFR, runaway, burn rate (temps réel)
- `GET /api/v1/metrics/history?from=&to=` — Historique des métriques
- `GET /api/v1/metrics/summary` — Résumé du jour (entrées, sorties, net)

### Projections IA
- `GET /api/v1/projections?horizon=3|6|12` — Projections avec intervalles de confiance
- `POST /api/v1/projections/retrain` — Déclencher un réentraînement manuel

### Alertes
- `GET /api/v1/alerts?status=&limit=` — Liste des alertes
- `PATCH /api/v1/alerts/:id` — Marquer comme lu/résolu
- `POST /api/v1/alerts/:id/escalate` — Forcer l'escalade

### Budgets & Dépenses
- `GET /api/v1/budgets/current` — Budgets du mois en cours
- `GET /api/v1/recurring-expenses` — Liste des dépenses récurrentes
- `POST /api/v1/transactions` — Enregistrement d'une transaction (webhook bancaire)

### WebSocket
- `WS /ws/metrics` — Push des mises à jour de métriques (JSON)
- `WS /ws/alerts` — Push des nouvelles alertes

### Rate limiting
- 100 req/min pour les endpoints standards
- 10 req/min pour les endpoints IA (coûteux)
---

## 7. Algorithmes de calcul

### BFR (Besoin de Fonds de Roulement)
```
BFR = Actif Circulant - Passif Circulant
Actif Circulant = Stocks + Clients + Disponibilités
Passif Circulant = Fournisseurs + Charges à Payer + Salaires
```
**Interprétation** :
- BFR > 0 : Besoin de financement à court terme
- BFR < 0 : Excédent de trésorerie (financement gratuit des actifs)

### Runaway (Jours de trésorerie restants)
```
Runaway = Trésorerie Disponible / Dépenses Moyennes Quotidiennes
Dépenses Moyennes Quotidiennes = (Total Dépenses 90j) / 90
```
**Seuil d'alerte** : < 30 jours → warning, < 15 jours → critique

### Burn Rate (Taux de consommation)
```
Burn Rate = (Solde Début Période - Solde Fin Période) / Solde Début Période
```
**Interprétation** :
- 0-10% : Sain
- 10-30% : Attention
- >30% : Critique (risque de rupture)

### Cash Flow Net
```
Cash Flow Net = Σ Entrées - Σ Sorties
Entrées = Ventes, Remboursements, Apports
Sorties = Achats, Salaires, Charges, Impôts, Remboursements Dette
```

### Cash Flow Cumulé (Runway)
```
Cash Flow Cumulé(t) = Solde Initial + Σ(Cash Flow Net(1..t))
```

### Score de Crédit Interne (pour features IA)
```
Score = w1*Historique Paiement + w2*Ratio Trésorerie + w3*Concentration Client
```
---

## 8. Stratégies de cache (Redis)

### Clés de cache
```
metrics:current:{company_id}        TTL: 60s
metrics:history:{company_id}:{from}:{to}  TTL: 300s
projections:{company_id}:{horizon}   TTL: 3600s (1h)
alerts:unread:{company_id}           TTL: 30s
budgets:current:{company_id}         TTL: 300s
```

### Pattern de cache
- **Cache-Aside** : Lecture → cache miss → DB → remise en cache
- **Write-Through** : Écriture → cache + DB simultanément
- **Write-Behind** : Écriture → cache → DB asynchrone (pour transactions)

### Invalidation
- **TTL** : Temps de vie automatique
- **Event-driven** : Invalidation sur `transaction.created`, `invoice.paid`
- **Pub/Sub** : Canal `cache:invalidate` pour invalidation cross-instances

### Performance cible
- < 50ms pour les lectures de métriques courantes
- < 200ms pour les projections IA (cache + calcul)
- 99% de hit rate sur les endpoints dashboard

### Configuration Redis
- Maxmemory policy : `allkeys-lru`
- Persistence : RDB every 60s + AOF every second
- Cluster : 3 nœuds (master + 2 replicas) pour haute disponibilité
---

## 9. Métriques de succès

### Performance
- **Latence dashboard** : < 200ms (p95)
- **Disponibilité** : 99.9% uptime
- **Cache hit rate** : > 90%

### Utilisateur
- **Adoption** : % d'utilisateurs actifs (MAU/DAU)
- **Rétention** : % de réutilisation 7j/30j
- **Satisfaction** : NPS > 40, CSAT > 4.5/5

### Métier
- **Réduction uncovered cash** : -50% des incidents de découvert
- **Précision IA** : MAPE < 15% sur projections 3 mois
- **Réduction temps reporting** : -80% (de 4h à < 30min)
- **Taux de résolution alertes** : > 80% dans 24h

### Technique
- **Taux d'erreur API** : < 0.1%
- **Temps de réentraînement IA** : < 1h (hebdomadaire)
- **Couverture tests** : > 80% (unit + integration)
