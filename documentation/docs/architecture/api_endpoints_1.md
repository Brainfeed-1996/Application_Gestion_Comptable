# API Endpoints

## Auth

### Login
- **Method:** POST
- **Path:** `/api/auth/login`
- **Description:** Authentifie un utilisateur avec email et mot de passe, retourne un token d'accès et de rafraîchissement.
- **Parameters:**
  | Name | Type | In | Required | Description |
  |------|------|----|----|----|
  | email | string | body | yes | Email de l'utilisateur |
  | password | string | body | yes | Mot de passe |

- **Responses:**
  - `200 OK` — Connexion réussie
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2g..."
  }
  ```
  - `400 Bad Request` — Données invalides
  ```json
  { "error": "Email and password are required" }
  ```
  - `401 Unauthorized` — Identifiants incorrects
  ```json
  { "error": "Invalid credentials" }
  ```

---

### Register
- **Method:** POST
- **Path:** `/api/auth/register`
- **Description:** Crée un nouveau compte utilisateur.
- **Parameters:**
  | Name | Type | In | Required | Description |
  |------|------|----|----|----|
  | email | string | body | yes | Email |
  | password | string | body | yes | Mot de passe (>= 8 caractères) |
  | firstName | string | body | no | Prénom |
  | lastName | string | body | no | Nom |

- **Responses:**
  - `201 Created` — Compte créé
  ```json
  {
    "id": 12,
    "email": "user@example.com",
    "firstName": "Alice",
    "lastName": "Dupont"
  }
  ```
  - `400 Bad Request` — Validation échouée
  ```json
  { "error": "Password must be at least 8 characters" }
  ```
  - `409 Conflict` — Email déjà utilisé
  ```json
  { "error": "Email already registered" }
  ```

---

### Refresh Token
- **Method:** POST
- **Path:** `/api/auth/refresh`
- **Description:** Renouvelle le token d'accès avec un refresh token valide.
- **Parameters:**
  | Name | Type | In | Required | Description |
  |------|------|----|----|----|
  | refreshToken | string | body | yes | Token de rafraîchissement |

- **Responses:**
  - `200 OK` — Nouveau token
  ```json
  { "accessToken": "eyJhbGciOiJIUzI1NiIs..." }
  ```
  - `401 Unauthorized` — Refresh token invalide ou expiré
  ```json
  { "error": "Invalid or expired refresh token" }
  ```

---

### Two-Factor Authentication (2FA)
- **Method:** POST
- **Path:** `/api/auth/2fa`
- **Description:** Valide un code 2FA pour finaliser la connexion ou activer la 2FA.
- **Parameters:**
  | Name | Type | In | Required | Description |
  |------|------|----|----|----|
  | code | string | body | yes | Code 2FA à 6 chiffres |
  | enable | boolean | body | no | Activer ou désactiver la 2FA |
  | secretKey | string | body | no | Clé secrète TOTP (première activation) |

- **Responses:**
  - `200 OK` — 2FA validée / activée
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2g...",
    "twoFactorEnabled": true
  }
  ```
  - `400 Bad Request` — Code invalide
  ```json
  { "error": "Invalid 2FA code" }
  ```

---

### OAuth Callback
- **Method:** GET
- **Path:** `/api/auth/oauth/callback`
- **Description:** Gère le callback OAuth (Google, GitHub, etc.) après autorisation.
- **Parameters:**
  | Name | Type | In | Required | Description |
  |------|------|----|----|----|
  | provider | string | query | yes | Fournisseur OAuth (google, github) |
  | code | string | query | yes | Code d'autorisation |
  | state | string | query | yes | Token d'état pour CSRF |

- **Responses:**
  - `200 OK` — Authentification OAuth réussie
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2g...",
    "user": { "id": 12, "email": "user@example.com" }
  }
  ```
  - `400 Bad Request` — Réponse OAuth invalide
  ```json
  { "error": "Invalid OAuth response" }
  ```

---

### Logout
- **Method:** POST
- **Path:** `/api/auth/logout`
- **Description:** Invalide les tokens de l'utilisateur (token mis sur liste noire côté serveur).
- **Parameters:**
  | Name | Type | In | Required | Description |
  |------|------|----|----|----|
  | refreshToken | string | body | yes | Token à invalider |

- **Responses:**
  - `204 No Content` — Déconnexion réussie
  - `401 Unauthorized` — Token invalide
  ```json
  { "error": "Invalid token" }
  ```

## Users

### Create User
- **Method:** POST
- **Path:** `/api/users`
- **Description:** Crée un nouvel utilisateur (admin ou self-service).
- **Parameters:**
  | Name | Type | In | Required | Description |
  |------|------|----|----|----|
  | email | string | body | yes | Email |
  | firstName | string | body | yes | Prénom |
  | lastName | string | body | yes | Nom |
  | role | string | body | no | Rôle (user, admin, manager) |
  | organizationId | integer | body | no | Organisation associée |

- **Responses:**
  - `201 Created` — Utilisateur créé
  ```json
  {
    "id": 12,
    "email": "user@example.com",
    "firstName": "Alice",
    "lastName": "Dupont",
    "role": "user",
    "createdAt": "2026-09-13T04:30:00Z"
  }
  ```
  - `400 Bad Request` — Données invalides
  ```json
  { "error": "firstName is required" }
  ```
  - `409 Conflict` — Email déjà utilisé
  ```json
  { "error": "Email already registered" }
  ```

---

### Get All Users
- **Method:** GET
- **Path:** `/api/users`
- **Description:** Retourne la liste paginée des utilisateurs.
- **Parameters:**
  | Name | Type | In | Required | Description |
  |------|------|----|----|----|
  | page | integer | query | no | Page (défaut: 1) |
  | limit | integer | query | no | Nombre par page (défaut: 20) |
  | search | string | query | no | Recherche par nom/email |
  | organizationId | integer | query | no | Filtrer par organisation |

- **Responses:**
  - `200 OK` — Liste paginée
  ```json
  {
    "data": [
      { "id": 12, "email": "user@example.com", "firstName": "Alice" }
    ],
    "meta": {
      "page": 1,
      "limit": 20,
      "total": 42,
      "totalPages": 3
    }
  }
  ```

---

### Get User by ID
- **Method:** GET
- **Path:** `/api/users/{id}`
- **Description:** Retourne les détails d'un utilisateur spécifique.
- **Parameters:**
  | Name | Type | In | Required | Description |
  |------|------|----|----|----|
  | id | integer | path | yes | ID de l'utilisateur |

- **Responses:**
  - `200 OK` — Détails utilisateur
  ```json
  {
    "id": 12,
    "email": "user@example.com",
    "firstName": "Alice",
    "lastName": "Dupont",
    "role": "user",
    "organizationId": 5,
    "createdAt": "2026-09-13T04:30:00Z",
    "updatedAt": "2026-09-13T04:35:00Z"
  }
  ```
  - `404 Not Found` — Utilisateur introuvable
  ```json
  { "error": "User not found" }
  ```

---

### Update User
- **Method:** PUT
- **Path:** `/api/users/{id}`
- **Description:** Met à jour les informations d'un utilisateur.
- **Parameters:**
  | Name | Type | In | Required | Description |
  |------|------|----|----|----|
  | id | integer | path | yes | ID de l'utilisateur |
  | firstName | string | body | no | Prénom |
  | lastName | string | body | no | Nom |
  | role | string | body | no | Rôle |

- **Responses:**
  - `200 OK` — Utilisateur mis à jour
  ```json
  {
    "id": 12,
    "email": "user@example.com",
    "firstName": "Alicia",
    "lastName": "Dupont",
    "role": "manager"
  }
  ```
  - `400 Bad Request` — Validation échouée
  ```json
  { "error": "Invalid role" }
  ```
  - `404 Not Found` — Utilisateur introuvable
  ```json
  { "error": "User not found" }
  ```

---

### Delete User
- **Method:** DELETE
- **Path:** `/api/users/{id}`
- **Description:** Supprime un utilisateur.
- **Parameters:**
  | Name | Type | In | Required | Description |
  |------|------|----|----|----|
  | id | integer | path | yes | ID de l'utilisateur |

- **Responses:**
  - `204 No Content` — Supprimé
  - `404 Not Found` — Utilisateur introuvable
  ```json
  { "error": "User not found" }
  ```

---

### Get Current User (Me)
- **Method:** GET
- **Path:** `/api/users/me`
- **Description:** Retourne les informations de l'utilisateur authentifié.
- **Parameters:** Aucun (token requis dans `Authorization: Bearer <token>`)

- **Responses:**
  - `200 OK` — Profil de l'utilisateur courant
  ```json
  {
    "id": 12,
    "email": "user@example.com",
    "firstName": "Alice",
    "lastName": "Dupont",
    "role": "admin",
    "organizationId": 5
  }
  ```
  - `401 Unauthorized` — Non authentifié
  ```json
  { "error": "Unauthorized" }
  ```

---

### Update Current User (Me)
- **Method:** PATCH
- **Path:** `/api/users/me`
- **Description:** Met à jour les informations de l'utilisateur authentifié.
- **Parameters:**
  | Name | Type | In | Required | Description |
  |------|------|----|----|----|
  | firstName | string | body | no | Prénom |
  | lastName | string | body | no | Nom |
  | password | string | body | no | Nouveau mot de passe |

- **Responses:**
  - `200 OK` — Profil mis à jour
  ```json
  {
    "id": 12,
    "email": "user@example.com",
    "firstName": "Alice",
    "lastName": "Smith"
  }
  ```
  - `400 Bad Request` — Validation échouée
  ```json
  { "error": "Password must be at least 8 characters" }
  ```
  - `401 Unauthorized` — Non authentifié
  ```json
  { "error": "Unauthorized" }
  ```

## Organizations

### Create Organization
- **Method:** POST
- **Path:** `/api/organizations`
- **Description:** Crée une nouvelle organisation.
- **Parameters:**
  | Name | Type | In | Required | Description |
  |------|------|----|----|----|
  | name | string | body | yes | Nom de l'organisation |
  | domain | string | body | no | Domaine email (ex: acme.com) |
  | plan | string | body | no | Plan tarifaire (free, pro, enterprise) |

- **Responses:**
  - `201 Created` — Organisation créée
  ```json
  {
    "id": 5,
    "name": "Acme Corp",
    "domain": "acme.com",
    "plan": "pro",
    "createdAt": "2026-09-13T04:30:00Z"
  }
  ```
  - `400 Bad Request` — Données invalides
  ```json
  { "error": "name is required" }
  ```

---

### Get All Organizations
- **Method:** GET
- **Path:** `/api/organizations`
- **Description:** Retourne la liste des organisations (admin) ou les organisations de l'utilisateur.
- **Parameters:**
  | Name | Type | In | Required | Description |
  |------|------|----|----|----|
  | page | integer | query | no | Page (défaut: 1) |
  | limit | integer | query | no | Nombre par page (défaut: 20) |

- **Responses:**
  - `200 OK` — Liste paginée
  ```json
  {
    "data": [
      { "id": 5, "name": "Acme Corp", "plan": "pro" }
    ],
    "meta": { "page": 1, "limit": 20, "total": 3, "totalPages": 1 }
  }
  ```

---

### Get Organization by ID
- **Method:** GET
- **Path:** `/api/organizations/{id}`
- **Description:** Retourne les détails d'une organisation.
- **Parameters:**
  | Name | Type | In | Required | Description |
  |------|------|----|----|----|
  | id | integer | path | yes | ID de l'organisation |

- **Responses:**
  - `200 OK` — Détails organisation
  ```json
  {
    "id": 5,
    "name": "Acme Corp",
    "domain": "acme.com",
    "plan": "pro",
    "createdAt": "2026-09-13T04:30:00Z"
  }
  ```
  - `404 Not Found` — Organisation introuvable
  ```json
  { "error": "Organization not found" }
  ```

---

### Update Organization
- **Method:** PUT
- **Path:** `/api/organizations/{id}`
- **Description:** Met à jour les informations d'une organisation.
- **Parameters:**
  | Name | Type | In | Required | Description |
  |------|------|----|----|----|
  | id | integer | path | yes | ID de l'organisation |
  | name | string | body | no | Nouveau nom |
  | domain | string | body | no | Nouveau domaine |
  | plan | string | body | no | Nouveau plan |

- **Responses:**
  - `200 OK` — Organisation mise à jour
  ```json
  {
    "id": 5,
    "name": "Acme Corporation",
    "domain": "acme.com",
    "plan": "enterprise"
  }
  ```
  - `400 Bad Request` — Validation échouée
  ```json
  { "error": "Invalid plan" }
  ```
  - `404 Not Found` — Organisation introuvable
  ```json
  { "error": "Organization not found" }
  ```

---

### Delete Organization
- **Method:** DELETE
- **Path:** `/api/organizations/{id}`
- **Description:** Supprime une organisation et ses ressources associées.
- **Parameters:**
  | Name | Type | In | Required | Description |
  |------|------|----|----|----|
  | id | integer | path | yes | ID de l'organisation |

- **Responses:**
  - `204 No Content` — Supprimée
  - `404 Not Found` — Organisation introuvable
  ```json
  { "error": "Organization not found" }
  ```

---

### Invite User to Organization
- **Method:** POST
- **Path:** `/api/organizations/{id}/invite`
- **Description:** Envoie une invitation à un utilisateur pour rejoindre l'organisation.
- **Parameters:**
  | Name | Type | In | Required | Description |
  |------|------|----|----|----|
  | id | integer | path | yes | ID de l'organisation |
  | email | string | body | yes | Email de l'invité |
  | role | string | body | no | Rôle dans l'organisation (user, admin) |

- **Responses:**
  - `201 Created` — Invitation envoyée
  ```json
  {
    "id": 99,
    "email": "invitee@example.com",
    "role": "user",
    "organizationId": 5,
    "token": "invite-token-uuid",
    "expiresAt": "2026-09-20T04:30:00Z",
    "status": "pending"
  }
  ```
  - `400 Bad Request` — Email invalide
  ```json
  { "error": "Email is required" }
  ```
  - `404 Not Found` — Organisation introuvable
  ```json
  { "error": "Organization not found" }
  ```
