# Application Comptable

Application de gestion comptable complète construite avec une architecture moderne et scalable.

## Stack Technique

- **Backend**: FastAPI (Python 3.11+) avec SQLAlchemy 2.0, Alembic, Pydantic v2
- **Frontend**: Next.js 14 (App Router) avec TypeScript, Tailwind CSS
- **Base de données**: PostgreSQL 16 avec extensions pg_trgm, pgcrypto, uuid-ossp
- **Cache/Queue**: Redis 7
- **Stockage fichiers**: MinIO (S3 compatible)
- **Reverse Proxy**: Nginx avec TLS 1.2/1.3
- **Monitoring**: Prometheus, Grafana, Alertmanager
- **Email**: MailHog (dev), SMTP (prod)
- **CI/CD**: GitHub Actions
- **Containerisation**: Docker, Docker Compose

## Démarrage Rapide

### Prérequis

- Docker 24+
- Docker Compose 2.20+
- Make (optionnel)

### Installation

```bash
# Cloner le repository
git clone <repository-url>
cd Application_Comptable

# Copier le fichier d'environnement
cp .env.example .env

# Modifier .env avec vos valeurs
# Au minimum: SECRET_KEY, POSTGRES_PASSWORD, REDIS_PASSWORD

# Démarrer l'environnement de développement
make dev

# Ou directement avec Docker Compose
docker compose up -d
```

### Accès aux services

| Service | URL | Identifiants |
|---------|-----|--------------|
| Frontend | http://localhost:3000 | - |
| Backend API | http://localhost:8000 | - |
| API Docs | http://localhost:8000/docs | - |
| MailHog | http://localhost:8025 | - |
| pgAdmin | http://localhost:5050 | admin@example.com / admin |
| MinIO Console | http://localhost:9001 | minioadmin / minioadmin |

## Commandes Disponibles

```bash
# Développement
make dev              # Démarre l'environnement de dev
make dev-logs         # Affiche les logs en temps réel
make dev-down         # Arrête l'environnement de dev

# Build
make build            # Build toutes les images Docker
make build-backend    # Build uniquement le backend
make build-frontend   # Build uniquement le frontend

# Tests
make test             # Lance tous les tests
make test-backend     # Tests backend uniquement
make test-frontend    # Tests frontend uniquement
make test-coverage    # Tests avec couverture

# Qualité de code
make lint             # Lance tous les linters
make lint-backend     # Ruff + MyPy
make lint-frontend    # ESLint + TypeScript check

# Base de données
make db-migrate       # Applique les migrations Alembic
make db-migrate-create MSG="message"  # Crée une nouvelle migration
make db-reset         # Reset complet de la DB (ATTENTION: perte de données)
make db-seed          # Insère les données de test
make db-backup        # Sauvegarde de la DB
make db-restore FILE=backup.sql.gz    # Restaure une sauvegarde

# Déploiement
make deploy ENV=prod  # Déploie en production
make deploy ENV=staging # Déploie en staging

# Utilitaires
make logs             # Affiche les logs de tous les services
make logs-backend     # Logs backend uniquement
make logs-frontend    # Logs frontend uniquement
make clean            # Nettoie les volumes et images Docker
make clean-all        # Nettoyage complet (volumes, images, cache)
```

## Variables d'Environnement

Copiez `.env.example` vers `.env` et configurez :

### Obligatoires
- `SECRET_KEY` - Clé secrète pour JWT (générer avec `openssl rand -hex 32`)
- `POSTGRES_PASSWORD` - Mot de passe PostgreSQL
- `REDIS_PASSWORD` - Mot de passe Redis

### Optionnelles
- `POSTGRES_USER` / `POSTGRES_DB` - Utilisateur/DB PostgreSQL (défaut: app_user / app_db)
- `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD` - Credentials MinIO
- `PGADMIN_EMAIL` / `PGADMIN_PASSWORD` - Accès pgAdmin
- `GRAFANA_ADMIN_PASSWORD` - Mot de passe Grafana
- `DEBUG` - Mode debug (true/false)
- `ENVIRONMENT` - development/staging/production

## Architecture

Voir [docs/architecture.md](docs/architecture.md) pour le détail de l'architecture.

```
├── backend/                 # API FastAPI
│   ├── app/
│   │   ├── api/            # Routes API
│   │   ├── core/           # Config, sécurité
│   │   ├── models/         # Modèles SQLAlchemy
│   │   ├── schemas/        # Schémas Pydantic
│   │   ├── services/       # Logique métier
│   │   └── repositories/   # Accès données
│   └── tests/
├── frontend/               # App Next.js
│   ├── src/
│   │   ├── app/            # Pages (App Router)
│   │   ├── components/     # Composants React
│   │   ├── lib/            # Utilitaires, API client
│   │   └── styles/         # Styles globaux
│   └── tests/
├── infra/                  # Infrastructure
│   ├── docker/             # Docker Compose, Dockerfiles
│   │   ├── nginx/          # Config Nginx
│   │   ├── postgres/       # Scripts d'init DB
│   │   └── redis/          # Config Redis
│   ├── scripts/            # Scripts de déploiement/backup
│   └── monitoring/         # Prometheus, Grafana, Alertmanager
├── docs/                   # Documentation
└── .github/                # Workflows CI/CD
```

## Déploiement

### Production

```bash
# Configuration
cp .env.example .env.prod
# Éditer .env.prod avec les valeurs de production

# Déploiement zero-downtime
./infra/scripts/deploy.sh prod
```

### Staging

```bash
cp .env.example .env.staging
# Éditer .env.staging
./infra/scripts/deploy.sh staging
```

## Monitoring

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin / GRAFANA_ADMIN_PASSWORD)
- **Alertmanager**: http://localhost:9093

## Sécurité

- Rate limiting: API 10 req/s, Login 5 req/min
- TLS 1.2/1.3 uniquement
- Headers de sécurité (HSTS, CSP, etc.)
- Scan de sécurité hebdomadaire (OWASP ZAP, Semgrep, Trivy)
- Dépendabot pour mises à jour automatiques

## Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/ma-fonctionnalite`)
3. Commit les changements (`git commit -am 'Ajout fonctionnalité'`)
4. Push la branche (`git push origin feature/ma-fonctionnalite`)
5. Créer une Pull Request

Voir [CONTRIBUTING.md](CONTRIBUTING.md) pour les détails.

## Licence

Propriétaire - Tous droits réservés.