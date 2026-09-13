# Application Comptable

> **SaaS de gestion comptable intelligente, scalable et ultra-sécurisée**

Application comptable complète conçue pour les professionnels du secteur comptable et les PME, offrant une gestion unifiée des comptes, transactions, factures, devis, taxes, rapports financiers et connexions bancaires.

---

## Table des matières

- [Démarrage rapide](#démarrage-rapide)
- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Structure du projet](#structure-du-projet)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Développement](#développement)
- [Tests](#tests)
- [API](#api)
- [Base de données](#base-de-données)
- [Déploiement](#déploiement)
- [Documentation](#documentation)
- [Sécurité](#sécurité)
- [Support](#support)
- [Licence](#licence)

---

## Démarrage rapide

### Avec Docker Compose (recommandé)

```bash
# 1. Clonez le dépôt
git clone <repository-url>
cd Application_Comptable

# 2. Copiez le fichier d'environnement
cp .env.example .env

# 3. Démarrez l'environnement de développement
make dev
```

> **Backend** : http://localhost:8000  
> **Frontend** : http://localhost:6000  
> **API Docs (Swagger)** : http://localhost:8000/docs  
> **API Docs (ReDoc)** : http://localhost:8000/redoc  
> **MailHog** : http://localhost:8025  
> **pgAdmin** : http://localhost:5050

### Sans Docker (développement local)

```bash
# Backend
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
# Configure .env with local PostgreSQL and Redis
uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev
```

---

## Fonctionnalités

| Catégorie | Fonctionnalités |
|-----------|----------------|
| **Authentification** | JWT, refresh tokens, 2FA (TOTP, WebAuthn), OAuth2 (Google, Microsoft) |
| **Organisation** | Multi-tenant, gestion des membres, plan d'abonnement |
| **Comptes** | Comptes bancaires, coffre-fort, cartes, crypto — avec solde en temps réel |
| **Transactions** | Saisie manuelle, import bancaire, OCR, rapprochement automatique |
| **Factures** | Création, envoi, paiement partiel, suivi d'échéance |
| **Devis** | Création, conversion en facture, suivi de statut |
| **Taxes** | TVA, TVA déductible, rapports de déclaration |
| **Rapports** | Bilan, compte de résultat, cash-flow, FEC, tableau de bord |
| **Paiements** | Carte, virement, SEPA, PayPal, crypto |
| **Souscriptions** | Plans tarifaires, gestion d'abonnement |
| **Audit** | Journal complet des actions avec traçabilité |
| **Notifications** | Alertes, rappels, seuils de solde |
| **Sécurité** | RBAC, chiffrement des tokens bancaires, rate limiting |

---

## Architecture

### Principles

- **Micro-services logiques** : backend et frontend sont découpés en modules fonctionnels indépendants
- **Multi-tenancy** : chaque organisation est isolée au niveau de la base de données (tenant_id)
- **Event-driven** : les webhooks et file d'attente Celery gèrent les tâches asynchrones
- **Sécurité par défaut** : RBAC, validation stricte, chiffrement, journalisation complète

### Diagramme d'architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Nginx (reverse proxy)              │
│                         TLS termination                   │
└────┬──────────────────────────────────────────┬───────┘
     │                                          │
     ▼                                          ▼
┌──────────────┐                       ┌──────────────┐
│   Frontend    │  HTTP API (JWT)     │   Backend     │
│  Next.js 14   │◄───────────────────►│  FastAPI      │
│  (SSR/SSG)    │                      │  (ASGI)       │
└────┬──────────┘                       └────┬──────────┘
     │                                          │
     │                                          ▼
     │  React Query / SWR                 ┌──────────────┐
     │  Client-side state               │  PostgreSQL  │
     │                                    │  (data)      │
     │                                    └──────────────┘
     │                                          │
     │                                    ┌────┴──────────┐
     │                                    │   Redis       │
     │                                    │  (session,    │
     │                                    │   cache)      │
     │                                    └──────────────┘
     │                                          │
     │                                    ┌────┴──────────┐
     │                                    │  MinIO/S3     │
     │                                    │  (storage)    │
     │                                    └──────────────┘
     │                                          │
     │                                    ┌────┴──────────┐
     │                                    │ Celery Worker │
     │                                    │  (async jobs) │
     │                                    └──────────────┘
     │                                          │
     │                                    ┌────┴──────────┐
     │                                    │  Prometheus   │
     │                                    │  Grafana      │
     │                                    └──────────────┘
```

### Technologies

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Backend** | Python | 3.11+ | Language |
| | FastAPI | 0.110+ | Web framework (ASGI) |
| | SQLAlchemy | 2.0+ | ORM (async) |
| | Pydantic | 2.6+ | Data validation |
| | PostgreSQL | 16 | Primary database |
| | Redis | 7 | Cache, sessions, rate limiting |
| | Celery | — | Async task queue |
| | Alembic | 1.13+ | Database migrations |
| **Frontend** | TypeScript | 5.4+ | Language |
| | Next.js | 14 | React framework (App Router) |
| | React | 18 | UI library |
| | Tailwind CSS | 3.4 | Styling |
| | Zod | 3.23 | Schema validation |
| | TanStack Query | 5.10 | Server state |
| | Zustand | 4.5 | Client state |
| **Infrastructure** | Docker | 24+ | Containerization |
| | Docker Compose | 2.20+ | Orchestration (dev) |
| | Kubernetes | 1.28+ | Orchestration (prod) |
| | Nginx | alpine | Reverse proxy |
| | MinIO | — | Object storage (S3-compatible) |

---

## Structure du projet

```
Application_Comptable/
├── backend/                    # API FastAPI
│   ├── app/
│   │   ├── api/v1/           # Endpoints API (v1)
│   │   │   ├── endpoints/     # Route handlers
│   │   │   └── schemas/       # Pydantic schemas
│   │   ├── core/             # Security, exceptions, validators, pagination
│   │   ├── models/           # SQLAlchemy models (32 tables)
│   │   ├── repositories/     # Data access layer (Repository pattern)
│   │   ├── services/         # Business logic layer
│   │   ├── tasks/            # Celery async tasks
│   │   └── tests/            # Tests (unit, integration, e2e)
│   ├── alembic/              # Database migrations
│   ├── Dockerfile
│   ├── Makefile
│   └── requirements.txt
├── frontend/                 # Application Next.js 14
│   ├── src/
│   │   ├── app/              # App Router (pages + layouts)
│   │   ├── components/        # React components (UI + domain)
│   │   ├── hooks/            # Custom hooks
│   │   ├── lib/              # Utilities, formatters, validators
│   │   ├── services/         # API clients
│   │   └── types/            # TypeScript type definitions
│   ├── Dockerfile
│   ├── tailwind.config.ts
│   └── package.json
├── shared/                   # Types et constantes partagés
│   ├── constants/            # TypeScript constants
│   └── types/                # TypeScript interfaces
├── infra/                    # Infrastructure as Code
│   ├── docker/               # Docker Compose (dev, prod, test)
│   ├── kubernetes/           # K8s manifests (base, dev, staging, prod)
│   ├── monitoring/           # Prometheus, Grafana, Alertmanager
│   └── scripts/              # Deploy, migrate, backup scripts
├── docs/                     # Documentation complète
│   ├── adr/                  # Architecture Decision Records
│   ├── api/                  # API documentation (OpenAPI)
│   ├── architecture/         # Architecture documents
│   ├── guides/               # Development, deployment, testing guides
│   └── ...
├── alembic/                  # Migrations
├── Makefile                  # Root make commands
├── docker-compose.yml        # Root compose (quick start)
└── .env.example
```

---

## Prérequis

| Outil | Version minimale |
|-------|-----------------|
| Docker | 24.0+ |
| Docker Compose | 2.20+ |
| Node.js | 20.0+ |
| Python | 3.11+ |
| PostgreSQL | 16 |
| Redis | 7 |
| Git | 2.30+ |

---

## Installation

### Option 1: Docker Compose (recommandé)

```bash
make dev          # Démarrer tous les services
make logs         # Suivre les logs
make db-migrate   # Appliquer les migrations
```

### Option 2: Installation manuelle

```bash
# 1. PostgreSQL
docker run --name postgres -e POSTGRES_USER=accounting_user \
  -e POSTGRES_PASSWORD=changeme_secure_password -e POSTGRES_DB=accounting \
  -p 5432:5432 -d postgres:16-alpine

# 2. Redis
docker run --name redis -p 6379:6379 -d redis:7-alpine

# 3. Backend
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your database/redis credentials
uvicorn app.main:app --reload --port 8000

# 4. Frontend
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

---

## Configuration

### Fichiers d'environnement

| File | Scope | Description |
|------|-------|-------------|
| `.env` | Root | Variables globales pour Docker Compose |
| `backend/.env` | Backend | Configuration spécifique du backend |
| `frontend/.env.local` | Frontend | Variables exposées côté client |

### Variables clés

```bash
# Backend
SECRET_KEY=openssl rand -hex 32                    # JWT secret (min 32 chars)
DATABASE_URL=postgresql+asyncpg://user:pass@db:5432/dbname
REDIS_URL=redis://redis:6379/0

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1  # API endpoint (exposé côté client)
```

> **Important** : Toutes les clés sensibles doivent être changées en production. Voir [Security](#sécurité).

---

## Développement

### Commandes utiles

```bash
make dev          # Start development environment
make logs         # Follow logs
make lint         # Lint backend (ruff + mypy)
make lint-frontend # Lint frontend (eslint + tsc)
make test         # Run backend tests
make test-frontend # Run frontend tests
make db-reset     # Reset database (destructive)
make db-migrate   # Run migrations
make db-backup    # Backup database
make clean        # Clean all artifacts
```

### Workflow de développement

1. Créer une branche depuis `main` : `git checkout -b feat/nom-fonctionnalite`
2. Développer la fonctionnalité avec tests
3. Passer le linting : `make lint && make lint-frontend`
4. Exécuter les tests : `make test && make test-frontend`
5. Commit avec convention Conventional Commits
6. Push et créer une PR

Voir le [guide de développement](docs/guides/development.md) pour plus de détails.

---

## Tests

```bash
# Backend tests
cd backend && pytest tests/ -v --cov=app --cov-report=html

# Frontend tests
cd frontend && npm test -- --coverage

# All tests
make test-all
```

| Type de test | Coverage cible |
|-------------|---------------|
| Backend | 80% minimum |
| Frontend | 70% minimum |

Voir le [guide de testing](docs/guides/testing.md) pour plus de détails.

---

## API

### Documentation interactive

- **Swagger UI** : `http://localhost:8000/docs`
- **ReDoc** : `http://localhost:8000/redoc`
- **OpenAPI Spec** : `docs/api/openapi.yaml`

### Authentification

L'API utilise **JWT Bearer tokens**. Après connexion via `/api/v1/auth/login`, utilisez le token dans l'en-tête `Authorization: Bearer <token>`.

### Endpoints

| Module | Prefix | Routes clés |
|--------|--------|-------------|
| Auth | `/auth` | `POST /login`, `POST /register`, `POST /refresh`, `POST /logout`, `GET /me` |
| Users | `/users` | `GET /`, `GET /{id}`, `POST /`, `PATCH /{id}`, `DELETE /{id}` |
| Organizations | `/organizations` | `GET /`, `POST /`, `GET /{id}`, `GET /{id}/members` |
| Accounts | `/accounts` | `GET /`, `POST /`, `GET /{id}` |
| Transactions | `/transactions` | `GET /`, `POST /` |
| Invoices | `/invoices` | `GET /`, `POST /`, `POST /{id}/pay`, `POST /{id}/send` |
| Quotes | `/quotes` | `GET /`, `POST /` |
| Taxes | `/taxes` | `GET /`, `GET /report` |
| Payments | `/payments` | `GET /` |
| Reports | `/reports` | `GET /balance-sheet`, `GET /income-statement` |
| Audit Logs | `/audit-logs` | `GET /` |
| Health | `/health` | `GET /` |

Voir la [documentation API complète](docs/api/openapi.yaml) pour les schémas détaillés.

---

## Base de données

### Schéma

La base de données PostgreSQL contient **32 tables** organisées en modules :

| Module | Tables | Description |
|--------|--------|-------------|
| Core | `users`, `organizations`, `user_organizations` | Authentification, multi-tenancy |
| Accounts | `accounts`, `account_categories`, `chart_of_accounts` | Plan comptable, comptes bancaires |
| Transactions | `transactions`, `transaction_categories`, `ocr_jobs` | Mouvements, catégorisation, OCR |
| Commerce | `invoices`, `invoice_items`, `quotes`, `quote_items` | Facturation, devis |
| Paiements | `payments`, `payment_methods` | Virements, cartes, méthodes |
| Fiscalité | `taxes` | TVA, impôts |
| Abonnement | `subscriptions`, `subscription_plans` | Plans, abonnements |
| Audit | `audit_logs` | Traçabilité complète |
| Notifications | `notifications` | Alertes et rappels |
| Dashboard | `dashboard_metrics`, `cash_flow_projections`, `financial_statements` | KPI, projections |
| Banque | `bank_connections`, `bank_connection_accounts` | Connexions bancaires |
| Récurrent | `recurring_expenses` | Charges récurrentes |

Voir le [schéma de base de données](docs/architecture/schema_base_donnees.md) pour le schéma ER complet.

### Migrations

```bash
# Créer une migration
cd backend
alembic revision --autogenerate -m "nom_de_la_migration"

# Appliquer les migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

---

## Déploiement

### Docker Compose (Production)

```bash
cp .env.example .env
# Configure production values in .env
docker compose -f infra/docker/docker-compose.prod.yml up -d --build
```

### Kubernetes

```bash
# Build images
docker build -t registry.example.com/accounting/backend:v1.0.0 -f backend/Dockerfile .
docker build -t registry.example.com/accounting/frontend:v1.0.0 -f frontend/Dockerfile .

# Deploy
kubectl apply -k infra/kubernetes/overlays/prod
```

Voir le [guide de déploiement](docs/guides/deployment.md) et le [guide Kubernetes](docs/guides/kubernetes-deployment.md) pour plus de détails.

---

## Documentation

| Document | Description |
|----------|-------------|
| [Index de la documentation](docs/INDEX.md) | Vue d'ensemble complète |
| [Guide de développement](docs/guides/development.md) | Setup, workflow, conventions |
| [Guide de contribution](docs/guides/contribution.md) | Comment contribuer |
| [Guide de testing](docs/guides/testing.md) | Stratégie de tests |
| [Guide de déploiement](docs/guides/deployment.md) | Docker, K8s, CI/CD |
| [Documentation API](docs/api/openapi.yaml) | Spécification OpenAPI 3.0 |
| [Schéma de la base](docs/architecture/schema_base_donnees.md) | Diagramme ER, tables |
| [Architecture](docs/architecture/) | Documents d'architecture |
| [ADRs](docs/adr/) | Architecture Decision Records |
| [Guides utilisateurs](docs/guides/user-guides/) | Guides d'utilisation fonctionnelle |
| [Types partagés](docs/shared/README.md) | Documentation des types TypeScript |

---

## Sécurité

- **Authentification** : JWT (HS256, 30 min) + refresh tokens (7 jours)
- **2FA** : TOTP (RFC 6238) et WebAuthn
- **Chiffrement** : mots de passe (bcrypt), tokens bancaires (Fernet AES-128)
- **RBAC** : contrôle d'accès basé sur les rôles (admin, accountant, manager, viewer)
- **Rate limiting** : 60 req/min (API), 10 req/min (login)
- **CORS** : configuré via `CORS_ORIGINS`
- **Audit trail** : tous les actions sont journalisées
- **Validation** : validation stricte des entrées (Pydantic, Zod)
- **Headers de sécurité** : X-Frame-Options, X-Content-Type-Options, CSP, HSTS

Voir le [document de sécurité](docs/architecture/securite_architecture.md) pour plus de détails.

---

## Support

- **Issues GitHub** : [github.com/Kilo-Org/kilocode/issues](https://github.com/Kilo-Org/kilocode/issues)
- **Documentation Kilo** : https://kilo.ai/docs

---

## Licence

[MIT License](LICENSE) — Voir le fichier [LICENSE](LICENSE) pour les détails.

---

*Document mis à jour le 2026-09-13*
