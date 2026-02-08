# Documentation API Gestion Étudiants

## Introduction

Cette API REST permet de gérer les étudiants, les utilisateurs, l'historique des actions et l'export des données. Elle est développée avec Node.js et Express.js, utilisant une base de données MySQL.

**Base URL :** `http://localhost:3000/api`

**Format des réponses :** JSON avec la structure `{success: boolean, data/message/error: ...}`

**Codes d'erreur courants :**
- 400 : Champs manquants ou invalides
- 401 : Non autorisé (token manquant ou invalide)
- 404 : Ressource non trouvée
- 500 : Erreur serveur

## Authentification

Certaines routes nécessitent une authentification via un token Bearer dans l'en-tête `Authorization`.

Pour obtenir un token, utilisez l'endpoint de connexion. Le token doit être inclus dans les requêtes comme suit :
```
Authorization: Bearer <token>
```

## Endpoints

### Authentification

#### POST /api/auth/connexion

**Description :** Connexion d'un utilisateur. Si c'est la première connexion (utilisateur n'existe pas), un compte admin est créé automatiquement.

**Authentification :** Non requise

**Paramètres :**
- **Body (JSON) :**
  - `nom` (string, requis) : Nom de l'utilisateur
  - `email` (string, requis) : Email de l'utilisateur
  - `password` (string, requis) : Mot de passe

**Réponse :**
- **200 :** `{success: true, token: string, firstConnexion: boolean}`
- **400 :** `{success: false, message: "Champs requis manquants"}`
- **401 :** `{success: false, message: "Identifiants invalides"}`

**Exemple :**
```
POST /api/auth/connexion
Content-Type: application/json

{
  "nom": "Admin",
  "email": "admin@example.com",
  "password": "password123"
}
```

### Profil Utilisateur

#### GET /api/profil

**Description :** Récupère les informations du profil de l'utilisateur connecté.

**Authentification :** Requise (Bearer token)

**Paramètres :** Aucun

**Réponse :**
- **200 :** `{success: true, utilisateur: {id: number, nom: string, email: string}}`
- **404 :** `{success: false, message: "Utilisateur non trouvé"}`

**Exemple :**
```
GET /api/profil
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### PUT /api/profil

**Description :** Met à jour le nom et/ou l'email de l'utilisateur connecté.

**Authentification :** Requise

**Paramètres :**
- **Body (JSON) :**
  - `nom` (string, optionnel) : Nouveau nom
  - `email` (string, optionnel) : Nouvel email

**Réponse :**
- **200 :** `{success: true, message: "Profil mis à jour"}`
- **400 :** `{success: false, message: "Nom ou email requis"}`

**Exemple :**
```
PUT /api/profil
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "nom": "Nouveau Nom"
}
```

#### PUT /api/profil/password

**Description :** Change le mot de passe de l'utilisateur connecté.

**Authentification :** Requise

**Paramètres :**
- **Body (JSON) :**
  - `oldPassword` (string, requis) : Ancien mot de passe
  - `newPassword` (string, requis) : Nouveau mot de passe

**Réponse :**
- **200 :** `{success: true, message: "Mot de passe mis à jour"}`
- **400 :** `{success: false, message: "Ancien et nouveau mot de passe requis"}`
- **401 :** `{success: false, message: "Ancien mot de passe incorrect"}`

**Exemple :**
```
PUT /api/profil/password
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "oldPassword": "ancienpass",
  "newPassword": "nouveaupass"
}
```

### Étudiants

*Note : Ces routes ne nécessitent pas d'authentification dans l'implémentation actuelle, mais il est recommandé d'ajouter une protection en production.*

#### GET /api/etudiants

**Description :** Récupère la liste de tous les étudiants actifs (non archivés).

**Authentification :** Non requise

**Paramètres :** Aucun

**Réponse :**
- **200 :** `{success: true, data: [array of étudiants]}`

**Exemple :**
```
GET /api/etudiants
```

#### GET /api/etudiants/:id

**Description :** Récupère les détails d'un étudiant spécifique par son ID.

**Authentification :** Non requise

**Paramètres :**
- **Path :**
  - `id` (number, requis) : ID de l'étudiant

**Réponse :**
- **200 :** `{success: true, data: étudiant}`
- **404 :** `{success: false, message: "Étudiant non trouvé"}`

**Exemple :**
```
GET /api/etudiants/1
```

#### POST /api/etudiants

**Description :** Crée un nouvel étudiant. Un enregistrement est ajouté à l'historique. Si l'inscription n'est pas à jour, une notification est créée.

**Authentification :** Non requise

**Paramètres :**
- **Body (JSON) :**
  - `nom` (string, requis)
  - `prenom` (string, requis)
  - `age` (number, requis)
  - `telephone` (string, requis)
  - `sexe` (string, requis)
  - `niveau` (string, requis)
  - `filiere` (string, requis)
  - `inscription` (string, requis) : "À jour" ou "Non à jour"
  - `nationalite` (string, requis)
  - `autre_nationalite` (string, optionnel) : Si nationalite = "Autre"

**Réponse :**
- **201 :** `{success: true, id: number}`

**Exemple :**
```
POST /api/etudiants
Content-Type: application/json

{
  "nom": "Dupont",
  "prenom": "Jean",
  "age": 20,
  "telephone": "0123456789",
  "sexe": "M",
  "niveau": "L3",
  "filiere": "Informatique",
  "inscription": "À jour",
  "nationalite": "Française"
}
```

#### PUT /api/etudiants/:id

**Description :** Met à jour les informations d'un étudiant. Un enregistrement est ajouté à l'historique.

**Authentification :** Non requise

**Paramètres :**
- **Path :**
  - `id` (number, requis)
- **Body :** Même structure que pour la création

**Réponse :**
- **200 :** `{success: true, message: "Étudiant mis à jour"}`
- **404 :** `{success: false, message: "Étudiant non trouvé"}`

**Exemple :**
```
PUT /api/etudiants/1
Content-Type: application/json

{
  "nom": "Dupont",
  "prenom": "Jean",
  "age": 21,
  "telephone": "0123456789",
  "sexe": "M",
  "niveau": "M1",
  "filiere": "Informatique",
  "inscription": "À jour",
  "nationalite": "Française"
}
```

#### DELETE /api/etudiants/:id

**Description :** Archive un étudiant (suppression douce). Un enregistrement est ajouté à l'historique.

**Authentification :** Non requise

**Paramètres :**
- **Path :**
  - `id` (number, requis)

**Réponse :**
- **200 :** `{success: true, message: "Étudiant archivé"}`
- **404 :** `{success: false, message: "Étudiant non trouvé"}`

**Exemple :**
```
DELETE /api/etudiants/1
```

### Archive

#### GET /api/archive

**Description :** Récupère la liste des étudiants archivés.

**Authentification :** Non requise

**Paramètres :** Aucun

**Réponse :**
- **200 :** `{success: true, data: [array of étudiants archivés]}`

**Exemple :**
```
GET /api/archive
```

#### PUT /api/archive/:id/restore

**Description :** Restaure un étudiant archivé. Un enregistrement est ajouté à l'historique.

**Authentification :** Non requise

**Paramètres :**
- **Path :**
  - `id` (number, requis)

**Réponse :**
- **200 :** `{success: true, message: "Étudiant restauré"}`
- **404 :** `{success: false, message: "Étudiant non trouvé"}`

**Exemple :**
```
PUT /api/archive/1/restore
```

### Historique

#### GET /api/historique

**Description :** Récupère l'historique complet des actions effectuées sur les étudiants.

**Authentification :** Requise

**Paramètres :** Aucun

**Réponse :**
- **200 :** `{success: true, data: [array of {id, etudiant_id, action, details, created_at, nom, prenom}]}`

**Exemple :**
```
GET /api/historique
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Export

#### GET /api/export/excel

**Description :** Exporte la liste des étudiants actifs au format Excel.

**Authentification :** Requise

**Paramètres :** Aucun

**Réponse :** Fichier Excel en attachment (`etudiants.xlsx`)

**Exemple :**
```
GET /api/export/excel
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### GET /api/export/pdf

**Description :** Exporte la liste des étudiants actifs au format PDF.

**Authentification :** Requise

**Paramètres :** Aucun

**Réponse :** Fichier PDF en attachment (`etudiants.pdf`)

**Exemple :**
```
GET /api/export/pdf
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
