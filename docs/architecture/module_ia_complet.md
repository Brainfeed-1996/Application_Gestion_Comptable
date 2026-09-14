# Module IA - Conception Complète

> Document de conception technique pour le module Intelligence Artificielle de l'application comptable.
> Version : 1.0 | Date : 2026-09-13 | Auteur : Équipe Architecture

---

# Table des matières

1. [Architecture IA globale](#1-architecture-ia-globale)
2. [Service OCR](#2-service-ocr)
3. [Service de catégorisation ML](#3-service-de-catégorisation-ml)
4. [Service de prédiction de trésorerie](#4-service-de-prédiction-de-trésorerie)
5. [Service de détection d'anomalies](#5-service-de-détection-d-anomalies)
6. [Infrastructure](#6-infrastructure)
7. [API Endpoints](#7-api-endpoints)
8. [Stratégie de déploiement](#8-stratégie-de-déploiement)

---

# 1. Architecture IA globale

## 1.1 Principes directeurs

Le module IA est conçu selon une architecture **microservices-based** où chaque service IA est indépendant, déployable et scalable séparément. Les services communiquent entre eux via **API REST** pour les requêtes synchrones et **message queue** (RabbitMQ / Kafka) pour les traitements asynchrones.

## 1.2 Topologie des services

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          API Gateway (Nginx / Kong)                           │
│                    Route : /api/ia/*, /api/v1/ia/*                             │
└─────┬──────────────┬──────────────┬──────────────┬─────────────────────────┘
      │              │              │              │
      ▼              ▼              ▼              ▼
┌──────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐
│  OCR     │ │ Catégorisation│ │ Trésorerie   │ │ Détection        │
│  Service │ │ ML Service   │ │ Service      │ │ Anomalies        │
│  (gRPC)  │ │ (REST)       │ │ (REST)       │ │ (REST)           │
└─────┬────┘ └──────┬───────┘ └──────┬───────┘ └────────┬─────────┘
      │             │               │                  │
      ▼             ▼               ▼                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        Message Queue (RabbitMQ)                           │
│         Tasks: OCR complet, catégorisation async, batch anomalies          │
└─────────────────────────────────────────────────────────────────────────┘
      │                    │                    │
      ▼                    ▼                    ▼
┌─────────────┐  ┌──────────────┐  ┌──────────────────┐
│ Redis Cache │  │ Model Store  │  │ PostgreSQL (DB)  │
│ (Hot data)  │  │ (S3/MinIO)   │  │ (Résultats)      │
└─────────────┘  └──────────────┘  └──────────────────┘
```

## 1.3 Communication inter-services

| Interaction | Protocole | Déclencheur |
|-------------|-----------|-------------|
| Upload facture → OCR | REST (synchrone) | Upload fichier |
| OCR → Catégorisation | Queue (async) | Fin OCR |
| OCR → Détection anomalies | Queue (async) | Fin OCR |
| Catégorisation → Trésorerie | REST (synchrone) | Demande projection |
| Tous → API Gateway | REST | Client frontal |

## 1.4 Contrats d'interface (DTOs)

```python
# DTO commun - Document extrait
@dataclass
class ExtractedDocument:
    document_id: str
    document_type: str          # "facture", "bon_de_livraison", "relevé"
    ocr_confidence: float       # 0.0 - 1.0
    extracted_fields: dict      # {"montant_ht": 1000.00, "tva": 200.00, ...}
    raw_text: str               # Texte brut OCR
    page_count: int
    processing_time_ms: int

# DTO - Transaction comptable
@dataclass
class Transaction:
    transaction_id: str
    date: datetime
    description: str
    montant_ht: Decimal
    montant_tva: Decimal
    montant_ttc: Decimal
    categorie_predite: str
    categorie_confidence: float
    fournisseur: str
    est_anomalie: bool
    anomalies: list[str]
```

## 1.5 Sécurité

- Authentification : **JWT** avec rotation de tokens via API Gateway
- Autorisation : **RBAC** (rôles : comptable, auditeur, admin)
- Données sensibles : chiffrement **AES-256** au repos, **TLS 1.3** en transit
- Logs d'audit : toutes les prédictions IA sont tracées (traçabilité GDPR)

---

# 2. Service OCR

## 2.1 Stack technologique

| Option | Coût | Précision | Cas d'usage |
|--------|------|-----------|-------------|
| **Tesseract OCR** (open-source) | Gratuit | Bonne (85-92%) | Factures standards, documents structurés |
| **Google Vision API** | Payant ($1.50/1000 pages) | Excellente (95-99%) | Documents complexes, manuscrits, multi-langue |
| **Azure Form Recognizer** | Payant ($1.00/1000 pages) | Très bonne (93-97%) | Formulaires avec templates |
| **PaddleOCR** (open-source) | Gratuit | Très bonne (91-95%) | Documents chinois/asiatiques, alternative Tesseract |

**Recommandation** : Architecture hybride — Tesseract en production par défaut (mode offline), Google Vision API en fallback pour les documents à faible confiance OCR (< 85%).

## 2.2 Pipeline de preprocessing

```
Image brute → Rotation correction → Binarisation → Denoising → Deskewing → OCR
```

### 2.2.1 Détection et correction de rotation

- **DEGSLAM** : détection de l'angle de rotation par analyse de projections horizontales/verticales
- **Hough Transform** : détection de lignes pour les documents scannés
- **Correction automatique** si angle détecté > 1°

### 2.2.2 Binarisation adaptative

- **Méthode de Sauvola** : binarisation locale adaptative, superior à Otsu pour documents avec fond irrégulier
- **Niblack/Sauvola** : seuillage local avec paramètre de taille de fenêtre (15-25px)
- **Denoising** : filtre médian + Non-Local Means Denoising (OpenCV)

### 2.2.3 Pipeline OpenCV

```python
import cv2
import numpy as np
from PIL import Image

def preprocess_image(image_path: str) -> np.ndarray:
    img = cv2.imread(image_path)

    # 1. Conversion en niveaux de gris
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # 2. Correction de rotation (DEGSLAM)
    coords = np.column_stack(np.where(gray > 0))
    angle = cv2.minAreaRect(coords)[-1]
    if angle < -45:
        angle = -(90 + angle)
    else:
        angle = -angle
    if abs(angle) > 1.0:
        h, w = gray.shape
        center = (w // 2, h // 2)
        M = cv2.getRotationMatrix2D(center, angle, 1.0)
        gray = cv2.warpAffine(gray, M, (w, h),
                              borderValue=255, flags=cv2.INTER_CUBIC)

    # 3. Denoising (Non-Local Means)
    denoised = cv2.fastNlMeansDenoising(gray, h=10,
                                         templateWindowSize=7,
                                         searchWindowSize=21)

    # 4. Binarisation adaptative (Sauvola-like via local threshold)
    binary = cv2.adaptiveThreshold(denoised, 255,
                                    cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                    cv2.THRESH_BINARY, 25, 10)

    # 5. Deskewing fin
    coords = np.column_stack(np.where(binary < 255))
    if len(coords) > 0:
        angle_fine = cv2.minAreaRect(coords)[-1]
        if abs(angle_fine) > 0.5:
            h, w = binary.shape
            M = cv2.getRotationMatrix2D((w//2, h//2), angle_fine, 1.0)
            binary = cv2.warpAffine(binary, M, (w, h),
                                    borderValue=255, flags=cv2.INTER_NEAREST)

    return binary
```

## 2.3 Extraction des champs

### 2.3.1 Stratégies d'extraction

| Méthode | Application | Précision |
|---------|-------------|-----------|
| **Regex patterns** | Montants, dates, numéros TVA, coordonnées | 90-98% |
| **NER (Named Entity Recognition)** | Noms fournisseurs, adresses, désignations | 82-90% |
| **Layout Analysis (YOLO/Detectron2)** | Positionnement des zones sur template connus | 92-97% |
| **Template matching** | Factures avec format fixe (même fournisseur) | 95-99% |

### 2.3.2 Regex clés pour extraction comptable

```python
import re
from decimal import Decimal
from datetime import datetime
from typing import Optional

class FieldExtractor:
    """Extracteur de champs comptables depuis le texte OCR."""

    PATTERNS = {
        "montant_ht": re.compile(
            r'(?:Montant\s*(?:HT|H\.T\.|HT\.?)|Total\s*HT|Base\s*HT|Subtotal)\s*[:\s]*'
            r'([\d\s]+[,\.]\d{2})', re.IGNORECASE),
        "montant_tva": re.compile(
            r'(?:TVA|TVA?\s*\d+%|Taxe\s*Sur\s*Valeur|VAT)\s*[:\s]*'
            r'([\d\s]+[,\.]\d{2})', re.IGNORECASE),
        "montant_ttc": re.compile(
            r'(?:Montant\s*TTC|Total\s*T\.T\.C\.|Total\s*TTC|Grand\s*Total)\s*[:\s]*'
            r'([\d\s]+[,\.]\d{2})', re.IGNORECASE),
        "tva_rate": re.compile(
            r'(?:TVA|Taux\s*TVA|VAT\s*Rate)\s*[:\s]*(\d+[\,\.]\d+%)',
            re.IGNORECASE),
        "date_facture": re.compile(
            r'(?:Date\s*(?:de\s*)?(?:facture|emission|date))\s*[:\s]*'
            r'(\d{1,2}[\/\-\.]?\d{1,2}[\/\-\.]?\d{2,4})', re.IGNORECASE),
        "date_echeance": re.compile(
            r'(?:Date\s*(?:d.?échéance|d.?due|due\s*date))\s*[:\s]*'
            r'(\d{1,2}[\/\-\.]?\d{1,2}[\/\-\.]?\d{2,4})', re.IGNORECASE),
        "numero_facture": re.compile(
            r'(?:N°|Nº|No\.?|Facture\s*N°|Invoice\s*#|Référence)\s*[:\s]*'
            r'([A-Za-z0-9\-\/]+)', re.IGNORECASE),
        "nom_fournisseur": re.compile(
            r'(?:(?:Emetteur|Fournisseur|Vendor|Seller|From)\s*[:\n])'
            r'(.+?)(?:\n|$)', re.IGNORECASE),
    }

    @classmethod
    def extract(cls, text: str) -> dict:
        results = {}
        for field, pattern in cls.PATTERNS.items():
            match = pattern.search(text)
            if match:
                results[field] = match.group(1).strip()
        return results
```

### 2.3.3 Layout Analysis avec YOLOv8

Pour les factures récurrentes (même fournisseur), on entraîne un modèle YOLOv8 pour détecter les zones clés :

```python
from ultralytics import YOLO
import cv2

class LayoutAnalyzer:
    """Analyse de mise en page pour localiser les zones de facture."""

    def __init__(self, model_path: str = "models/facture_yolov8.pt"):
        self.model = YOLO(model_path)
        self.zone_labels = [
            "montant_ht", "montant_tva", "montant_ttc",
            "date_facture", "date_echeance", "numero_facture",
            "nom_fournisseur", "adresse_fournisseur",
            "tableau_lignes", "total_general"
        ]

    def analyze(self, image_path: str) -> dict:
        results = self.model.predict(image_path, conf=0.7)
        zones = {}
        for result in results:
            for box in result.boxes:
                label = self.zone_labels[int(box.cls)]
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                zones[label] = {"bbox": [x1, y1, x2, y2], "confidence": float(box.conf)}
        return zones

    def extract_zone_text(self, image_path: str, zone: dict) -> str:
        img = cv2.imread(image_path)
        x1, y1, x2, y2 = zone["bbox"]
        cropped = img[y1:y2, x1:x2]
        import pytesseract
        return pytesseract.image_to_string(cropped, lang='fra')
```

## 2.4 Validation croisée des montants

```python
from decimal import Decimal, ROUND_HALF_UP
from dataclasses import dataclass
from typing import Optional, List

@dataclass
class ValidationResult:
    est_valide: bool
    ecart_ht_ttc: Optional[Decimal]
    tva_calculee: Decimal
    ttc_attendu: Decimal
    ttc_reel: Decimal
    taux_tva_detecte: Decimal
    erreurs: List[str]

class MontageValidator:
    """Valide la cohérence mathématique des montants extraits."""

    TAX_RATES = {
        "20%": Decimal("0.20"),
        "10%": Decimal("0.10"),
        "5.5%": Decimal("0.055"),
        "2.1%": Decimal("0.021"),
    }

    @classmethod
    def validate(cls, extracted: dict) -> ValidationResult:
        errors = []
        try:
            ht = Decimal(extracted.get("montant_ht", "0"))
            tva = Decimal(extracted.get("montant_tva", "0"))
            ttc = Decimal(extracted.get("montant_ttc", "0"))
        except Exception as e:
            return ValidationResult(False, None, Decimal(0), Decimal(0), Decimal(0), Decimal(0),
                                    [f"Erreur parsing montants: {e}"])

        # Détection du taux de TVA
        taux_tva = Decimal("0")
        if ht > 0:
            taux_tva = (tva / ht).quantize(Decimal("0.001"))
            for label, rate in cls.TAX_RATES.items():
                if abs(taux_tva - rate) < Decimal("0.002"):
                    taux_tva = rate
                    break

        # Validation : TTC = HT × (1 + TVA)
        ttc_attendu = (ht * (1 + taux_tva)).quantize(Decimal("0.01"), ROUND_HALF_UP)
        ecart = (ttc - ttc_attendu).quantize(Decimal("0.01"), ROUND_HALF_UP)

        if abs(ecart) > Decimal("0.50"):
            errors.append(
                f"Incohérence TTC: attendu {ttc_attendu}€, réel {ttc}€, écart {ecart}€"
            )

        # Vérification : TTC = HT + TVA
        ttc_somme = (ht + tva).quantize(Decimal("0.01"), ROUND_HALF_UP)
        if abs(ttc - ttc_somme) > Decimal("0.50"):
            errors.append(
                f"HT + TVA ≠ TTC : {ht} + {tva} = {ttc_somme} ≠ {ttc}"
            )

        return ValidationResult(
            est_valide=len(errors) == 0,
            ecart_ht_ttc=ecart,
            tva_calculee=tva,
            ttc_attendu=ttc_attendu,
            ttc_reel=ttc,
            taux_tva_detecte=taux_tva,
            erreurs=errors,
        )
```

## 2.5 Mode hors-ligne (Tesseract)

```python
import pytesseract
from PIL import Image
import io

class OfflineOCR:
    """Service OCR hors-ligne utilisant Tesseract."""

    LANGUAGES = ["fra", "eng", "deu", "esp"]

    def __init__(self, tesseract_path: str = None):
        if tesseract_path:
            pytesseract.pytesseract.tesseract_cmd = tesseract_path

    def extract_text(
        self,
        image_bytes: bytes,
        language: str = "fra",
        oem: int = 3,
        psm: int = 6,
    ) -> dict:
        """
        Args:
            image_bytes: Image brute en bytes (PNG/JPG)
            language: Code langue ISO 639-3
            oem: OCR Engine Mode (3=default, 1=CNN, 0=legacy)
            psm: Page Segmentation Mode (6=uniform block, 4=column, 11=sparse)

        Returns:
            Dict avec texte brut, confiance moyenne, données brutes Tesseract
        """
        img = Image.open(io.BytesIO(image_bytes))

        # Configuration Tesseract
        custom_config = f'--oem {oem} --psm {psm} -l {language}'

        # Texte brut
        text = pytesseract.image_to_string(img, config=custom_config)

        # Données détaillées (confiance mot par mot)
        data = pytesseract.image_to_data(img, config=custom_config,
                                          output_type=pytesseract.Output.DICT)

        # Calcul confiance moyenne
        confidences = [int(c) for c in data["conf"] if int(c) > -1]
        avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0

        return {
            "raw_text": text,
            "confidence_avg": round(avg_confidence / 100, 4),
            "word_count": len([w for w in data["text"] if w.strip()]),
            "tesseract_data": data,
            "language_detected": language,
            "requires_fallback": avg_confidence < 850,  # < 85%
        }
```

## 2.6 Exemple complet : pipeline OCR

```python
class OCRPipeline:
    """Pipeline complet de traitement OCR pour factures."""

    def __init__(self):
        self.preprocessor = Preprocessor()
        self.offline_ocr = OfflineOCR()
        self.extractor = FieldExtractor()
        self.validator = MontageValidator()
        self.google_vision_client = GoogleVisionClient()  # Fallback

    def process(self, image_path: str) -> dict:
        # Étape 1 : Preprocessing
        processed_img = self.preprocessor.process(image_path)

        # Étape 2 : OCR
        ocr_result = self.offline_ocr.extract_text(
            processed_img, language="fra"
        )

        # Étape 3 : Fallback Google Vision si confiance faible
        if ocr_result["requires_fallback"]:
            ocr_result = self.google_vision_client.enhance(
                image_path, ocr_result
            )

        # Étape 4 : Extraction des champs
        fields = self.extractor.extract(ocr_result["raw_text"])

        # Étape 5 : Validation croisée
        validation = self.validator.validate(fields)

        return {
            "ocr": ocr_result,
            "fields": fields,
            "validation": validation,
            "document_ready": validation.est_valide,
        }
```

---

# 3. Service de catégorisation ML

## 3.1 Vue d'ensemble

Le service de catégorisation attribue automatiquement une **catégorie comptable** (plan comptable) à chaque transaction/extrait de facture. Il utilise un modèle de Machine Learning supervisé entraîné sur l'historique des transactions déjà catégorisées manuellement.

## 3.2 Features (variables explicatives)

| Feature | Type | Description | Exemple |
|---------|------|-------------|---------|
| `libelle` | Text vectorisé | Libellé de la transaction | "Fournitures bureau" |
| `montant_ht` | Numérique | Montant hors taxe | 1250.00 |
| `date` | Dérivé | Date de la transaction (jour, mois, trimestre) | 2026-09-13 |
| `fournisseur` | Catégoriel | Nom/RID du fournisseur | "Orange Business" |
| `regex_pattern` | Catégoriel | Pattern regex matché | "fourniture" |
| `jour_semaine` | Cyclique | Jour encodé (sin/cos) | Lundi |
| `mois` | Cyclique | Mois encodé (sin/cos) | Septembre |
| `est_année_fiscale` | Binaire | Période de fin d'année | 0/1 |
| `categorie_fournisseur` | Hiérarchique | Niveau 1 du fournisseur | "Télécom" |
| `historique_freq` | Numérique | Fréquence transactions fournisseur | 45 |

### Encodage des features cycliques

```python
import numpy as np

def encode_cyclic(date: datetime) -> dict:
    """Encode les features temporelles de manière cyclique."""
    day = date.day
    month = date.month
    return {
        "day_sin": np.sin(2 * np.pi * day / 31),
        "day_cos": np.cos(2 * np.pi * day / 31),
        "month_sin": np.sin(2 * np.pi * month / 12),
        "month_cos": np.cos(2 * np.pi * month / 12),
        "is_quarter_end": 1 if day in [28, 29, 30, 31] and month in [3, 6, 9, 12] else 0,
    }
```

### Vectorisation du libellé

```python
from sklearn.feature_extraction.text import TfidfVectorizer
import re

class LabelVectorizer:
    """Vectorise les libellés de transactions."""

    def __init__(self, max_features: int = 5000):
        self.vectorizer = TfidfVectorizer(
            max_features=max_features,
            ngram_range=(1, 3),
            stop_words="french",
            token_pattern=r'(?u)\b[\w][\w-]+\b',
            sublinear_tf=True,
        )

    def fit(self, labels: list[str]):
        cleaned = [self._clean(l) for l in labels]
        self.vectorizer.fit(cleaned)

    def transform(self, labels: list[str]) -> np.ndarray:
        cleaned = [self._clean(l) for l in labels]
        return self.vectorizer.transform(cleaned)

    @staticmethod
    def _clean(text: str) -> str:
        text = re.sub(r'[^\w\s]', ' ', text.lower())
        text = re.sub(r'\d+', 'NUM', text)
        return text
```

## 3.3 Modèle : Random Forest vs XGBoost

| Critère | Random Forest | XGBoost |
|---------|---------------|---------|
| Précision | 87-91% | 90-95% |
| Vitesse entraînement | Rapide | Moyen |
| Interprétabilité | Bonne (feature importance) | Bonne (SHAP) |
| Gestion classes déséquilibrées | Native (class_weight) | Via scale_pos_weight |
| Overfitting | Résistant | Nécessite régularisation |
| Dépendance GPU | Non | Non |

**Recommandation** : **XGBoost** avec régularisation (L1/L2) pour la précision supérieure et SHAP pour l'interprétabilité des prédictions (comptabilité = auditabilité).

## 3.4 Entraînement du modèle

```python
import xgboost as xgb
from sklearn.model_selection import StratifiedKFold, GridSearchCV
from sklearn.metrics import classification_report, f1_score
import joblib
import numpy as np
from typing import Optional

class CategorizationModel:
    """Modèle ML de catégorisation comptable."""

    CATEGORIES = [
        "charges_administratives",
        "charges_commerciales",
        "charges_financieres",
        "charges_exceptionnelles",
        "achats_matieres_premieres",
        "achats_energie",
        "achats_transport",
        "produits_ventes",
        "autres_operations",
    ]

    def __init__(self, model_path: Optional[str] = None):
        if model_path:
            self.model = joblib.load(model_path)
        else:
            self.model = xgb.XGBClassifier(
                n_estimators=300,
                max_depth=6,
                learning_rate=0.05,
                subsample=0.8,
                colsample_bytree=0.8,
                reg_alpha=0.1,           # L1 regularization
                reg_lambda=1.0,          # L2 regularization
                objective="multi:softprob",
                num_class=len(self.CATEGORIES),
                eval_metric="mlogloss",
                use_label_encoder=False,
                random_state=42,
                n_jobs=-1,
                early_stopping_rounds=20,
            )
        self.label_encoder = None
        self._trained = False

    def prepare_features(
        self,
        libelle: str,
        montant: float,
        date: str,
        fournisseur: str,
        freq_fournisseur: int = 0,
    ) -> np.ndarray:
        """Prépare le vecteur de features pour une transaction."""
        from datetime import datetime
        # Libellé vectorisé
        label_vec = self.label_vectorizer.transform([libelle])

        # Features numériques
        dt = datetime.fromisoformat(date) if isinstance(date, str) else date
        cyclic = encode_cyclic(dt)

        numerical = np.array([
            montant,
            cyclic["day_sin"], cyclic["day_cos"],
            cyclic["month_sin"], cyclic["month_cos"],
            cyclic["is_quarter_end"],
            freq_fournisseur,
        ]).reshape(1, -1)

        return np.hstack([numerical, label_vec.toarray()])

    def train(
        self,
        X: np.ndarray,
        y: np.ndarray,
        X_val: Optional[np.ndarray] = None,
        y_val: Optional[np.ndarray] = None,
    ) -> dict:
        """Entraîne le modèle avec validation croisée."""
        # Stratified K-Fold pour déséquilibre de classes
        skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

        results = {}
        for fold, (train_idx, val_idx) in enumerate(skf.split(X, y)):
            X_train, X_fold_val = X[train_idx], X[val_idx]
            y_train, y_fold_val = y[train_idx], y[val_idx]

            eval_set = [(X_fold_val, y_fold_val)]
            self.model.fit(
                X_train, y_train,
                eval_set=eval_set,
                verbose=False,
            )
            preds = self.model.predict(X_fold_val)
            fold_f1 = f1_score(y_fold_val, preds, average="weighted")
            results[f"fold_{fold}"] = {
                "f1_weighted": fold_f1,
                "precision": classification_report(y_fold_val, preds, output_dict=True),
            }

        self._trained = True
        results["mean_f1"] = np.mean(
            [r["f1_weighted"] for r in results.values()]
        )
        return results

    def predict(self, X: np.ndarray, top_k: int = 3) -> list[dict]:
        """Prédit la catégorie avec top-K probabilités."""
        probs = self.model.predict_proba(X)[0]
        top_indices = np.argsort(probs)[-top_k:][::-1]
        return [
            {
                "categorie": self.CATEGORIES[idx],
                "probability": float(probs[idx]),
            }
            for idx in top_indices
        ]

    def save(self, path: str):
        joblib.dump(self.model, path)

    def load(self, path: str):
        self.model = joblib.load(path)
```

## 3.5 Fine-tuning par organisation

Chaque organisation (client) a un plan comptable spécifique. Le modèle global est pré-entraîné, puis fine-tuné :

```python
class OrganizationFineTuner:
    """Fine-tuning du modèle par organisation."""

    def __init__(self, base_model: CategorizationModel):
        self.base_model = base_model
        self.org_models: dict[str, CategorizationModel] = {}

    def fine_tune(
        self,
        org_id: str,
        org_transactions: list[dict],
        epochs: int = 10,
        learning_rate: float = 0.01,
    ) -> dict:
        """
        Fine-tune sur les données spécifiques de l'organisation.

        Args:
            org_id: Identifiant organisation
            org_transactions: Liste de {libelle, montant, date, fournisseur, categorie}
            epochs: Nombre d'itérations (XGBoost = rounds)
            learning_rate: Taux d'apprentissage pour fine-tuning
        """
        import pandas as pd

        df = pd.DataFrame(org_transactions)
        X = np.array([
            self.base_model.prepare_features(
                row["libelle"], row["montant"],
                row["date"], row["fournisseur"]
            )[0] for _, row in df.iterrows()
        ])
        y = df["categorie"].values

        # Clone du modèle de base
        org_model = CategorizationModel()
        org_model.model = xgb.XGBClassifier(
            **self.base_model.model.get_params(),
            learning_rate=learning_rate,
            n_estimators=epochs,
            random_state=42,
        )

        # Transfer learning: pré-entraînement congelé (warm start)
        org_model.model.fit(
            X, y,
            xgb_model=self.base_model.model.get_booster().to_json(),
        )

        self.org_models[org_id] = org_model
        return {
            "org_id": org_id,
            "samples_used": len(df),
            "category_distribution": df["categorie"].value_counts().to_dict(),
        }
```

## 3.6 Feedback loop

```
Utilisateur corrige catégorie
         │
         ▼
┌─────────────────┐
│  Stocker correction │──→ Redis (cache d'apprentissage)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Batch Nuit      │──→ Ré-entraîner org model si N >= seuil
│  (Cron 2h)       │    ou déclencher ré-entraînement immédiat (online)
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  Validation A/B  │──→ Modèle corrigé vs modèle courant (shadow mode)
│  (24h)           │    Promotion si précision supérieure
└─────────────────┘
```

```python
class FeedbackLoop:
    """Gestion du feedback utilisateur pour amélioration continue."""

    FEEDBACK_THRESHOLD = 50  # Minimum corrections avant ré-entraînement

    def __init__(self, redis_client, finetuner: OrganizationFineTuner):
        self.redis = redis_client
        self.finetuner = finetuner

    def submit_correction(
        self,
        org_id: str,
        transaction_id: str,
        predicted_category: str,
        corrected_category: str,
        confidence: float,
    ):
        """Stocke la correction utilisateur."""
        correction = {
            "transaction_id": transaction_id,
            "predicted": predicted_category,
            "corrected": corrected_category,
            "confidence": confidence,
            "timestamp": datetime.now().isoformat(),
        }
        key = f"feedback:{org_id}:pending"
        self.redis.rpush(key, json.dumps(correction))
        self.redis.expire(key, 86400 * 30)  # 30 jours de rétention

    def check_retrain_needed(self, org_id: str) -> bool:
        """Vérifie si suffisamment de corrections pour ré-entraînement."""
        key = f"feedback:{org_id}:pending"
        count = self.redis.llen(key)
        return count >= self.FEEDBACK_THRESHOLD

    def get_training_data(self, org_id: str) -> list[dict]:
        """Récupère les corrections pour entraînement."""
        key = f"feedback:{org_id}:pending"
        corrections = self.redis.lrange(key, 0, -1)
        training_data = []
        for c in corrections:
            correction = json.loads(c)
            training_data.append({
                "libelle": correction.get("libelle", ""),
                "montant": correction.get("montant", 0),
                "date": correction.get("date", ""),
                "fournisseur": correction.get("fournisseur", ""),
                "categorie": correction["corrected"],
            })
        return training_data
```

---

# 4. Service de prédiction de trésorerie

## 4.1 Vue d'ensemble

Le service de prédiction de trésorerie projette les flux de trésorerie futurs (entrées et sorties) sur 3, 6 et 12 mois. Il combine l'historique comptable avec les factures en attente et les dépenses récurrentes connues.

## 4.2 Features

| Feature | Type | Description |
|---------|------|-------------|
| `historique_solde` | Série temporelle | Solde quotidien sur 24 mois |
| `entrees_historiques` | Série temporelle | Flux entrants (ventes, encaissements) |
| `sorties_historiques` | Série temporelle | Flux sortants (achats, charges) |
| `factures_en_attente` | Table | Factures non payées avec dates échéance |
| `depenses_recurrentes` | Fixe mensuel | Loyer, abonnements, salaires |
| `saisonnalite` | Cyclique | Indicateur de période fiscale/financière |
| `dette_courante` | Numérique | Total crédits consommation en cours |
| `tendance_recente` | Dérivé | Pente des 30 derniers jours |

## 4.3 Modèles disponibles

| Modèle | Avantages | Inconvénients | Cas d'usage |
|--------|-----------|---------------|-------------|
| **Prophet (Meta)** | Saisonnalité auto-détectée, robuste aux trous, interprétable | Moins précis sur long terme, pas de features externes riches | Base : projections mensuelles avec saisonnalité |
| **ARIMA/SARIMA** | Statistiquement rigoureux, intervalles de confiance natifs | Linéaire uniquement, stationnarité requise | Séries stationnaires, court terme |
| **LSTM (Deep Learning)** | Capture patterns complexes, features multiples | Nécessite beaucoup de données, long à entraîner | Grand volume de données, patterns complexes |

**Recommandation** : **Prophet** pour les projections mensuelles (robuste, interprétable), avec **SARIMA** pour les projections hebdomadaires, et **LSTM** en option pour les grosses organisations (>50k transactions).

## 4.4 Architecture du service

```
┌────────────────────┐
│  Données comptables │──→ Historical Data Loader
│  (PostgreSQL)       │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│  Feature Engine     │──→ Calcul des features, agrégations mensuelles
└────────┬───────────┘
         │
    ┌────┴────┬────────────┐
    ▼         ▼            ▼
┌────────┐┌──────────┐┌────────┐
│Prophet ││ SARIMA   ││ LSTM   │
│(base)  ││(hebdo)   ││(opt)   │
└───┬────┘└─────┬────┘└───┬────┘
    │           │          │
    ▼           ▼          ▼
┌────────────────────────────────────┐
│  Ensemble & Calibration            │
│  (Weighted average per horizon)    │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│  Projection Store (PostgreSQL)     │
│  3M / 6M / 12M + intervalles CI   │
└────────────────────────────────────┘
```

## 4.5 Implémentation Prophet

```python
from prophet import Prophet
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Optional

class CashFlowProphet:
    """Prédiction de trésorerie avec Prophet."""

    HORIZONS = {
        "3M": 90,
        "6M": 180,
        "12M": 365,
    }

    def __init__(self, config: Optional[dict] = None):
        self.config = config or {}
        self.models: dict[str, Prophet] = {}
        self.history: Optional[pd.DataFrame] = None

    def prepare_history(
        self,
        transactions: pd.DataFrame,
        invoices: Optional[pd.DataFrame] = None,
        recurrent_expenses: Optional[pd.DataFrame] = None,
    ) -> pd.DataFrame:
        df = transactions[["date", "montant"]].copy()
        df.columns = ["ds", "y"]
        df["ds"] = pd.to_datetime(df["ds"])
        df = df.groupby("ds").sum().reset_index()

        if invoices is not None:
            invoices = invoices.copy()
            invoices["date_echeance"] = pd.to_datetime(
                invoices["date_echeance"]
            )
            pending = invoices.groupby("date_echeance")[
                "montant_attendu"
            ].sum()
            df = df.merge(
                pending.rename("factures_en_attente")
                .reset_index()[["date_echeance", "factures_en_attente"]],
                left_on="ds", right_on="date_echeance",
                how="left",
            )
            df["factures_en_attente"] = df[
                "factures_en_attente"
            ].fillna(0)

        if recurrent_expenses is not None:
            df["depenses_recurrentes"] = (
                recurrent_expenses["montant_mensuel"].mean()
            )
        else:
            df["depenses_recurrentes"] = 0

        self.history = df
        return df

    def train(self, horizon: str = "12M"):
        days = self.HORIZONS.get(horizon, 365)
        model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=False,
            daily_seasonality=False,
            changepoint_prior_scale=0.05,
            seasonality_prior_scale=10,
            interval_width=0.95,
            growth="linear",
        )
        if "factures_en_attente" in self.history.columns:
            model.add_regressor("factures_en_attente")
        if "depenses_recurrentes" in self.history.columns:
            model.add_regressor("depenses_recurrentes")
        model.fit(self.history)
        self.models[horizon] = model
        return model

    def predict(self, horizon: str = "6M") -> pd.DataFrame:
        if horizon not in self.models:
            self.train(horizon)
        model = self.models[horizon]
        days = self.HORIZONS[horizon]
        future_dates = pd.date_range(
            start=self.history["ds"].max() + timedelta(days=1),
            periods=days, freq="D",
        )
        future = pd.DataFrame({"ds": future_dates})
        if "factures_en_attente" in model.train_feature_names:
            future["factures_en_attente"] = 0
        if "depenses_recurrentes" in model.train_feature_names:
            future["depenses_recurrentes"] = self.history[
                "depenses_recurrentes"
            ].mean()
        forecast = model.predict(future)
        return forecast[["ds", "yhat", "yhat_lower", "yhat_upper"]]

    def get_projections(self) -> dict:
        projections = {}
        for horizon in ["3M", "6M", "12M"]:
            pred = self.predict(horizon)
            projections[horizon] = {
                "dates": pred["ds"].tolist(),
                "predicted": pred["yhat"].tolist(),
                "lower_95": pred["yhat_lower"].tolist(),
                "upper_95": pred["yhat_upper"].tolist(),
                "summary": {
                    "total_predicted": float(pred["yhat"].sum()),
                    "total_lower": float(pred["yhat_lower"].sum()),
                    "total_upper": float(pred["yhat_upper"].sum()),
                    "avg_daily": float(pred["yhat"].mean()),
                    "min_daily": float(pred["yhat"].min()),
                    "max_daily": float(pred["yhat"].max()),
                },
            }
        return projections
```

## 4.6 Implémentation SARIMA (alternative hebdomadaire)

```python
from statsmodels.tsa.statespace.sarimax import SARIMAX
import pandas as pd
import numpy as np
from typing import Tuple

class CashFlowSARIMA:
    """Prédiction hebdomadaire avec SARIMA."""

    def __init__(self, order=(1, 1, 1), seasonal_order=(1, 1, 1, 52)):
        self.order = order
        self.seasonal_order = seasonal_order
        self.model: Optional[SARIMAX] = None
        self.results: Optional[SARIMAX.results] = None

    def fit(self, series: pd.Series) -> "CashFlowSARIMA":
        self.model = SARIMAX(
            series,
            order=self.order,
            seasonal_order=self.seasonal_order,
            enforce_stationarity=False,
            enforce_invertibility=False,
        )
        self.results = self.model.fit(disp=False)
        return self

    def predict(self, steps: int = 52, alpha: float = 0.05) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        forecast = self.results.get_forecast(steps=steps)
        pred = forecast.predicted_mean
        ci = forecast.conf_int(alpha=alpha)
        return pred.values, ci.iloc[:, 0].values, ci.iloc[:, 1].values

    def information_criteria(self) -> dict:
        return {
            "aic": float(self.results.aic),
            "bic": float(self.results.bic),
            "hqic": float(self.results.hqic),
        }
```

## 4.7 Implémentation LSTM (alternative deep learning)

```python
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout, Bidirectional, Input, RepeatVector, TimeDistributed
from tensorflow.keras.callbacks import EarlyStopping
import numpy as np

class CashFlowLSTM:
    """Prédiction LSTM pour séries temporelles de trésorerie."""

    def __init__(self, lookback=60, forecast_horizon=30, lstm_units=128, dropout_rate=0.2):
        self.lookback = lookback
        self.forecast_horizon = forecast_horizon
        self.lstm_units = lstm_units
        self.dropout_rate = dropout_rate
        self.model: Optional[Sequential] = None
        self.scaler = None

    def _build_model(self, n_features: int) -> Sequential:
        model = Sequential([
            Input(shape=(self.lookback, n_features)),
            Bidirectional(LSTM(self.lstm_units, return_sequences=True)),
            Dropout(self.dropout_rate),
            LSTM(self.lstm_units // 2, return_sequences=False),
            Dropout(self.dropout_rate),
            RepeatVector(self.forecast_horizon),
            LSTM(self.lstm_units // 2, return_sequences=True),
            TimeDistributed(Dense(n_features)),
        ])
        model.compile(
            optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
            loss="mse",
            metrics=["mae"],
        )
        return model

    def fit(self, X: np.ndarray, y: np.ndarray, epochs=100, batch_size=32, validation_split=0.15) -> dict:
        n_features = X.shape[2] if X.ndim == 3 else 1
        self.model = self._build_model(n_features)
        es = EarlyStopping(monitor="val_loss", patience=15, restore_best_weights=True)
        history = self.model.fit(
            X, y, epochs=epochs, batch_size=batch_size,
            validation_split=validation_split, callbacks=[es], verbose=1,
        )
        return {
            "final_loss": float(history.history["loss"][-1]),
            "final_val_loss": float(history.history["val_loss"][-1]),
            "epochs_trained": len(history.history["loss"]),
        }

    def predict(self, X: np.ndarray) -> np.ndarray:
        return self.model.predict(X)

    def monte_carlo_prediction(self, X: np.ndarray, n_simulations=1000) -> dict:
        predictions = []
        for _ in range(n_simulations):
            pred = self.predict(X)
            noise = np.random.normal(0, pred.std(), size=pred.shape)
            trajectory = np.cumsum(pred.flatten() + noise)
            predictions.append(trajectory)
        predictions = np.array(predictions)
        return {
            "mean": predictions.mean(axis=0).tolist(),
            "p5": np.percentile(predictions, 5, axis=0).tolist(),
            "p25": np.percentile(predictions, 25, axis=0).tolist(),
            "p75": np.percentile(predictions, 75, axis=0).tolist(),
            "p95": np.percentile(predictions, 95, axis=0).tolist(),
            "n_simulations": n_simulations,
        }
```

## 4.8 Service complet : orchestrateur de projections

```python
class CashFlowPredictionService:
    """Service orchestrateur de prédiction de trésorerie."""

    def __init__(self):
        self.prophet = CashFlowProphet()
        self.sarima = CashFlowSARIMA()
        self.lstm = CashFlowLSTM()

    def generate_projections(
        self,
        transactions: pd.DataFrame,
        invoices: pd.DataFrame,
        recurrent_expenses: pd.DataFrame,
    ) -> dict:
        history = self.prophet.prepare_history(
            transactions, invoices, recurrent_expenses
        )
        prophet_projections = self.prophet.get_projections()
        weekly_series = history.set_index("ds")["y"].resample("W").sum()
        sarima = self.sarima.fit(weekly_series)
        sarima_pred, sarima_lower, sarima_upper = sarima.predict(steps=4)
        return {
            "prophet": prophet_projections,
            "sarima": {
                "dates": [
                    d.isoformat() for d in pd.date_range(
                        start=weekly_series.index[-1], periods=5, freq="W"
                    )
                ],
                "predicted": sarima_pred.tolist(),
                "confidence_lower": sarima_lower.tolist(),
                "confidence_upper": sarima_upper.tolist(),
            },
            "generated_at": datetime.now().isoformat(),
        }
```

---

# 5. Service de détection d'anomalies

## 5.1 Vue d'ensemble

Le service de détection d'anomalies identifie automatiquement les transactions suspectes ou inhabituelles dans les données comptables. Il combine des méthodes statistiques, algorithmiques et basées sur des règles pour minimiser les faux positifs tout en maximisant la détection de fraudes et d'erreurs.

## 5.2 Méthodes

### 5.2.1 Z-Score (statistique)

Détection basée sur l'écart type par rapport à la moyenne historique de chaque catégorie.

```python
import numpy as np
import pandas as pd
from scipy import stats
from typing import Optional

class ZScoreDetector:
    """Détection d'anomalies par Z-Score."""

    def __init__(self, threshold: float = 3.0, window_days: int = 365):
        self.threshold = threshold
        self.window_days = window_days

    def detect(
        self,
        transactions: pd.DataFrame,
        category_col: str = "categorie",
        amount_col: str = "montant",
    ) -> pd.DataFrame:
        results = transactions.copy()
        results["z_score"] = np.nan
        results["is_anomaly"] = False

        for cat in transactions[category_col].unique():
            mask = results[category_col] == cat
            cat_data = results.loc[mask, amount_col]
            if len(cat_data) < 5:
                continue
            mean = cat_data.mean()
            std = cat_data.std()
            if std == 0:
                continue
            results.loc[mask, "z_score"] = (cat_data - mean) / std
            results.loc[mask, "is_anomaly"] = (
                results.loc[mask, "z_score"].abs() > self.threshold
            )
        return results[results["is_anomaly"]]
```

### 5.2.2 Isolation Forest (ML)

Algorithme non supervisé qui isole les observations anormales par partitionnement aléatoire.

```python
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import numpy as np
import pandas as pd

class IsolationAnomalyDetector:
    """Détection d'anomalies par Isolation Forest."""

    def __init__(self, n_estimators=200, contamination=0.01, max_samples=256, random_state=42):
        self.model = IsolationForest(
            n_estimators=n_estimators,
            contamination=contamination,
            max_samples=max_samples,
            random_state=random_state,
            n_jobs=-1,
        )
        self.scaler = StandardScaler()
        self.feature_names: list[str] = []
        self._trained = False

    def prepare_features(self, transactions: pd.DataFrame) -> tuple[np.ndarray, list[str]]:
        features_df = pd.DataFrame()
        features_df["montant"] = transactions["montant"]
        features_df["montant_log"] = np.log1p(transactions["montant"].abs())
        features_df["heure"] = transactions["date"].dt.hour
        features_df["jour_semaine"] = transactions["date"].dt.dayofweek
        features_df["jour_mois"] = transactions["date"].dt.day

        supplier_map = {s: i for i, s in enumerate(transactions["fournisseur"].unique())}
        features_df["fournisseur_encoded"] = transactions["fournisseur"].map(supplier_map)

        cat_map = {c: i for i, c in enumerate(transactions["categorie"].unique())}
        features_df["categorie_encoded"] = transactions["categorie"].map(cat_map)

        freq = transactions["fournisseur"].value_counts()
        features_df["freq_fournisseur"] = transactions["fournisseur"].map(freq)

        self.feature_names = features_df.columns.tolist()
        self._trained = True
        return features_df.values, self.feature_names

    def fit_predict(self, transactions: pd.DataFrame) -> pd.DataFrame:
        X, _ = self.prepare_features(transactions)
        X_scaled = self.scaler.fit_transform(X)
        predictions = self.model.fit_predict(X_scaled)
        scores = self.model.decision_function(X_scaled)

        results = transactions.copy()
        results["is_anomaly"] = predictions == -1
        results["anomaly_score"] = scores
        results["anomaly_type"] = "unknown"
        results = self._classify_anomalies(results)
        return results[results["is_anomaly"]]

    def _classify_anomalies(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()
        conditions = []
        types = []
        conditions.append(df["montant"] < 0)
        types.append("montant_negatif")
        z_scores = (df["montant"] - df["montant"].mean()) / df["montant"].std()
        conditions.append(z_scores > 3)
        types.append("montant_exceptionnel")
        conditions.append(df["freq_fournisseur"] < 3)
        types.append("fournisseur_rare")
        df["anomaly_type"] = np.select(conditions, types, default="autre")
        return df
```

### 5.2.3 Règles métier (Rule-based)

```python
from dataclasses import dataclass
from typing import Optional
from datetime import datetime, timedelta

@dataclass
class RuleViolation:
    rule_name: str
    severity: str
    description: str
    suggested_action: str

class RuleBasedDetector:
    """Détection par règles métier."""

    RULES = [
        {
            "name": "montant_negatif",
            "condition": "montant < 0",
            "severity": "critical",
            "description": "Montant négatif - vérifier nature de l'opération",
            "action": "flag_for_review",
        },
        {
            "name": "montant_zero",
            "condition": "montant == 0",
            "severity": "warning",
            "description": "Montant nul - possible erreur",
            "action": "flag_for_review",
        },
        {
            "name": "doublon_potentiel",
            "condition": "same_supplier_same_amount_within_7_days",
            "severity": "critical",
            "description": "Transaction identique dans les 7 jours",
            "action": "flag_for_review",
        },
        {
            "name": "facture_futile",
            "condition": "date > current_date + 30_days",
            "severity": "warning",
            "description": "Facture datée de +30 jours dans le futur",
            "action": "verify_date",
        },
        {
            "name": "chiffre_affaires_improbable",
            "condition": "monthly_total > 3 * avg_6_months",
            "severity": "warning",
            "description": "CA mensuel > 3x la moyenne 6 mois",
            "action": "verify_transactions",
        },
        {
            "name": "fournisseur_nouveau_montant_eleve",
            "condition": "new_supplier AND montant > 10000",
            "severity": "warning",
            "description": "Premier montant élevé pour nouveau fournisseur",
            "action": "verify_supplier",
        },
    ]

    def __init__(self, transactions: pd.DataFrame):
        self.transactions = transactions
        self.violations: list[RuleViolation] = []

    def check_all(self) -> list[dict]:
        results = []
        for transaction in self.transactions.itertuples():
            tx_violations = self._check_transaction(transaction)
            for v in tx_violations:
                results.append({**v.__dict__, "transaction_id": transaction.transaction_id})
        return results

    def _check_transaction(self, tx) -> list[RuleViolation]:
        violations = []
        if tx.montant < 0:
            violations.append(RuleViolation(
                rule_name="montant_negatif", severity="critical",
                description=f"Montant negatif: {tx.montant}EUR",
                suggested_action="Verifier nature de l'operation",
            ))
        if tx.montant == 0:
            violations.append(RuleViolation(
                rule_name="montant_zero", severity="warning",
                description="Facture montant nul",
                suggested_action="Verifier exactitude",
            ))
        return violations

    def detect_duplicates(self) -> list[dict]:
        df = self.transactions.copy()
        df["date"] = pd.to_datetime(df["date"])
        df_sorted = df.sort_values(["fournisseur", "montant", "date"])
        duplicates = []
        for i in range(1, len(df_sorted)):
            prev = df_sorted.iloc[i - 1]
            curr = df_sorted.iloc[i]
            if (
                prev.fournisseur == curr.fournisseur
                and prev.montant == curr.montant
                and abs((curr.date - prev.date).days) <= 7
            ):
                duplicates.append({
                    "transaction_ids": [prev.transaction_id, curr.transaction_id],
                    "fournisseur": curr.fournisseur,
                    "montant": curr.montant,
                    "date_1": prev.date.isoformat(),
                    "date_2": curr.date.isoformat(),
                    "type": "doublon_potentiel",
                    "severity": "critical",
                })
        return duplicates
```

## 5.3 Types d'anomalies couverts

| Type | Méthode | Sévérité | Exemple |
|------|---------|----------|---------|
| **Dépense inhabituelle** | Z-Score, Isolation Forest | Warning | Achat 50kEUR vs moyenne 2kEUR |
| **Doublon** | Rule-based | Critical | Même facture 2x en 7 jours |
| **Montant négatif** | Rule-based | Critical | Avoir non classé |
| **Fournisseur inconnu** | ML (low frequency) | Warning | Nouveau RID > 10kEUR |
| **Date future** | Rule-based | Warning | Facture datée +30 jours |
| **Pattern frauduleux** | Isolation Forest + Rules | Fraud | Schéma multi-petites valeurs |
| **Période aberrante** | Prophet residuals | Warning | Dépenses anormales hors saison |

## 5.4 Exemple complet : pipeline de détection

```python
class AnomalyDetectionService:
    """Pipeline complet de détection d'anomalies."""

    def __init__(self):
        self.zscore = ZScoreDetector(threshold=3.0)
        self.isolation = IsolationAnomalyDetector(contamination=0.01)
        self.rules = None

    def detect(self, transactions: pd.DataFrame) -> dict:
        zscore_anomalies = self.zscore.detect(transactions)
        isolation_anomalies = self.isolation.fit_predict(transactions)

        self.rules = RuleBasedDetector(transactions)
        rule_violations = self.rules.check_all()
        duplicates = self.rules.detect_duplicates()

        anomaly_ids = set()
        anomaly_ids.update(zscore_anomalies.index.tolist())
        anomaly_ids.update(isolation_anomalies.index.tolist())

        all_anomalies = transactions.loc[list(anomaly_ids)].copy()
        all_anomalies["sources"] = all_anomalies.index.map(
            lambda idx: [
                "zscore" if idx in zscore_anomalies.index else None,
                "isolation_forest" if idx in isolation_anomalies.index else None,
            ]
        )

        return {
            "total_transactions": len(transactions),
            "anomalies_detected": len(anomaly_ids),
            "anomaly_rate": round(len(anomaly_ids) / len(transactions) * 100, 2),
            "zscore_anomalies": len(zscore_anomalies),
            "isolation_anomalies": len(isolation_anomalies),
            "rule_violations": rule_violations,
            "duplicates": duplicates,
            "anomalies_detail": all_anomalies,
            "severity_breakdown": {
                "critical": sum(1 for v in rule_violations if v["severity"] == "critical"),
                "warning": sum(1 for v in rule_violations if v["severity"] == "warning"),
                "fraud": sum(1 for v in rule_violations if v["severity"] == "fraud"),
            },
        }
```

---

# 6. Infrastructure

## 6.1 Docker Compose - Architecture complète

```yaml
version: "3.9"

services:
  api-gateway:
    image: nginx:alpine
    ports:
      - "8080:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - ia-ocr
      - ia-categorization
      - ia-cashflow
      - ia-anomaly
    environment:
      - UPSTREAM_ocr=ia-ocr:50051
      - UPSTREAM_categorization=ia-categorization:8000
      - UPSTREAM_cashflow=ia-cashflow:8000
      - UPSTREAM_anomaly=ia-anomaly:8000
    restart: always

  ia-ocr:
    build:
      context: ./services/ocr
      dockerfile: Dockerfile
    ports:
      - "50051:50051"
      - "5000:5000"
    volumes:
      - tesseract_data:/usr/share/tesseract-ocr/4.00/tessdata
      - ./models/ocr:/app/models:ro
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: "1.0"
    restart: always

  ia-categorization:
    build:
      context: ./services/categorization
      dockerfile: Dockerfile
    ports:
      - "8001:8000"
    volumes:
      - model-store:/app/models
      - redis:/app/cache
    environment:
      - REDIS_URL=redis://redis:6379/0
      - MODEL_PATH=/app/models/categorization_v1.json
      - MLFLOW_TRACKING_URI=http://mlflow:5000
    deploy:
      resources:
        limits:
          memory: 4G
          cpus: "2.0"
    restart: always

  ia-cashflow:
    build:
      context: ./services/cashflow
      dockerfile: Dockerfile
    ports:
      - "8002:8000"
    volumes:
      - model-store:/app/models
      - redis:/app/cache
    environment:
      - REDIS_URL=redis://redis:6379/0
      - DATABASE_URL=postgresql://user:pass@postgres:5432/accounting
      - PROPHEGY_CACHE_TTL=3600
    deploy:
      resources:
        limits:
          memory: 4G
          cpus: "2.0"
    restart: always

  ia-anomaly:
    build:
      context: ./services/anomaly
      dockerfile: Dockerfile
    ports:
      - "8003:8000"
    volumes:
      - model-store:/app/models
    environment:
      - REDIS_URL=redis://redis:6379/0
    deploy:
      resources:
        limits:
          memory: 3G
          cpus: "1.5"
    restart: always

  rabbitmq:
    image: rabbitmq:3-management-alpine
    ports:
      - "5672:5672"
      - "15672:15672"
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    environment:
      - RABBITMQ_DEFAULT_USER=ia_user
      - RABBITMQ_DEFAULT_PASS=ia_password
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: "0.5"
    restart: always

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --maxmemory 2gb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: "0.5"
    restart: always

  postgres:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    environment:
      POSTGRES_DB: accounting_ia
      POSTGRES_USER: ia_user
      POSTGRES_PASSWORD: ia_password
    deploy:
      resources:
        limits:
          memory: 4G
          cpus: "2.0"
    restart: always

  mlflow:
    image: ghcr.io/mlflow/mlflow:v2.10
    ports:
      - "5000:5000"
    environment:
      - MLFLOW_BACKEND_STORE=postgresql://ia_user:ia_password@postgres:5432/accounting_ia
      - MLFLOW_ARTIFACT_ROOT=/mlflow/artifacts
      - MLFLOW_TRACKING_URI=http://mlflow:5000
    volumes:
      - mlflow_artifacts:/mlflow/artifacts
    depends_on:
      - postgres
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: "0.5"
    restart: always

  minio:
    image: minio/minio:latest
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data
    environment:
      MINIO_ROOT_USER: ia_minio
      MINIO_ROOT_PASSWORD: ia_minio_password123
    command: server /data --console-address ":9001"
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: "0.5"
    restart: always

volumes:
  tesseract_data:
  model-store:
  redis_data:
  rabbitmq_data:
  postgres_data:
  mlflow_artifacts:
  minio_data:
```

## 6.2 GPU pour ML (optionnel)

GPU recommandé uniquement pour :
- Entraînement LSTM / Deep Learning
- Inférence à haute volume (>1000 req/s)
- Traitement batch (OCR massif)

### Configuration Docker avec GPU

```yaml
  ia-ocr-gpu:
    build:
      context: ./services/ocr
      dockerfile: Dockerfile.gpu
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
    volumes:
      - tesseract_data:/usr/share/tesseract-ocr/4.00/tessdata
    restart: always
```

### Versions CUDA et cuDNN (compatibilité TensorFlow/PyTorch)

| Framework | CUDA | cuDNN | Image Docker |
|-----------|------|-------|--------------|
| TensorFlow 2.15 | 12.2 | 8.9 | `tensorflow/tensorflow:2.15.0-gpu` |
| PyTorch 2.2 | 12.1 | 8.9 | `pytorch/pytorch:2.2.0-cuda12.1-cudnn8-runtime` |
| PaddleOCR | 11.8 | 8.7 | `paddlepaddle/paddleocr:2.7.0-gpu` |

### Vérification GPU dans le conteneur

```python
import tensorflow as tf
print("GPU disponible:", tf.config.list_physical_devices("GPU"))
```

## 6.3 Stockage des modèles

### Architecture de stockage

```
Model Store (MinIO/S3)
  models/categorization/
    global_v1.json
    org_123_v5.json
    org_123_v5_meta.json
  models/cashflow/
    prophet_12M.pkl
    sarima_weekly.pkl
    lstm_60d.h5
  models/anomaly/
    isolation_forest_v1.pkl
    scaler_v1.pkl
  models/ocr/
    tesseract_fra.traineddata
    yolo_facture_v3.pt
```

### Versionnement et registre MLflow

```python
import mlflow
import mlflow.xgboost

class ModelRegistry:
    def __init__(self, tracking_uri: str = "http://mlflow:5000"):
        mlflow.set_tracking_uri(tracking_uri)

    def log_categorization_model(
        self, model: xgb.XGBClassifier, org_id: str,
        version: str, metrics: dict, features: list[str],
    ):
        with mlflow.start_run(run_name=f"categorization_{org_id}_{version}"):
            mlflow.log_params(model.get_params())
            mlflow.log_metrics(metrics)
            mlflow.log_param("features", features)
            mlflow.xgboost.log_model(
                model, artifact_path="model",
                registered_model_name=f"categorization/{org_id}",
            )
        mlflow.transition_model_version_stage(
            name=f"categorization/{org_id}",
            version=version,
            stage="Production",
        )

    def load_model(self, model_name: str, version: str = "latest"):
        return mlflow.xgboost.load_model(
            model_uri=f"models:/{model_name}/{version}"
        )
```

### Métadonnées stockées avec chaque modèle

```json
{
  "model_name": "categorization/org_123",
  "version": "v5",
  "created_at": "2026-09-13T02:00:00Z",
  "training_data": {
    "samples": 15420,
    "org_id": "org_123",
    "date_range": ["2024-01-01", "2026-09-01"]
  },
  "metrics": {
    "f1_weighted": 0.9342,
    "precision": 0.9287,
    "recall": 0.9398,
    "accuracy": 0.9312
  },
  "features": ["libelle", "montant", "date", "fournisseur"],
  "validation": {
    "cross_val_score": 0.928,
    "holdout_score": 0.934,
    "drift_score": 0.012
  },
  "deployment": {
    "stage": "Production",
    "deployed_at": "2026-09-13T02:30:00Z",
    "container_id": "ia-categorization-abc123"
  }
}
```

## 6.4 Cache Redis

### Stratégie de cache

| Cache Key Pattern | TTL | Usage |
|-------------------|-----|-------|
| `ia:ocr:{doc_hash}` | 7j | Résultats OCR |
| `ia:categorization:{text_hash}` | 24h | Catégorisation |
| `ia:cashflow:projections:{org_id}` | 1h | Projections |
| `ia:anomaly:recent:{date}` | 6h | Anomalies |
| `ia:org:{id}:model_info` | 1h | Métadonnées modèle |
| `ia:feedback:{org_id}:pending` | 30j | Corrections |

### Configuration Redis avancée

```python
import redis
import json
from functools import wraps

class AICache:
    def __init__(self):
        self.redis = redis.Redis(
            host="redis", port=6379, db=0,
            decode_responses=True,
            max_connections=50,
            socket_timeout=5,
            retry_on_timeout=True,
        )

    def cache_result(self, ttl_seconds: int = 3600):
        def decorator(func):
            @wraps(func)
            def wrapper(*args, **kwargs):
                cache_key = self._generate_key(func.__name__, args, kwargs)
                cached = self.redis.get(cache_key)
                if cached:
                    return json.loads(cached)
                result = func(*args, **kwargs)
                self.redis.setex(cache_key, ttl_seconds, json.dumps(result))
                return result
            return wrapper
        return decorator

    def invalidate_pattern(self, pattern: str):
        keys = self.redis.keys(pattern)
        if keys:
            self.redis.delete(*keys)

    def get_stats(self) -> dict:
        info = self.redis.info("stats")
        hits = info.get("keyspace_hits", 0)
        misses = info.get("keyspace_misses", 0)
        return {
            "hits": hits,
            "misses": misses,
            "hit_rate": hits / max(hits + misses, 1),
            "memory_used_mb": info.get("used_memory_human"),
            "connected_clients": info.get("connected_clients"),
        }

    def _generate_key(self, func_name: str, args, kwargs) -> str:
        import hashlib
        key_data = f"{func_name}:{args}:{sorted(kwargs.items())}"
        return f"ia:cache:{hashlib.sha256(key_data.encode()).hexdigest()[:16]}"
```

---

# 7. API Endpoints

## 7.1 Convention de routes

Tous les endpoints suivent la convention REST :
- Base URL : `/api/v1/ia`
- Authentification : Header `Authorization: Bearer <JWT>`
- Réponses d'erreur : format standardisé avec `code`, `message`, `details`

```json
{
  "error": {
    "code": "IA_PROCESSING_ERROR",
    "message": "Erreur lors du traitement OCR",
    "details": { "document_id": "doc_123" }
  }
}
```

## 7.2 OCR Endpoints

| Méthode | Endpoint | Description | Body |
|---------|----------|-------------|------|
| `POST` | `/ia/ocr/process` | Traitement OCR complet | Upload fichier image |
| `POST` | `/ia/ocr/extract-fields` | Extraction champs uniquement | `{document_id}` |
| `POST` | `/ia/ocr/validate` | Validation croisée montants | `{document_id}` |
| `GET` | `/ia/ocr/status/{id}` | Statut traitement | - |
| `POST` | `/ia/ocr/batch` | Traitement batch | Upload ZIP multi-images |

### POST /ia/ocr/process

```http
POST /api/v1/ia/ocr/process
Content-Type: multipart/form-data
Authorization: Bearer eyJhbG...

-- Boundary
Content-Disposition: form-data; name="file"; filename="facture_2024.pdf"
Content-Type: image/png

<binary image data>
-- Boundary
Content-Disposition: form-data; name="language"

fra
-- Boundary--
```

**Response 200 OK:**
```json
{
  "document_id": "doc_a1b2c3",
  "processing_time_ms": 1250,
  "ocr": {
    "raw_text": "Facture N° 12345...",
    "confidence_avg": 0.9412,
    "requires_fallback": false,
    "language_detected": "fra"
  },
  "fields": {
    "montant_ht": "1250.00",
    "montant_tva": "250.00",
    "montant_ttc": "1500.00",
    "date_facture": "15/06/2024",
    "numero_facture": "FAC-2024-00123"
  },
  "validation": {
    "est_valide": true,
    "ecart_ht_ttc": null,
    "erreurs": []
  }
}
```

## 7.3 Catégorisation Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/ia/categorize` | Catégoriser une transaction |
| `POST` | `/ia/categorize/batch` | Catégorisation batch |
| `GET` | `/ia/categorize/model-info/{org_id}` | Infos modèle chargé |
| `POST` | `/ia/categorize/feedback` | Soumettre correction |
| `GET` | `/ia/categorize/stats/{org_id}` | Statistiques modèle |

### POST /ia/categorize

```http
POST /api/v1/ia/categorize
Content-Type: application/json
Authorization: Bearer eyJhbG...

{
  "transaction_id": "txn_001",
  "libelle": "Fournitures bureau Bureau Vallée",
  "montant": 45.50,
  "date": "2024-06-15",
  "fournisseur": "Bureau Vallée",
  "org_id": "org_123"
}
```

**Response 200 OK:**
```json
{
  "transaction_id": "txn_001",
  "categorie_predite": "charges_administratives",
  "confiance": 0.92,
  "top3": [
    { "categorie": "charges_administratives", "probability": 0.92 },
    { "categorie": "achats_matieres_premieres", "probability": 0.05 },
    { "categorie": "charges_commerciales", "probability": 0.02 }
  ],
  "model_version": "v5",
  "processing_time_ms": 12
}
```

### POST /ia/categorize/feedback

```http
POST /api/v1/ia/categorize/feedback
Content-Type: application/json

{
  "transaction_id": "txn_001",
  "predicted_category": "charges_administratives",
  "corrected_category": "achats_commerciales",
  "confidence": 0.92
}
```

## 7.4 Trésorerie Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/ia/cashflow/projections` | Générer projections |
| `GET` | `/ia/cashflow/projections/{org_id}/{horizon}` | Projections enregistrées |
| `GET` | `/ia/cashflow/projections/{org_id}/{horizon}/detail` | Détail jour par jour |
| `POST` | `/ia/cashflow/invoices` | Ajouter facture en attente |
| `GET` | `/ia/cashflow/health` | Santé service |

### POST /ia/cashflow/projections

```http
POST /api/v1/ia/cashflow/projections
Content-Type: application/json

{
  "org_id": "org_123",
  "horizon": "6M",
  "include_confidence": true,
  "transactions": [
    { "date": "2024-01-01", "montant": 15000.00 },
    { "date": "2024-01-02", "montant": -3200.00 }
  ],
  "invoices_pending": [
    { "date_echeance": "2024-07-15", "montant_attendu": 5000.00 }
  ],
  "recurrent_expenses": [
    { "description": "Loyer", "montant_mensuel": 2000.00, "date_debut": "2024-01-01" },
    { "description": "Salaire", "montant_mensuel": 15000.00, "date_debut": "2024-01-01" }
  ]
}
```

**Response 200 OK:**
```json
{
  "prophet": {
    "3M": {
      "total_predicted": 42500.00,
      "total_lower": 38000.00,
      "total_upper": 47000.00,
      "avg_daily": 472.22
    },
    "6M": { "summary": { ... } },
    "12M": { "summary": { ... } }
  },
  "sarima": { "dates": [...], "predicted": [...], "confidence_lower": [...], "confidence_upper": [...] },
  "generated_at": "2024-06-20T10:30:00Z"
}
```

## 7.5 Détection d'anomalies Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/ia/anomaly/detect` | Détection sur batch |
| `POST` | `/ia/anomaly/duplicates` | Détection doublons |
| `POST` | `/ia/anomaly/rules` | Évaluation règles |
| `GET` | `/ia/anomaly/summary/{org_id}` | Résumé période |
| `POST` | `/ia/anomaly/flag/{tx_id}` | Signaler transaction |

### POST /ia/anomaly/detect

```http
POST /api/v1/ia/anomaly/detect
Content-Type: application/json

{
  "org_id": "org_123",
  "date_from": "2024-05-01",
  "date_to": "2024-06-20",
  "methods": ["zscore", "isolation_forest", "rules"],
  "params": {
    "zscore_threshold": 3.0,
    "contamination": 0.01
  }
}
```

**Response 200 OK:**
```json
{
  "total_transactions": 1542,
  "anomalies_detected": 23,
  "anomaly_rate": 1.49,
  "severity_breakdown": { "critical": 3, "warning": 18, "fraud": 2 },
  "duplicates": [
    { "transaction_ids": ["tx_1", "tx_2"], "fournisseur": "Orange", "montant": 59.99, "type": "doublon_potentiel", "severity": "critical" }
  ],
  "rule_violations": [
    { "transaction_id": "tx_5", "rule_name": "montant_negatif", "severity": "critical", "description": "Montant negatif: -1250.00EUR", "action": "flag_for_review" }
  ]
}
```

## 7.6 Monitoring Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/ia/health` | Santé globale |
| `GET` | `/ia/health/ready` | Prêt (readiness) |
| `GET` | `/ia/metrics` | Métriques Prometheus |
| `GET` | `/ia/models/list` | Liste modèles chargés |
| `POST` | `/ia/models/reload` | Rechargement modèles |

### GET /ia/health

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "services": {
    "ocr": { "status": "ready", "engine": "tesseract", "gpu": false },
    "categorization": { "status": "ready", "model": "v5", "orgs_loaded": 3 },
    "cashflow": { "status": "ready", "last_prediction": "2024-06-20T10:00:00Z" },
    "anomaly": { "status": "ready", "last_detection": "2024-06-20T09:00:00Z" }
  },
  "redis": { "hit_rate": 0.87, "memory_mb": 512 },
  "uptime_seconds": 86400
}
```

---

# 8. Stratégie de déploiement

## 8.1 Deux modes de déploiement

| Critère | Modèles pré-entraînés | Entraînement sur place |
|---------|------------------------|------------------------|
| **Temps de mise en production** | Immédiat | Semaines |
| **Données nécessaires** | Aucune (500+ transactions minimum) | Historique complet |
| **Précision initiale** | 82-88% | 90-96% |
| **Maintenance** | Mise à jour version MLflow | Auto-géré |
| **Coût** | Faible (CPU uniquement) | Moyen (GPU recommandé) |
| **Personnalisation** | Limitée | Totale |
| **Recommandé pour** | Démarrage rapide, PME | Grande entreprise, secteur spécifique |

## 8.2 Déploiement avec modèles pré-entraînés (mode par défaut)

### 8.2.1 Workflow de démarrage

```
1. Déployer conteneurs (Docker Compose)
2. Télécharger modèles pré-entraînés via MLflow
3. Charger modèle global dans chaque service
4. Mode shadow : prédictions loggées sans application
5. Après N transactions, passage en mode actif (confidence threshold)
6. Feedback loop active pour amélioration progressive
```

### 8.2.2 Script de déploiement

```bash
#!/bin/bash
set -e
COMPOSE_FILE="docker-compose.yml"
MODEL_VERSION="v1.0"
ORG_ID="${1:-default}"
echo "==> Deployement module IA - Version ${MODEL_VERSION}"
docker compose -f $COMPOSE_FILE build --no-cache
docker compose -f $COMPOSE_FILE up -d rabbitmq redis postgres minio mlflow
sleep 30
python scripts/download_models.py --version $MODEL_VERSION --org $ORG_ID
docker compose -f $COMPOSE_FILE up -d ia-ocr ia-categorization ia-cashflow ia-anomaly
docker compose -f $COMPOSE_FILE up -d api-gateway
echo "==> Verification santé..."
for i in {1..30}; do
    STATUS=$(curl -s http://localhost:8080/ia/health | python -c "import sys,json; print(json.load(sys.stdin)['status'])")
    if [ "$STATUS" = "healthy" ]; then echo "==> Services IA operationnels"; break; fi
    echo "Attente... ($i/30)"; sleep 5
done
echo "==> Deploiement termine"
```

### 8.2.3 Modèles pré-entraînés disponibles

| Service | Modèle | Langue/Portée | Taille | Précision |
|---------|--------|---------------|--------|-----------|
| OCR | `tesseract_fra` | Français | 25 MB | - |
| OCR | `tesseract_multi` | FR+EN+DE+ES | 80 MB | - |
| OCR | `paddleocr_fra` | Français | 150 MB | 93% |
| OCR | `yolo_facture_v3` | Layout factures | 12 MB | 95% |
| Catégorisation | `categorization_global_v5` | Général FR | 15 MB | 91% F1 |
| Catégorisation | `categorization_artisanat_v3` | Artisanat FR | 12 MB | 89% F1 |
| Trésorerie | `prophet_fr_monthly` | FR, mensuel | 8 MB | - |
| Anomalies | `isolation_finance_v1` | Transactions FR | 5 MB | - |

## 8.3 Entraînement sur place (on-premise)

### 8.3.1 Workflow d'entraînement

```
Collecte donnees historiques (6+ mois)
         │
         ▼
Preparation features + nettoyage
         │
         ▼
Entrainement modele global
         │
         ▼
Validation croisée (5-fold)
         │
         ▼
Fine-tuning par organisation
         │
         ▼
Validation A/B (shadow mode, 24-48h)
         │
         ▼
Promotion Production (si F1 >= threshold)
         │
         ▼
Deploiement canary (10% -> 50% -> 100%)
```

### 8.3.2 Script d'entraînement complet

```python
# scripts/train_full_pipeline.py
import argparse
import sys
sys.path.insert(0, ".")
from services.categorization import CategorizationModel, OrganizationFineTuner
from services.cashflow import CashFlowPredictionService
from services.anomaly import AnomalyDetectionService
from infrastructure.model_registry import ModelRegistry

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--org-id", required=True)
    parser.add_argument("--data-path", required=True)
    parser.add_argument("--epochs", type=int, default=100)
    args = parser.parse_args()

    import pandas as pd
    transactions = pd.read_csv(f"{args.data_path}/transactions.csv")
    print(f"Loaded {len(transactions)} transactions for {args.org_id}")

    print("==> Entrainement categorisation...")
    model = CategorizationModel()
    X, y = prepare_training_data(transactions)
    cat_results = model.train(X, y)
    print(f"Mean F1: {cat_results.get('mean_f1', 'N/A')}")

    print("==> Fine-tuning organisation...")
    finetuner = OrganizationFineTuner(model)
    org_data = transactions[transactions["org_id"] == args.org_id]
    ft_results = finetuner.fine_tune(args.org_id, org_data.to_dict("records"))

    print("==> Enregistrement modèles...")
    registry = ModelRegistry()
    registry.log_categorization_model(
        model=model.model, org_id=args.org_id,
        version="v_new", metrics=cat_results,
        features=["libelle", "montant", "date", "fournisseur"],
    )

    print("==> Entrainement tresorerie...")
    cashflow = CashFlowPredictionService()
    projections = cashflow.generate_projections(
        transactions=transactions, invoices=pd.DataFrame(),
    )

    print("==> Validation...")
    if cat_results.get("mean_f1", 0) >= 0.85:
        print("==> PASS: Passage en mode Production possible")
        deploy_canary(args.org_id, "categorization")
    else:
        print("==> FAIL: F1 insuffisant")
        sys.exit(1)

if __name__ == "__main__":
    main()
```

## 8.4 Stratégie de déploiement progressif (Canary)

```
                    ┌──────────────┐
                    │ Nouveau modele│
                    │  v_next      │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │  Canary 5%   │────→ OK ?
                    │  24h         │     │
                    └──────┬───────┘     │ Non -> Rollback
                           │             │
                      OK │
                    ┌──────▼───────┐
                    │  Canary 25%  │────→ OK ?
                    │  48h         │     │
                    └──────┬───────┘     │ Non -> Rollback
                           │             │
                      OK │
                    ┌──────▼───────┐
                    │  Canary 50%  │────→ OK ?
                    │  72h         │     │
                    └──────┬───────┘     │ Non -> Rollback
                           │             │
                      OK │
                    ┌──────▼───────┐
                    │  Production  │
                    │  100%        │
                    └──────────────┘
```

### Métriques de décision

| Métrique | Seuil promotion | Seuil rollback |
|----------|-----------------|----------------|
| **F1 Score** | >= modèle actuel | < modèle - 0.02 |
| **Latence P95** | < 200ms | > 500ms |
| **Erreur rate** | < 0.1% | > 1% |
| **Confiance moyenne** | >= modèle actuel | < modèle - 5% |

## 8.5 CI/CD pour modèles ML

```yaml
# .github/workflows/ml-deploy.yml
name: ML Model Deploy
on:
  push:
    paths:
      - 'services/**'
      - 'models/**'
      - 'scripts/train_*.py'
jobs:
  train:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Python
        uses: actions/setup-python@v5
        with: { python-version: '3.11' }
      - name: Install dependencies
        run: pip install -r requirements-ml.txt
      - name: Train model
        run: python scripts/train_full_pipeline.py --org-id ${{ secrets.ORG_ID }} --data-path data/
      - name: Validate model
        run: python scripts/validate_model.py --threshold 0.85
      - name: Register model
        run: python scripts/register_model.py --version v${{ github.run_number }}
        env:
          MLFLOW_TRACKING_URI: ${{ secrets.MLFLOW_URI }}

  deploy:
    needs: train
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Deploy canary
        run: docker compose -f docker-compose.prod.yml up -d --no-deps ia-categorization
      - name: Wait for canary
        run: sleep 300
      - name: Verify canary
        run: python scripts/verify_deployment.py --canary --timeout 300
      - name: Promote to production
        run: docker compose -f docker-compose.prod.yml restart ia-categorization
      - name: Smoke test
        run: curl -f http://localhost:8080/ia/health || exit 1

  rollback:
    if: failure()
    runs-on: ubuntu-latest
    steps:
      - name: Rollback model
        run: |
          docker compose -f docker-compose.prod.yml run --rm ia-categorization \
            python scripts/rollback.py --version ${{ env.PREVIOUS_VERSION }}
      - name: Smoke test
        run: curl -f http://localhost:8080/ia/health || exit 1
```

## 8.6 Environnements

| Environnement | Usage | Données | Modèles | Resources |
|---------------|-------|---------|---------|-----------|
| **Dev** | Developpement local | Mock/synthetiques | Pre-entraînés | 4GB RAM, CPU |
| **Staging** | Tests integration | Données réelles anonymisées | Pre-entraînés | 8GB RAM, CPU |
| **Prod-Small** | PME (<1000 factures/mois) | Réelles | Pre-entraînés + fine-tuned | 16GB RAM, 4 CPU |
| **Prod-Large** | Entreprise (>10k factures/mois) | Réelles | Fine-tunés | 32GB RAM, 8 CPU, GPU opt. |

## 8.7 Monitoring et alertes

### Métriques à surveiller

```yaml
# docker-compose.monitoring.yml
services:
  prometheus:
    image: prom/prometheus:latest
    ports: ["9090:9090"]
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
  grafana:
    image: grafana/grafana:latest
    ports: ["3000:3000"]
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASS}
    volumes:
      - grafana_data:/var/lib/grafana
  alertmanager:
    image: prom/alertmanager:latest
    ports: ["9093:9093"]
```

### Dashboards Grafana recommandés

1. **Performance IA** : Latence, débit, taux d'erreur par service
2. **Précision modèles** : F1, précision, rappel par modèle/org
3. **Utilisation ressources** : CPU, RAM, GPU, disque
4. **Cache** : Hit rate, evictions, mémoire
5. **MLflow** : Versions modèles, expériences, métriques

### Alertes configurées

| Alerte | Condition | Action |
|--------|-----------|--------|
| Model drift | PSI > 0.2 | PagerDuty -> Data scientist |
| Latence P95 > 500ms | 5min sustained | Auto-scale + page on-call |
| Erreur rate > 1% | 1min sustained | PagerDuty |
| OOM | Any | Auto-restart + page |
| GPU full | Utilisation > 95% | Alert |
| Cache hit rate < 50% | 1h sustained | Investigation |

---

# Annexes

## A. Dépendances Python (requirements-ml.txt)

```
# OCR
pytesseract>=0.3.10
Pillow>=10.2.0
opencv-python>=4.9.0
paddleocr>=2.7.0
# ML
xgboost>=2.0.3
scikit-learn>=1.4.0
prophet>=1.1.4
statsmodels>=0.14.1
tensorflow>=2.15.0
ultralytics>=8.1.0
# Infrastructure
mlflow>=2.10.0
redis>=5.0.1
joblib>=1.3.2
minio>=7.1.0
# API
fastapi>=0.109.0
uvicorn>=0.27.0
pydantic>=2.5.3
python-multipart>=0.0.9
# Data
pandas>=2.2.0
numpy>=1.26.3
scipy>=1.12.0
```

## B. Structure des répertoires

```
Application_Comptable/
├── docs/
│   └── architecture/
│       └── module_ia_complet.md
├── services/
│   ├── ocr/
│   │   ├── Dockerfile
│   │   ├── Dockerfile.gpu
│   │   ├── app.py
│   │   ├── ocr_engine.py
│   │   ├── preprocessing.py
│   │   └── validation.py
│   ├── categorization/
│   │   ├── Dockerfile
│   │   ├── app.py
│   │   ├── model.py
│   │   ├── fine_tuner.py
│   │   └── feedback.py
│   ├── cashflow/
│   │   ├── Dockerfile
│   │   ├── app.py
│   │   ├── prophet_service.py
│   │   ├── sarima_service.py
│   │   └── lstm_service.py
│   └── anomaly/
│       ├── Dockerfile
│       ├── app.py
│       ├── detectors/
│       │   ├── zscore.py
│       │   ├── isolation_forest.py
│       │   └── rules.py
│       └── pipeline.py
├── scripts/
│   ├── download_models.py
│   ├── train_full_pipeline.py
│   ├── validate_model.py
│   ├── register_model.py
│   ├── deploy_canary.py
│   └── rollback.py
├── monitoring/
│   ├── prometheus.yml
│   ├── grafana_dashboards/
│   └── alert_rules.yml
├── docker-compose.yml
├── docker-compose.prod.yml
├── docker-compose.monitoring.yml
├── nginx/
│   └── nginx.conf
└── models/
    ├── ocr/
    └── categorization/
```

---

> Fin du document - Module IA v1.0 - 2026-09-13
