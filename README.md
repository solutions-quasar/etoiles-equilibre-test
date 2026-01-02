# Étoiles d'Équilibre - Plateforme Énergétique pour Enfants

Une plateforme complète d'accompagnement énergétique pour aider les enfants à retrouver leur équilibre naturel.

## 🌟 Fonctionnalités

### Site Vitrine
- ✅ Page d'accueil avec mission et témoignages
- ✅ Page "Comment ça marche" détaillant le processus
- ✅ Landing page e-book gratuit avec capture de leads
- ✅ Design nature-inspiré avec énergies cosmiques/telluriques

### Plateforme Client
- ✅ Authentification Firebase (inscription/connexion)
- ✅ Tableau de bord personnalisé
- ✅ Modules gratuits et payants
- ✅ Suivi des progrès
- 🔄 Réservation de consultations vidéo (Google Meet)

### Tableau de Bord Admin (ERP)
- ✅ Gestion complète des modules (CRUD)
- ✅ Vue d'ensemble des statistiques
- ✅ Gestion des utilisateurs
- 🔄 Gestion des consultations
- 🔄 Suivi des leads et paiements

## 🚀 Installation et Configuration

### Prérequis
- Compte Firebase (projet: etoiles-equilibre)
- Navigateur moderne
- Serveur local (Live Server, http-server, etc.)

### Configuration Firebase

1. **Firestore Database**
   - Créez les collections selon le schéma dans `firestore-schema.md`
   - Appliquez les règles de sécurité fournies
   - Créez les index composites nécessaires

2. **Authentication**
   - Activez l'authentification par email/mot de passe
   - Configurez les domaines autorisés

3. **Storage**
   - Créez les dossiers: `/modules`, `/ebooks`, `/blog`, `/users`
   - Configurez les règles de sécurité pour le stockage

### Créer un Compte Admin

```javascript
// Dans la console Firebase Authentication, créez un utilisateur:
// Email: admin@etoiles-equilibre.com
// Mot de passe: [votre mot de passe sécurisé]

// Puis dans Firestore, créez un document dans la collection 'users':
{
  uid: "[l'uid de l'utilisateur créé]",
  firstName: "Admin",
  lastName: "Étoiles",
  email: "admin@etoiles-equilibre.com",
  role: "admin",
  createdAt: [timestamp actuel]
}
```

### Lancer le Projet

1. **Avec Live Server (VS Code)**
   ```
   - Ouvrez le dossier dans VS Code
   - Clic droit sur index.html
   - "Open with Live Server"
   ```

2. **Avec http-server (Node.js)**
   ```bash
   npm install -g http-server
   cd "Etoiles equillibre test"
   http-server -p 8080
   ```

3. **Accès**
   - Site public: http://localhost:8080/index.html
   - Connexion: http://localhost:8080/connexion.html
   - Admin: http://localhost:8080/admin/index.html

## 📁 Structure du Projet

```
Etoiles equillibre test/
├── index.html              # Page d'accueil
├── comment-ca-marche.html  # Page processus
├── ebook-gratuit.html      # Landing page e-book
├── connexion.html          # Authentification
├── styles.css              # Design system complet
├── firebase-config.js      # Configuration Firebase
├── firestore-schema.md     # Schéma de base de données
│
├── images/                 # Assets visuels
│   ├── hero_cosmic_tree_*.png
│   ├── how_it_works_*.png
│   ├── energy_balance_*.png
│   ├── ebook_cover_*.png
│   └── module_thumbnails_*.png
│
├── js/                     # Scripts JavaScript
│   ├── main.js            # Fonctions principales
│   ├── auth.js            # Authentification
│   ├── ebook.js           # Capture de leads
│   ├── platform.js        # Plateforme client
│   ├── admin.js           # Dashboard admin
│   └── admin-modules.js   # Gestion modules
│
├── platform/               # Espace client
│   └── index.html         # Dashboard client
│
├── admin/                  # Espace admin
│   ├── index.html         # Dashboard admin
│   └── modules.html       # Gestion modules
│
└── blog/                   # Blog SEO
    └── index.html         # Liste articles
```

## 🎨 Design System

### Palette de Couleurs
- **Cosmic Purple**: Énergies cosmiques
- **Telluric Gold**: Énergies telluriques
- **Healing Green**: Guérison et nature
- **Peaceful Blue**: Calme et sérénité
- **Earth Brown**: Ancrage terrestre

### Typographie
- **Headings**: Outfit (Google Fonts)
- **Body**: Inter (Google Fonts)

## 🔐 Sécurité

- Authentification Firebase
- Règles de sécurité Firestore
- Validation côté client et serveur
- Données sensibles protégées

## 💳 Paiements (À Implémenter)

Le système est préparé pour Stripe:
- Collection `payments` dans Firestore
- Champs de prix dans les modules
- Interface de paiement à connecter

## 📧 Email (À Implémenter)

Pour les rappels et la capture de leads:
- SendGrid, Mailchimp, ou Firebase Extensions
- Templates d'emails à créer
- Automatisation des envois

## 🎯 SEO

### Mots-clés Ciblés
**Simples:**
- troubles de l'attention
- hyperactivité enfant
- solutions naturelles enfant

**Spécifiques:**
- thérapie énergétique enfant
- équilibre énergétique enfant
- accompagnement énergétique naturel

### Optimisations
- Meta tags sur toutes les pages
- Structured data (à implémenter)
- Blog pour contenu SEO
- URLs descriptives

## 📝 Prochaines Étapes

1. **Consultations**
   - Intégrer Google Meet API
   - Système de calendrier
   - Notifications automatiques

2. **Paiements**
   - Intégrer Stripe
   - Webhooks pour confirmations
   - Gestion des abonnements

3. **Email**
   - Service d'envoi d'emails
   - Templates personnalisés
   - Automatisation

4. **Blog**
   - Interface de création d'articles
   - Système de catégories
   - Commentaires (optionnel)

5. **Analytics**
   - Google Analytics
   - Suivi des conversions
   - Rapports personnalisés

## 🆘 Support

Pour toute question:
- Email: contact@etoiles-equilibre.com
- Documentation Firebase: https://firebase.google.com/docs

## 📄 Licence

Propriétaire - Étoiles d'Équilibre © 2026
