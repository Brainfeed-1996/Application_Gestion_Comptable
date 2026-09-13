Tu vas agir en tant qu'Architecte Logiciel Senior, Expert FinTech et Développeur Full-Stack visionnaire. Ta mission est de concevoir et de développer de A à Z une application de gestion comptable de nouvelle génération, intelligente, scalable et ultra-sécurisée. 

CONTEXTE ET VISION DU PROJET :
L'application est un SaaS conçu pour automatiser, centraliser et simplifier la tenue financière d'une entreprise ou d'un indépendant. Elle doit aller au-delà de la simple saisie en devenant un véritable partenaire financier prédictif. Elle permet de suivre en temps réel la santé financière, de simplifier les obligations légales et de centraliser toutes les opérations monétaires, annulant ainsi le risque d'erreur humaine.

STACK TECHNOLOGIQUE REQUISE (Flexible mais recommandée) :
- Backend : Python (FastAPI ou Django) pour sa robustesse, sa rapidité et sa capacité à intégrer de l'IA/Data Science.
- Frontend : TypeScript avec React (Next.js) ou Vue.js (Nuxt), stylisé avec Tailwind CSS pour une interface épurée et moderne.
- Base de données : PostgreSQL (relationnelle pour l'intégrité comptable) et Redis (caching).
- Infrastructure : Conteneurisation avec Docker, architecture micro-services ou monolithe modulaire.

CAHIER DES CHARGES DÉTAILLÉ - MODULES À DÉVELOPPER :

1. MODULE DE SAISIE ET AUTOMATISATION (L'anti-tableur)
- OCR Intégré : Extraction automatique des données depuis des photos ou PDF de reçus/factures (fournisseur, date, montant HT/TTC, TVA).
- Open Banking : Synchronisation bancaire automatique via des API comme Plaid ou Tink.
- Smart Categorization : Catégorisation automatique des dépenses grâce à un algorithme d'apprentissage automatique (Machine Learning).

2. MODULE FACTURATION & VENTES (Cycle de vie client)
- Éditeur de devis/factures interactif : Génération de documents PDF conformes (mentions légales dynamiques, QR Code de paiement).
- Portail Client : Un espace sécurisé où le client peut consulter, accepter un devis, et payer en ligne (intégration Stripe/PayPal).
- Workflows de relance : Scénarios automatisés de relances d'impayés (email/SMS) selon le scoring de risque du client.
- Abonnements : Gestion de la facturation récurrente et du prorata.

3. MODULE TRÉSORERIE & TABLEAU DE BORD (Visionnaire)
- Dashboard 360° : Visualisation en temps réel (Graphiques interactifs, D3.js/Chart.js) du Cash-Flow, du BFR (Besoin en Fonds de Roulement) et du Runaway.
- Prédictif IA : Projection de trésorerie sur 3, 6 et 12 mois basée sur l'historique bancaire, les factures en attente et les dépenses récurrentes.
- Alertes intelligentes : Notification push en cas d'anomalie de trésorerie détectée ou de risque de découvert imminent.

4. MODULE CONFORMITÉ FISCALE & SOCIALE (Frictionless)
- Génération automatique des liasses : Calculs de la TVA (collectée/déductible), pré-remplissage des déclarations.
- Bilan et Compte de Résultat : Génération des états financiers en un clic.
- Export Expert-Comptable : Format FEC (Fichier des Écritures Comptables) sécurisé et export vers les logiciels comptables standards (Cegid, Sage).
- Piste d'audit fiable : Journalisation immuable de chaque action (horodatage, utilisateur, modification) pour prévenir la fraude.

5. SÉCURITÉ ET ARCHITECTURE (Critique)
- Authentification : JWT, OAuth2, et 2FA (MFA) obligatoires.
- RBAC (Role-Based Access Control) : Gestion fine des rôles (Admin, Comptable, Commercial, Employé pour notes de frais).
- Chiffrement : Chiffrement AES-256 des données sensibles en base et TLS pour le transit.
- Protection : Prévention des failles (SQLi, XSS, CSRF, IDOR).

INSTRUCTIONS D'EXÉCUTION POUR KILO CODE :
Ne génère pas tout le code d'un seul coup, cela dépasserait ta fenêtre de contexte. Procède étape par étape en attendant ma validation entre chaque phase :

Étape 1 : Génère l'arborescence complète du projet (Front, Back, Infra).
Étape 2 : Conçois les modèles de base de données (Schéma entité-relation pour Users, Invoices, Transactions, Taxes).
Étape 3 : Écris le backend (Initialisation de l'API, configuration de la DB, endpoints d'authentification).
Étape 4 : Développe la logique métier critique (Moteur de réconciliation bancaire, calculatrice de TVA).
Étape 5 : Crée le Frontend (Composants UI de base, Dashboard principal, Tableaux de données).
Étape 6 : Intègre les fonctionnalités IA (OCR, Prédictions).
Étape 7 : Rédige les fichiers de déploiement (Dockerfile, docker-compose.yml) et les tests unitaires (pytest).

Commence immédiatement par l'Étape 1 et donne-moi l'arborescence détaillée du projet et les instructions d'initialisation.