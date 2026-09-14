# Backend — Modèles SQLAlchemy (Partie 1)

Ce document décrit les modèles de données de l'application, définis avec SQLAlchemy. Les modèles présentés ici couvrent les entités fondamentales de l'application : utilisateurs, organisations, catégories de comptes et plan comptable.

## Contexte

L'application utilise une architecture multi-tenant avec séparation par organisation. Chaque modèle est hérité d'une classe de base commune (`Base`) qui gère les métadonnées de table (nom de table, clé primaire, timestamps) de manière cohérente.

## Modèles

### User

Représente un utilisateur de l'application.

- **Table** : `users`
- **Colonnes** :
  - `id` : entier, clé primaire, auto-incrémentée
  - `email` : texte, unique, non nul, indexé
  - `password_hash` : texte, non nul (stockage haché)
  - `first_name` : texte, optionnel
  - `last_name` : texte, optionnel
  - `is_active` : booléen, défaut `True`
  - `is_verified` : booléen, défaut `False`
  - `created_at` : horodatage, défaut `now`
  - `updated_at` : horodatage, mis à jour automatiquement
- **Relations** :
  - `organizations` : relation many-to-many vers `Organization` via `UserOrganization`
  - `owned_organizations` : relation one-to-many vers `Organization` (créateur)
  - `accounts` : relation one-to-many vers `Account` (propriétaire)

### Organization

Représente une organisation (tenant) du système.

- **Table** : `organizations`
- **Colonnes** :
  - `id` : entier, clé primaire, auto-incrémentée
  - `name` : texte, non nul
  - `slug` : texte, unique, non nul, indexé (identifiant URL)
  - `created_at` : horodatage, défaut `now`
  - `updated_at` : horodatage, mis à jour automatiquement
- **Relations** :
  - `users` : relation many-to-many vers `User` via `UserOrganization`
  - `owner` : relation many-to-one vers `User` (créateur)
  - `accounts` : relation one-to-many vers `Account`

### UserOrganization

Table d'association entre `User` et `Organization`. Elle stocke le rôle de l'utilisateur au sein de l'organisation.

- **Table** : `user_organizations`
- **Colonnes** :
  - `id` : entier, clé primaire, auto-incrémentée
  - `user_id` : entier, clé étrangère vers `users`, non nul, indexé
  - `organization_id` : entier, clé étrangère vers `organizations`, non nul, indexé
  - `role` : texte, non nul, défaut `'member'` (valeurs possibles : `owner`, `admin`, `member`)
  - `created_at` : horodatage, défaut `now`
- **Contraintes** :
  - Contrainte unique sur `(user_id, organization_id)` pour éviter les doublons

### AccountCategory

Catégorie de compte utilisée pour classer les comptes du plan comptable (ex. : Actif, Passif, Charges, Produits).

- **Table** : `account_categories`
- **Colonnes** :
  - `id` : entier, clé primaire, auto-incrémentée
  - `name` : texte, non nul, unique
  - `code` : texte, non nul, unique (ex. : `ACT`, `PAS`, `CHG`, `PROD`)
  - `type` : texte, non nul (ex. : `asset`, `liability`, `expense`, `revenue`)
  - `description` : texte, optionnel
  - `created_at` : horodatage, défaut `now`
- **Relations** :
  - `accounts` : relation one-to-many vers `Account`

### ChartOfAccount

Représente le plan comptable d'une organisation. Il contient la liste des comptes comptables avec leur numéro, leur nom, leur catégorie et leur nature.

- **Table** : `chart_of_accounts`
- **Colonnes** :
  - `id` : entier, clé primaire, auto-incrémentée
  - `organization_id` : entier, clé étrangère vers `organizations`, non nul, indexé
  - `account_number` : texte, non nul (ex. : `411`, `601`)
  - `name` : texte, non nul
  - `category_id` : entier, clé étrangère vers `account_categories`, non nul
  - `type` : texte, non nul (ex. : `asset`, `liability`, `expense`, `revenue`)
  - `parent_id` : entier, clé étrangère vers `chart_of_accounts`, optionnel (hiérarchie)
  - `is_active` : booléen, défaut `True`
  - `created_at` : horodatage, défaut `now`
  - `updated_at` : horodatage, mis à jour automatiquement
- **Relations** :
  - `organization` : relation many-to-one vers `Organization`
  - `category` : relation many-to-one vers `AccountCategory`
  - `parent` : relation many-to-one vers `ChartOfAccount` (auto-référence)
  - `children` : relation one-to-many vers `ChartOfAccount` (comptes enfants)
- **Contraintes** :
  - Contrainte unique sur `(organization_id, account_number)` pour éviter les doublons au sein d'une organisation

## Relations globales

```
User (1) ──< UserOrganization >── (1) Organization
            │
            │ (owner)
            │
Organization (1) ──< ChartOfAccount >── (1) AccountCategory
                              │
                              │ (parent)
                              │
                            ChartOfAccount (auto-référence)
```

## Notes techniques

- Tous les modèles héritent d'une classe `Base` commune qui définit `id`, `created_at` et `updated_at`.
- Les clés étrangères sont indexées pour optimiser les jointures.
- Les relations sont définies avec `back_populates` pour une navigation bidirectionnelle.
- Les timestamps sont gérés automatiquement par SQLAlchemy via des écouteurs d'événements (`event.listens_for` ou `default=func.now()`).