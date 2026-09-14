# Module de Saisie et Automatisation (L'anti-tableur)

## 1. Vue d'ensemble
- **Objectif** : Éliminer la saisie manuelle répétitive
- **Bénéfices** : Gain de temps de 80%, réduction des erreurs à <1%
- **Cas d'usage** : Upload de reçus, synchronisation bancaire, catégorisation automatique

## 2. OCR Intégré

### 2.1 Architecture
```
Upload → Preprocessing → OCR Engine → Extraction → Validation → Stockage
```

### 2.2 Fournisseurs comparés
| Solution | Coût | Précision | Vitesse | Offline |
|----------|------|-----------|---------|---------|
| Tesseract (open source) | Gratuit | 75-85% | Rapide | Oui |
| Google Vision API | Payant | 90-95% | Très rapide | Non |
| Azure Computer Vision | Payant | 88-93% | Rapide | Non |
| AWS Textract | Payant | 92-97% | Rapide | Non |

### 2.3 Champs à extraire
- Fournisseur (nom)
- Date de transaction
- Montant HT
- Montant TTC
- Taux de TVA
- Numéro de facture

### 2.4 Flow de traitement
1. Upload du document (image ou PDF)
2. Preprocessing (rotation, netoyage, redimensionnement)
3. OCR avec détection de zone
4. Extraction des champs par regex + NER
5. Validation croisée (TTC = HT × (1 + TVA))
6. Stockage en base avec statut "à valider"

## 3. Open Banking

### 3.1 APIs tierces
- **Plaid** : couverture US/CA, bon pour le démarrage
- **Tink** : couverture européenne excellente
- **Yodlee** : grande couverture globale

### 3.2 Flux de synchronisation
```
Utilisateur → Authentification bancaire → Consentement → Accounts → Transactions
```

### 3.3 Gestion des tokens
- Access token (1h validity)
- Refresh token (long-lived)
- Stockage chiffré en base
- Rotation automatique

## 4. Smart Categorization (ML)

### 4.1 Approche hybride
- **Règles heuristiques** : 60% des cas (mots-clés, montants types)
- **ML supervisé** : 40% restant (Random Forest / XGBoost)

### 4.2 Features d'entrée
- Libellé de la transaction
- Montant
- Date (jour de semaine, mois)
- Fournisseur (identifié)
- Canaux (CB, virement, prélèvement)

### 4.3 Modèle recommandé
- **Random Forest** (robuste, interprétable)
- Entraînement sur données historiques étiquetées
- Feedback loop : correction-utilisateur → réentraînement

## 5. Schéma technique (flux de données)
```
[Utilisateur] → [OCR/Upload] → [Backend API] → [ML Engine] → [Base de données]
                                                    ↓
                                         [Bank Sync] → [Open Banking API]
```

## 6. Endpoints API nécessaires
- `POST /api/v1/ocr/upload` - Upload et OCR
- `GET /api/v1/ocr/jobs` - Liste des jobs OCR
- `POST /api/v1/banking/connect` - Connexion bancaire
- `GET /api/v1/banking/accounts` - Comptes connectés
- `POST /api/v1/banking/sync` - Synchronisation
- `POST /api/v1/transactions/categorize` - Catégorisation

## 7. Modèles de données

### OCRJobs
- id, document_url, status, extracted_data, confidence_score, created_at

### BankConnections
- id, user_id, provider, access_token_encrypted, refresh_token_encrypted, status, last_sync

### Transactions
- id, account_id, date, amount, label, category_id, merchant_name, source (ocr/bank), confidence

## 8. Stratégies de fallback
- OCR échoué → saisie manuelle
- Catégorisation incertaine → demande à l'utilisateur
- Sync bancaire échoué → retry exponentiel (3 tentatives)

## 9. Métriques de succès
- Taux de reconnaissance OCR > 90%
- Taux de catégorisation automatique > 75%
- Temps de traitement OCR < 5 secondes
- Taux d'erreur de sync < 2%