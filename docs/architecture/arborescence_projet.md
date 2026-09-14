# Arborescence du Projet - Application Comptable

## 1. Arborescence Complète

```
Application_Comptable/
├── backend/                          # API FastAPI
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                   # Point d'entrée FastAPI
│   │   ├── config.py                 # Configuration (Pydantic Settings)
│   │   ├── database.py               # Session DB, engine, base
│   │   ├── models/                   # Modèles SQLAlchemy
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── organization.py
│   │   │   ├── account.py
│   │   │   ├── transaction.py
│   │   │   ├── invoice.py
│   │   │   ├── tax.py
│   │   │   └── audit_log.py
│   │   ├── schemas/                  # Schémas Pydantic (request/response)
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── organization.py
│   │   │   ├── account.py
│   │   │   ├── transaction.py
│   │   │   ├── invoice.py
│   │   │   ├── tax.py
│   │   │   └── audit_log.py
│   │   ├── api/                      # Routes API organisées par ressource
│   │   │   ├── __init__.py
│   │   │   ├── deps.py               # Dépendances FastAPI (auth, DB)
│   │   │   ├── v1/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── router.py         # Routeur principal v1
│   │   │   │   ├── endpoints/
│   │   │   │   │   ├── __init__.py
│   │   │   │   │   ├── auth.py
│   │   │   │   │   ├── users.py
│   │   │   │   │   ├── organizations.py
│   │   │   │   │   ├── accounts.py
│   │   │   │   │   ├── transactions.py
│   │   │   │   │   ├── invoices.py
│   │   │   │   │   ├── taxes.py
│   │   │   │   │   └── audit_logs.py
│   │   │   │   └── schemas/          # Schémas spécifiques API v1
│   │   ├── services/                 # Logique métier
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py
│   │   │   ├── user_service.py
│   │   │   ├── organization_service.py
│   │   │   ├── account_service.py
│   │   │   ├── transaction_service.py
│   │   │   ├── invoice_service.py
│   │   │   ├── tax_service.py
│   │   │   └── audit_service.py
│   │   ├── repositories/             # Accès données (patterns Repository)
│   │   │   ├── __init__.py
│   │   │   ├── base.py
│   │   │   ├── user_repo.py
│   │   │   ├── organization_repo.py
│   │   │   ├── account_repo.py
│   │   │   ├── transaction_repo.py
│   │   │   ├── invoice_repo.py
│   │   │   ├── tax_repo.py
│   │   │   └── audit_repo.py
│   │   ├── core/                     # Utilitaires transverses
│   │   │   ├── __init__.py
│   │   │   ├── security.py           # JWT, hash, tokens
│   │   │   ├── exceptions.py         # Exceptions personnalisées
│   │   │   ├── pagination.py
│   │   │   └── validators.py
│   │   └── tasks/                    # Tâches asynchrones (Celery)
│   │       ├── __init__.py
│   │       ├── celery_app.py
│   │       └── email_tasks.py
│   ├── tests/                        # Tests backend
│   │   ├── __init__.py
│   │   ├── conftest.py               # Fixtures pytest
│   │   ├── unit/
│   │   │   ├── test_services/
│   │   │   ├── test_repositories/
│   │   │   └── test_core/
│   │   ├── integration/
│   │   │   ├── test_api/
│   │   │   └── test_database/
│   │   └── e2e/
│   ├── alembic/                      # Migrations DB
│   │   ├── versions/
│   │   ├── env.py
│   │   └── script.py.mako
│   ├── Dockerfile
│   ├── pyproject.toml
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/                         # Application Next.js 14+
│   ├── src/
│   │   ├── app/                      # App Router (Next.js 13+)
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── globals.css
│   │   │   ├── (auth)/               # Route group auth
│   │   │   │   ├── login/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── register/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── layout.tsx
│   │   │   ├── (dashboard)/          # Route group protégé
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── dashboard/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── organizations/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── settings/
│   │   │   │   │   └── new/
│   │   │   │   ├── accounts/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   ├── transactions/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── new/
│   │   │   │   │   └── [id]/
│   │   │   │   ├── invoices/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── new/
│   │   │   │   │   └── [id]/
│   │   │   │   ├── taxes/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── reports/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── audit-logs/
│   │   │   │       └── page.tsx
│   │   │   └── api/                  # API Routes Next.js (proxy, webhooks)
│   │   │       └── webhooks/
│   │   ├── components/               # Composants UI réutilisables
│   │   │   ├── ui/                   # Composants de base (shadcn/ui style)
│   │   │   │   ├── button.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── select.tsx
│   │   │   │   ├── table.tsx
│   │   │   │   ├── modal.tsx
│   │   │   │   ├── tooltip.tsx
│   │   │   │   └── ...
│   │   │   ├── forms/                # Composants formulaires
│   │   │   │   ├── account-form.tsx
│   │   │   │   ├── transaction-form.tsx
│   │   │   │   ├── invoice-form.tsx
│   │   │   │   └── organization-form.tsx
│   │   │   ├── layout/               # Layout components
│   │   │   │   ├── header.tsx
│   │   │   │   ├── sidebar.tsx
│   │   │   │   ├── footer.tsx
│   │   │   │   └── breadcrumb.tsx
│   │   │   ├── charts/               # Graphiques (Recharts)
│   │   │   │   ├── revenue-chart.tsx
│   │   │   │   ├── expense-chart.tsx
│   │   │   │   └── balance-chart.tsx
│   │   │   └── tables/               # Tables de données avancées
│   │   │       ├── data-table.tsx
│   │   │       └── transaction-table.tsx
│   │   ├── lib/                      # Utilitaires client
│   │   │   ├── api.ts                # Client API (Axios/Fetch)
│   │   │   ├── auth.ts               # Auth helpers
│   │   │   ├── utils.ts              # Helpers génériques
│   │   │   ├── validators.ts         # Validations Zod
│   │   │   └── constants.ts
│   │   ├── hooks/                    # Custom React hooks
│   │   │   ├── use-auth.ts
│   │   │   ├── use-organizations.ts
│   │   │   ├── use-accounts.ts
│   │   │   ├── use-transactions.ts
│   │   │   ├── use-invoices.ts
│   │   │   └── use-debounce.ts
│   │   ├── store/                    # État global (Zustand)
│   │   │   ├── auth-store.ts
│   │   │   ├── organization-store.ts
│   │   │   └── ui-store.ts
│   │   ├── types/                    # Types TypeScript partagés
│   │   │   ├── user.ts
│   │   │   ├── organization.ts
│   │   │   ├── account.ts
│   │   │   ├── transaction.ts
│   │   │   ├── invoice.ts
│   │   │   ├── tax.ts
│   │   │   └── api.ts
│   │   └── styles/                   # Styles globaux
│   │       ├── globals.css
│   │       └── tailwind.css
│   ├── public/                       # Assets statiques
│   ├── tests/                        # Tests frontend
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   ├── .eslintrc.json
│   ├── .prettierrc
│   └── .env.example
│
├── infra/                            # Infrastructure Docker & CI/CD
│   ├── docker/
│   │   ├── docker-compose.yml        # Dev local
│   │   ├── docker-compose.prod.yml   # Production
│   │   ├── docker-compose.test.yml   # Tests
│   │   ├── nginx/
│   │   │   ├── nginx.conf
│   │   │   └── conf.d/
│   │   ├── postgres/
│   │   │   └── init-scripts/
│   │   └── redis/
│   │       └── redis.conf
│   ├── kubernetes/                   # K8s manifests (optionnel)
│   │   ├── base/
│   │   ├── overlays/
│   │   │   ├── dev/
│   │   │   ├── staging/
│   │   │   └── prod/
│   │   └── helm/
│   ├── scripts/
│   │   ├── deploy.sh
│   │   ├── backup-db.sh
│   │   └── migrate.sh
│   └── monitoring/
│       ├── prometheus.yml
│       ├── grafana/
│       └── alertmanager.yml
│
├── docs/                             # Documentation
│   ├── architecture/
│   │   ├── arborescence_projet.md    # Ce fichier
│   │   ├── database_schema.md
│   │   ├── api_endpoints.md
│   │   └── data_flow.md
│   ├── api/
│   │   └── openapi.yaml              # Spec OpenAPI générée
│   ├── guides/
│   │   ├── development.md
│   │   ├── deployment.md
│   │   ├── testing.md
│   │   └── contribution.md
│   └── adr/                          # Architecture Decision Records
│       ├── 001-use-fastapi.md
│       ├── 002-use-nextjs.md
│       └── 003-database-choice.md
│
├── shared/                           # Code partagé (types, constants)
│   ├── types/
│   │   ├── index.ts
│   │   └── python/
│   └── constants/
│       ├── index.ts
│       └── python/
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── cd.yml
│   │   └── security.yml
│   ├── dependabot.yml
│   └── CODEOWNERS
│
├── .gitignore
├── .env.example
├── README.md
├── Makefile                          # Commandes communes
└── docker-compose.yml                # Racine (orchestration complète)
```

## 2. Rôle de Chaque Dossier Principal

| Dossier | Rôle |
|---------|------|
| `backend/` | API REST FastAPI - logique métier, persistance, auth |
| `frontend/` | SPA Next.js 14+ (App Router) - interface utilisateur |
| `infra/` | Infrastructure as Code - Docker, K8s, monitoring, scripts |
| `docs/` | Documentation technique, ADR, guides, specs API |
| `shared/` | Code partagé entre frontend/backend (types, constantes) |
| `.github/` | CI/CD GitHub Actions, sécurité, dépendances |

## 3. Fichiers Clés avec Chemins Complets

### Backend
| Fichier | Description |
|---------|-------------|
| `backend/app/main.py` | Entrée FastAPI, middleware, routers, lifespan |
| `backend/app/config.py` | Settings via Pydantic BaseSettings (.env) |
| `backend/app/database.py` | Engine SQLAlchemy, session factory, Base |
| `backend/app/models/*.py` | Modèles ORM (tables DB) |
| `backend/app/schemas/*.py` | Schémas Pydantic validation I/O |
| `backend/app/api/v1/endpoints/*.py` | Endpoints REST par ressource |
| `backend/app/services/*.py` | Logique métier, règles de gestion |
| `backend/app/repositories/*.py` | Abstraction accès données |
| `backend/app/core/security.py` | JWT, bcrypt, OAuth2, permissions |
| `backend/pyproject.toml` | Config projet, deps, tools (ruff, mypy, pytest) |
| `backend/alembic/env.py` | Config migrations auto-générées |

### Frontend
| Fichier | Description |
|---------|-------------|
| `frontend/src/app/layout.tsx` | Layout racine, providers, metadata |
| `frontend/src/app/(dashboard)/layout.tsx` | Layout authentifié (sidebar, header) |
| `frontend/src/lib/api.ts` | Client API typé, interceptors, error handling |
| `frontend/src/lib/auth.ts` | Gestion tokens, refresh, logout |
| `frontend/src/store/auth-store.ts` | État auth global (Zustand) |
| `frontend/src/hooks/use-*.ts` | Hooks data fetching (TanStack Query) |
| `frontend/src/components/ui/*.tsx` | Composants UI primitifs |
| `frontend/tsconfig.json` | Config TypeScript strict, path aliases |
| `frontend/next.config.js` | Config Next.js (images, rewrites, headers) |
| `frontend/tailwind.config.ts` | Design system (colors, spacing, tokens) |
| `frontend/package.json` | Dépendances, scripts, engines |

### Infrastructure
| Fichier | Description |
|---------|-------------|
| `infra/docker/docker-compose.yml` | Stack dev: postgres, redis, backend, frontend, nginx |
| `infra/docker/nginx/nginx.conf` | Reverse proxy, SSL, rate limiting |
| `infra/scripts/deploy.sh` | Déploiement zero-downtime |
| `infra/monitoring/prometheus.yml` | Metrics scraping config |

## 4. Configuration des Fichiers

### `backend/pyproject.toml`
```toml
[project]
name = "accounting-backend"
version = "0.1.0"
description = "API Comptable FastAPI"
requires-python = ">=3.11"
dependencies = [
    "fastapi>=0.109",
    "uvicorn[standard]>=0.27",
    "sqlalchemy>=2.0",
    "alembic>=1.13",
    "asyncpg>=0.29",
    "pydantic>=2.5",
    "pydantic-settings>=2.1",
    "python-jose[cryptography]>=3.3",
    "passlib[bcrypt]>=1.7",
    "python-multipart>=0.0.6",
    "redis>=5.0",
    "celery>=5.3",
    "httpx>=0.26",
    "pytest>=7.4",
    "pytest-asyncio>=0.23",
]

[tool.ruff]
line-length = 100
target-version = "py311"

[tool.mypy]
python_version = "3.11"
strict = true

[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]
```

### `frontend/package.json`
```json
{
  "name": "accounting-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "next": "14.2.x",
    "react": "^18.3",
    "react-dom": "^18.3",
    "@tanstack/react-query": "^5.0",
    "zustand": "^4.5",
    "axios": "^1.7",
    "zod": "^3.23",
    "react-hook-form": "^7.51",
    "@hookform/resolvers": "^3.3",
    "recharts": "^2.12",
    "date-fns": "^3.6",
    "lucide-react": "^0.400"
  },
  "devDependencies": {
    "typescript": "^5.4",
    "@types/react": "^18.3",
    "@types/node": "^20.14",
    "tailwindcss": "^3.4",
    "postcss": "^8.4",
    "eslint": "^8.57",
    "eslint-config-next": "14.2",
    "prettier": "^3.3",
    "jest": "^29.7",
    "@testing-library/react": "^16.0",
    "@playwright/test": "^1.44"
  }
}
```

### `backend/Dockerfile`
```dockerfile
FROM python:3.11-slim
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev && rm -rf /var/lib/apt/lists/*
COPY pyproject.toml requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### `frontend/Dockerfile`
```dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=base /app/public ./public
COPY --from=base /app/.next/standalone ./
COPY --from=base /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

### `infra/docker/docker-compose.yml`
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: accounting
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./postgres/init-scripts:/docker-entrypoint-initdb.d
    ports: ["5432:5432"]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d accounting"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    volumes: [redis_data:/data]
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  backend:
    build:
      context: ../../backend
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql+asyncpg://${DB_USER}:${DB_PASSWORD}@postgres:5432/accounting
      REDIS_URL: redis://redis:6379/0
      SECRET_KEY: ${SECRET_KEY}
      ALGORITHM: HS256
      ACCESS_TOKEN_EXPIRE_MINUTES: 30
    ports: ["8000:8000"]
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ../../backend:/app  # Hot reload dev

  frontend:
    build:
      context: ../../frontend
      dockerfile: Dockerfile
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000/api/v1
    ports: ["3000:3000"]
    depends_on: [backend]
    volumes:
      - ../../frontend:/app
      - /app/node_modules
      - /app/.next

  nginx:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
    depends_on: [frontend, backend]

volumes:
  postgres_data:
  redis_data:
```

### `.env.example` (racine)
```env
# Database
DB_USER=accounting_user
DB_PASSWORD=changeme_secure_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=accounting

# Backend
SECRET_KEY=your-super-secret-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# Redis
REDIS_URL=redis://localhost:6379/0

# Email (optionnel)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@example.com
SMTP_PASSWORD=changeme
```

### `frontend/tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/store/*": ["./src/store/*"],
      "@/types/*": ["./src/types/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### `frontend/next.config.js`
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  experimental: {
    serverActions: { bodySizeLimit: '2mb' },
  },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  async rewrites() {
    return [
      { source: '/api/backend/:path*', destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*` },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
    ];
  },
};
module.exports = nextConfig;
```

### `frontend/tailwind.config.ts`
```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff', 100: '#e0f2fe', 500: '#0ea5e9', 600: '#0284c7', 900: '#0c4a6e',
        },
        success: { 500: '#22c55e', 600: '#16a34a' },
        warning: { 500: '#f59e0b', 600: '#d97706' },
        danger: { 500: '#ef4444', 600: '#dc2626' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      spacing: { '18': '4.5rem', '88': '22rem', '128': '32rem' },
    },
  },
  plugins: [],
};
export default config;
```

## 5. Schéma de Base de Données

### Tables et Relations

```
┌─────────────┐       ┌──────────────────┐       ┌─────────────┐
│   users     │       │  organizations   │       │  accounts   │
├─────────────┤       ├──────────────────┤       ├─────────────┤
│ id (PK)     │◄──────│ id (PK)          │◄──────│ id (PK)     │
│ email       │       │ name             │       │ code        │
│ password_hash│      │ siret            │       │ name        │
│ first_name  │       │ address          │       │ type        │
│ last_name   │       │ vat_number       │       │ parent_id   │
│ is_active   │       │ currency         │       │ org_id (FK) │
│ is_superuser│       │ created_at       │       │ created_at  │
│ created_at  │       └────────┬─────────┘       └──────┬──────┘
└─────────────┘                │                      │
       │                       │                      │
       │              ┌────────▼────────┐             │
       │              │ organization_   │             │
       │              │ members         │             │
       │              ├─────────────────┤             │
       │              │ user_id (FK)    │             │
       │              │ org_id (FK)     │             │
       │              │ role            │             │
       │              └─────────────────┘             │
       │                       │                      │
       ▼                       ▼                      ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────────┐
│  transactions    │ │    invoices      │ │       taxes          │
├──────────────────┤ ├──────────────────┤ ├──────────────────────┤
│ id (PK)          │ │ id (PK)          │ │ id (PK)              │
│ date             │ │ number           │ │ code                 │
│ amount           │ │ date             │ │ name                 │
│ description      │ │ due_date         │ │ rate                 │
│ type             │ │ status           │ │ type                 │
│ reference        │ │ subtotal         │ │ is_active            │
│ account_id (FK)  │ │ tax_total        │ │ created_at           │
│ org_id (FK)      │ │ total            │ └──────────────────────┘
│ created_by (FK)  │ │ account_id (FK)  │           ▲
│ created_at       │ │ org_id (FK)      │           │
└──────────────────┘ │ customer_id (FK) │           │
       ▲             └────────┬─────────┘           │
       │                      │                     │
       │              ┌───────▼────────┐             │
       │              │ invoice_lines  │             │
       │              ├────────────────┤             │
       │              │ id (PK)        │             │
       │              │ invoice_id(FK) │             │
       │              │ account_id(FK) │             │
       │              │ tax_id (FK)    │             │
       │              │ description    │             │
       │              │ quantity       │             │
       │              │ unit_price     │             │
       │              │ total          │             │
       │              └────────────────┘             │
       │                                             │
       ▼                                             ▼
┌─────────────────────────────────────────────────────────────┐
│                      audit_logs                             │
├─────────────────────────────────────────────────────────────┤
│ id (PK)  │ entity_type  │ entity_id  │ action  │ user_id   │
│ changes  │ (JSONB)      │ timestamp  │ ip_addr │ user_agent│
└─────────────────────────────────────────────────────────────┘
```

### Détails Tables

| Table | Colonnes Principales | Index | Contraintes |
|-------|---------------------|-------|-------------|
| `users` | id, email, password_hash, first_name, last_name, is_active, is_superuser, created_at | idx_email (unique), idx_active | email UNIQUE, NOT NULL |
| `organizations` | id, name, siret, address, vat_number, currency, created_at | idx_siret (unique), idx_vat | siret UNIQUE |
| `organization_members` | user_id, org_id, role (admin/member/viewer), joined_at | PK(user_id, org_id), idx_org | FK user, FK org, role CHECK |
| `accounts` | id, code, name, type (asset/liability/equity/revenue/expense), parent_id, org_id, created_at | idx_code_org (unique), idx_org, idx_parent | FK org, FK parent (self), code UNIQUE per org |
| `transactions` | id, date, amount, description, type (debit/credit), reference, account_id, org_id, created_by, created_at | idx_account_date, idx_org_date, idx_reference | FK account, FK org, FK user |
| `invoices` | id, number, date, due_date, status (draft/sent/paid/cancelled), subtotal, tax_total, total, account_id, org_id, customer_id, created_at | idx_number_org (unique), idx_org_date, idx_status | FK account, FK org, FK customer (org), number UNIQUE per org |
| `invoice_lines` | id, invoice_id, account_id, tax_id, description, quantity, unit_price, total | idx_invoice | FK invoice, FK account, FK tax |
| `taxes` | id, code, name, rate, type (tva/others), is_active, created_at | idx_code (unique) | code UNIQUE, rate >= 0 |
| `audit_logs` | id, entity_type, entity_id, action (create/update/delete), changes (JSONB), user_id, ip_address, user_agent, created_at | idx_entity, idx_user, idx_created_at | FK user (nullable) |

## 6. Flux de Données et API Endpoints

### Authentification
```
POST   /api/v1/auth/login           → Access + Refresh tokens
POST   /api/v1/auth/refresh         → Nouveau access token
POST   /api/v1/auth/logout          → Blacklist refresh token
GET    /api/v1/auth/me              → Profil utilisateur courant
```

### Utilisateurs
```
GET    /api/v1/users                → Liste paginée (admin)
POST   /api/v1/users                → Créer utilisateur (admin)
GET    /api/v1/users/{id}           → Détail utilisateur
PATCH  /api/v1/users/{id}           → Modifier utilisateur
DELETE /api/v1/users/{id}           → Désactiver utilisateur
```

### Organisations
```
GET    /api/v1/organizations        → Liste orgs utilisateur
POST   /api/v1/organizations        → Créer organisation
GET    /api/v1/organizations/{id}   → Détail organisation
PATCH  /api/v1/organizations/{id}   → Modifier organisation
DELETE /api/v1/organizations/{id}   → Supprimer organisation
GET    /api/v1/organizations/{id}/members → Membres
POST   /api/v1/organizations/{id}/members → Ajouter membre
PATCH  /api/v1/organizations/{id}/members/{user_id} → Modifier rôle
DELETE /api/v1/organizations/{id}/members/{user_id} → Retirer membre
```

### Comptes (Plan Comptable)
```
GET    /api/v1/accounts             → Liste (filtres: type, parent, search)
POST   /api/v1/accounts             → Créer compte
GET    /api/v1/accounts/{id}        → Détail compte + solde
PATCH  /api/v1/accounts/{id}        → Modifier compte
DELETE /api/v1/accounts/{id}        → Supprimer (si pas de transactions)
GET    /api/v1/accounts/tree        → Arborescence complète
GET    /api/v1/accounts/{id}/balance → Solde à date
```

### Transactions
```
GET    /api/v1/transactions         → Liste paginée (filtres: date, account, type, search)
POST   /api/v1/transactions         → Créer transaction (validation double entrée)
GET    /api/v1/transactions/{id}    → Détail transaction
PATCH  /api/v1/transactions/{id}    → Modifier (si non verrouillée)
DELETE /api/v1/transactions/{id}    → Supprimer (si non verrouillée)
POST   /api/v1/transactions/bulk    → Import CSV/Excel
GET    /api/v1/transactions/export  → Export CSV/PDF
```

### Factures
```
GET    /api/v1/invoices             → Liste (filtres: status, date, customer)
POST   /api/v1/invoices             → Créer facture + lignes
GET    /api/v1/invoices/{id}        → Détail facture + lignes
PATCH  /api/v1/invoices/{id}        → Modifier (si draft)
POST   /api/v1/invoices/{id}/send   → Envoyer par email (change status → sent)
POST   /api/v1/invoices/{id}/pay    → Enregistrer paiement
DELETE /api/v1/invoices/{id}        → Annuler (si draft/sent)
GET    /api/v1/invoices/{id}/pdf    → Générer PDF
```

### Taxes
```
GET    /api/v1/taxes                → Liste taxes actives
POST   /api/v1/taxes                → Créer taxe (admin)
GET    /api/v1/taxes/{id}           → Détail taxe
PATCH  /api/v1/taxes/{id}           → Modifier taxe
DELETE /api/v1/taxes/{id}           → Désactiver taxe
GET    /api/v1/taxes/report         → Déclaration TVA (CA collecté/deductible)
```

### Audit Logs
```
GET    /api/v1/audit-logs           → Liste (filtres: entity, user, date range)
GET    /api/v1/audit-logs/{id}      → Détail log
GET    /api/v1/audit-logs/entity/{entity_type}/{entity_id} → Historique entité
```

### Rapports
```
GET    /api/v1/reports/balance-sheet      → Bilan à date
GET    /api/v1/reports/income-statement   → Compte de résultat période
GET    /api/v1/reports/trial-balance      → Balance générale
GET    /api/v1/reports/general-ledger     → Grand livre
GET    /api/v1/reports/cash-flow          → Tableau de flux de trésorerie
GET    /api/v1/reports/aged-receivables   → Balance âgée clients
GET    /api/v1/reports/aged-payables      → Balance âgée fournisseurs
```

## 7. Bonnes Pratiques de Structure

### Conventions de Nommage

| Élément | Convention | Exemple |
|---------|------------|---------|
| Fichiers Python | snake_case | `user_service.py`, `account_repo.py` |
| Classes Python | PascalCase | `UserService`, `AccountRepository` |
| Fonctions/Variables Python | snake_case | `get_user_by_email`, `account_balance` |
| Constantes Python | UPPER_SNAKE | `MAX_TRANSACTION_AMOUNT` |
| Fichiers TypeScript | kebab-case | `transaction-form.tsx`, `use-accounts.ts` |
| Composants React | PascalCase | `TransactionForm`, `DataTable` |
| Hooks TypeScript | camelCase + use | `useAccounts`, `useDebounce` |
| Types/Interfaces | PascalCase | `Transaction`, `InvoiceCreate` |
| Variables TypeScript | camelCase | `accountBalance`, `isLoading` |
| Tables DB | snake_case pluriel | `transactions`, `invoice_lines` |
| Colonnes DB | snake_case | `created_at`, `account_id` |
| Clés primaires | `id` (UUID) | `id UUID PRIMARY KEY` |
| Clés étrangères | `{table}_id` | `organization_id` |
| Index | `idx_{table}_{col}` | `idx_transactions_account_date` |

### Architecture Feature-First (Recommandé)

```
backend/app/
├── features/                    # Par domaine métier
│   ├── auth/
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── service.py
│   │   ├── repository.py
│   │   └── router.py
│   ├── accounting/
│   │   ├── accounts/
│   │   ├── transactions/
│   │   └── reports/
│   ├── invoicing/
│   │   ├── invoices/
│   │   └── taxes/
│   └── organizations/
│       ├── models.py
│       ├── service.py
│       └── router.py
├── core/                        # Transverse (security, config, db)
└── shared/                      # Commun (base models, exceptions)
```

**Avantages feature-first :**
- Cohésion forte : tout ce qui concerne "invoicing" est ensemble
- Isolation : modification factures n'impacte pas transactions
- Scalabilité : équipes peuvent travailler sur features séparées
- Tests : tests groupés par feature

### Architecture Layer-First (Actuelle - Simplicité)

```
backend/app/
├── models/      # Tous modèles
├── schemas/     # Tous schémas
├── services/    # Tous services
├── repositories/# Tous repositories
└── api/         # Tous endpoints
```

**Quand migrer vers feature-first :**
- Équipe > 5 devs
- > 20 endpoints
- Domaines métier peu couplés

### Principes SOLID Appliqués

1. **Single Responsibility** : Un service = un domaine (ex: `TransactionService` ne gère que transactions)
2. **Open/Closed** : Repository base class + héritage pour nouveaux types
3. **Liskov Substitution** : `BaseRepository` interface respectée par tous repos
4. **Interface Segregation** : `ReadOnlyRepository` vs `WriteRepository` si besoin
5. **Dependency Inversion** : Services dépendent d'abstractions (protocols), pas implémentations

### Patterns Recommandés

- **Repository Pattern** : Abstraction DB, testable avec mocks
- **Service Layer** : Logique métier centralisée, réutilisable
- **Dependency Injection** : FastAPI `Depends` pour DB, auth, services
- **Pydantic Models** : Validation entrée/sortie, documentation auto (OpenAPI)
- **Alembic Migrations** : Versioning DB, revue de code sur migrations
- **Feature Flags** : Pour déploiements progressifs (launchdarkly ou custom)
- **Idempotency Keys** : Sur POST critiques (factures, paiements)
- **Optimistic Locking** : `version` column sur entités modifiées souvent