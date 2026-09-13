# Module Conformité Fiscale & Sociale

## 1. Vue d'overview

**Objectifs :**
- Automatiser la déclaration fiscale et sociale
- Garantir la conformité réglementaire en temps réel
- Réduire les erreurs manuelles et les pénalités

**Enjeux réglementaires :**
- Respect des délais de déclaration (TVA, liasse fiscale, FEC)
- Conformité NF525 / loi de confiance économique (signature électronique)
- Conservation légale des documents (10 ans)

**Bénéfices :**
- Réduction du temps de closing de 60 à 80 %
- Zéro pénalité de retard grâce aux rappels automatisés
- Traçabilité complète des opérations fiscales

---

## 2. Génération automatique des liasses TVA

- **Calcul TVA collectée/déductible** : agrégation automatique des lignes comptables taguées `tax:TVA` avec décomposition par taux et par régime (normal, simplifié, réel simplifié)
- **Pré-remplissage déclarations** : import des écritures depuis le plan comptable → mapping automatique sur les cases CA3~CA12
- **Fréquence** : mensuelle (collectivités, grandes entreprises) / trimestrielle (PME régime simplifié) — configurable par entité
- **Gestion des taux multiples** : taux standard (20 %), intermédiaires (10 %, 5,5 %, 2,1 %), taux spécifiques (export, intracommunautaire)
- **Formats d'export** :
  - **XML** — format standard des administrations fiscales (format SIE pour TVA)
  - **JSON** — intégration API avec plateformes de déclaration en ligne
  - **CSV** — import dans logiciels tiers / analyse Excel

---

## 3. Bilan et Compte de Résultat

- **Structure comptable** : plan comptable général PCG (Plan Comptable Général) avec classes 1 à 9, support du PCE (Plan Comptable Européen) pour filiales
- **Génération en un clic** : agrégation des soldes depuis `AccountBalances` → consolidation multi-entités → rendu PDF/Excel/XBRL
- **Formats d'export** :
  - **PDF** : états financiers signés numériquement (norme PDF/A)
  - **Excel** : liasse avec formules liées et tableaux de bord
  - **XBRL** : taxonomie EFMD (Europe) / US-GAAP (international) pour dépôts électroniques
- **Normalisation IFRS vs GAAP local** : moteur de mapping avec règles de conversion (différences d'évaluation, provisions, actifs incorporels)

---

## 4. Export FEC (Fichier des Écritures Comptables)

- **Format standard** : CSV tabulé selon norme FEC (arrêté du 24/08/2011) : colonnes `Libellé, Date, Montant, Compte, Classe, NuméroPièce, Journal`
- **Intégration logicielle** :
  - **Cegid** : import natif via `FEC_YYYYMMDD.csv`
  - **Sage** : mapping des journaux Sage (journal 1~10) vers le FEC
  - **QuickBooks** : export QBO → transformation FEC via script de mapping
- **Sécurisation** :
  - **Hash SHA-256** : empreinte du fichier FEC stockée en base et dans l'AuditLog
  - **Signature électronique** : signature PKCS#7 (norme NF525) avec certificat RGS
  - **Contrôle d'intégrité** : vérification automatique à l'import côté récepteur

---

## 5. Piste d'audit

- **Journalisation immuable** :
  - `horodatage` : timestamp UTC nanoseconde, non modifiable
  - `utilisateur` : identifiant authentifié + rôle
  - `modification` : ancienne valeur → nouvelle valeur (diff structuré)
  - `IP` : adresse source de la requête
- **Stockage** :
  - Table `AuditLogs` en append-only (DELETE/UPDATE interdits par trigger DB)
  - **Blockchain optionnelle** : ancres trimestrielles des hashes sur Ethereum/Rivest (preuve d'existence externalisée)
- **Conservation** : 10 ans minimum (art. A. 102 B-2 LMN), archivage automatique vers stockage froid après 5 ans
- **Export auditeurs** : génération sélective par période, entité, type d'opération — format CSV/PDF signé

---

## 6. Schéma de données

| Table | Description |
|---|---|
| `TaxDeclarations` | Déclarations TVA/IS/IR : période, entité, statut, JSON données, signature |
| `FinancialStatements` | Bilan, CG, RESULTAT : type, exercice, devise, format (IFRS/local), fichier export |
| `FECExports` | Fichiers FEC générés : hash, signature, date, entité, format |
| `AuditLogs` | Journal immuable : timestamp, utilisateur, action, entité, ancien/nouveau, IP |
| `ChartOfAccounts` | Plan comptable : code, libellé, classe, parent, norme (PCG/IFRS), actif/passif |
| `AccountBalances` | Soldes comptables : compte, période, débit, crédit, solde, devise, devis consolidé |

---

## 7. Endpoints API nécessaires

| Méthode | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/tax/declarations` | Créer une déclaration fiscale |
| `GET` | `/api/v1/tax/declarations/{id}` | Récupérer une déclaration |
| `POST` | `/api/v1/tax/declarations/{id}/generate` | Générer la liasse TVA |
| `POST` | `/api/v1/tax/declarations/{id}/export` | Exporter (XML/JSON/CSV) |
| `POST` | `/api/v1/financials/generate` | Générer bilan + compte de résultat |
| `GET` | `/api/v1/financials/{id}/export` | Exporter (PDF/Excel/XBRL) |
| `POST` | `/api/v1/fec/export` | Générer et signer un FEC |
| `POST` | `/api/v1/fec/verify` | Vérifier intégrité d'un FEC (hash) |
| `GET` | `/api/v1/audit/logs` | Lister les logs d'audit (filtres) |
| `POST` | `/api/v1/audit/export` | Exporter logs pour auditeur |
| `POST` | `/api/v1/chart-of-accounts/sync` | Synchroniser le plan comptable |
| `GET` | `/api/v1/balances/{account}/{period}` | Solde d'un compte sur une période |
| `POST` | `/api/v1/calendar/fiscal` | Configurer le calendrier fiscal |
| `GET` | `/api/v1/multi-country/tax-rates` | Liste des taux par pays et type de taxe |
| `POST` | `/api/v1/entities/{id}/consolidate` | Consolidation multi-entités |

---

## 8. Gestion multi-pays et multi-juridictions

- **TVA FR** : CA3~CA12, tiers déclarant, exonération intracommunautaire (art. 257 bis BNC)
- **TVA DE** : USt-VA (Umsatzsteuer-Voranmeldung), taux 19 % / 7 %, Kleinunternehmerregelung (§ 19 UStG)
- **GST CA** (Canada) : GST/HST (5 %~15 % selon province), déclaration RC1
- **Framework** :
  - Moteur de règles paramétrable par pays (`TaxRuleSet`) : taux, seuils, régimes, fréquences
  - Détection automatique de la juridiction par NIF/siège social
  - Conversion multidevise avec cours ECB en temps réel
  - Conformité locale : facturation obligatoire, mentions légales, seuils de dispense

---

## 9. Calendrier fiscal

- **Échéances automatiques** : calcul dynamique selon le régime fiscal de l'entité (mensuel J25, trimestriel J20 du mois suivant, annuel le 15/05 pour liasse)
- **Rappels** :
  - Notification 14 jours avant échéance (email + in-app)
  - Notification 48h avant (urgent)
  - Notification post-échéance (alerte pénalité)
- **Planification** : cron intégré pour génération automatique des déclarations à J-3
- **Table `FiscalCalendars`** : pays, type d'échéance, date fixe/relative, jours ouvrés à ajouter

---

## 10. Métriques de succès

| Métrique | Cible | Mode de calcul |
|---|---|---|
| Taux de conformité | ≥ 99,5 % | Déclarations sans erreur rejet / total |
| Temps de génération liasse TVA | ≤ 30 s | Latence endpoint `/generate` p95 |
| Temps de génération bilan-CR | ≤ 1 min | Latence endpoint `/financials/generate` p95 |
| Taux d'erreur FEC | ≤ 0,1 % | FEC rejetés par logiciel cible / total |
| Temps moyen closing | ≤ 3 jours | Du dernier jour comptable à validation finale |
| Taux de rappel respecté | ≥ 98 % | Échéances respectées / total rappels envoyés |
| Disponibilité plateforme | ≥ 99,9 % | Uptime mensuel surveillé |
| Pénalités de retard | 0 | Nombre de pénalités appliquées / mois |
