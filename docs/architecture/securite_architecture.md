# Sécurité et Architecture

## 1. Architecture Globale
- **Type** : Monolithe modulaire (plus simple à déployer, scalable horizontalement)
- **Communication** : API REST + WebSocket pour temps réel
- **Components** : Backend (FastAPI), Frontend (Next.js), PostgreSQL, Redis, Worker (tâches asynchrones)

## 2. Authentification

### 2.1 JWT
- Algorithme RS256 (asymétrique)
- Access token : 15 min
- Refresh token : 7 jours, rotation à chaque utilisation
- Stockage : HttpOnly cookies (Secure, SameSite=Strict)

### 2.2 OAuth2
- Google, Microsoft, Apple, GitHub
- Scope limités (openid, email, profile)
- State parameter pour CSRF

### 2.3 2FA/MFA
- TOTP (Google Authenticator, Authy)
- SMS (fallback)
- WebAuthn/FIDO2 (clés de sécurité)
- Obligatoire pour les rôles sensibles (Admin, Comptable)

## 3. RBAC
| Rôle | Permissions |
|------|-------------|
| SuperAdmin | Tous droits |
| Admin | Gestion utilisateurs, paramètres |
| Comptable | Toutes les écritures, liasses |
| Commercial | Devis, factures, clients |
| Employé | Notes de frais |
| Client | Portail client (lecture)

## 4. Chiffrement
- **AES-256** : Données sensibles en base (tokens, SIRET, coordonnées bancaires)
- **TLS 1.3** : Transit
- **Clés** : Variables d'environnement, rotation automatique
- **Fichiers** : Chiffrement côté client avant upload

## 5. Prévention des Failles
- **SQLi** : ORM SQLAlchemy, parameterized queries
- **XSS** : CSP, échappement automatique (React)
- **CSRF** : Tokens, SameSite cookies
- **IDOR** : UUIDs, vérification ownership à chaque requête
- **Rate limiting** : Redis + slowapi
- **Validation** : Pydantic (backend), Zod (frontend)

## 6. Audit Logging
- Événements : login, création/édition/suppression, exports, paiements
- Stockage : table append-only + export journalier
- Rétention : 10 ans (conformité fiscale)
- Champs : timestamp, user_id, action, resource, IP, user_agent

## 7. Infrastructure Security
- **Docker** : images non-root, seccomp, capabilities réduites
- **Network** : VPC, firewalls, pas de ports exposés inutilement
- **Secrets** : variables d'environnement, jamais en code source

## 8. Tests de Sécurité
- SAST : Bandit (Python), Semgrep, npm audit
- SCA : Safety, pip-audit
- DAST : OWASP ZAP (CI)
- Pen testing : externe annuel

## 9. Conformité
- **RGPD** : DPO, DPIA, droits utilisateurs (droit à l'oubli, portabilité)
- **SOC2** : Type II
- **ISO 27001** : certification cible

## 10. PRA (Plan de Reprise d'Activité)
- Backup : journalier (base + fichiers), rétention 30 jours
- RTO : 4h, RPO : 1h
- Recovery : scripts automatisés, testé mensuellement