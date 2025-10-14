# 🏃‍♂️ Sportly - Plateforme Sportive

Sportly est une plateforme moderne qui connecte les passionnés de sport avec les clubs et événements sportifs. Construite avec **Nuxt 4**, **Better Auth**, **Drizzle ORM**, et **Nuxt UI**.

## 🚀 Fonctionnalités

- ✅ **Authentification multi-tenant** (Utilisateurs & Clubs)
- ✅ **Interface moderne** avec Nuxt UI
- ✅ **Base de données robuste** avec Drizzle ORM
- ✅ **Gestion des événements** sportifs
- ✅ **Système de favoris** et notifications
- ✅ **Dashboards différenciés** selon le type d'utilisateur
- 🔄 **Paiements sécurisés** (à venir)
- 🔄 **Géolocalisation** (à venir)

## 🛠️ Stack Technique

- **Frontend**: Nuxt 4, Vue 3, Nuxt UI, TailwindCSS
- **Backend**: Nitro, Better Auth
- **Base de données**: PostgreSQL, Drizzle ORM
- **Authentification**: Better Auth (email/password)
- **Styling**: Nuxt UI + TailwindCSS
- **TypeScript**: Support complet

## 📋 Prérequis

- Node.js >= 22.0.0
- PostgreSQL
- pnpm (recommandé)

## ⚡ Installation

1. **Cloner le projet**
```bash
git clone <repository-url>
cd sportly
```

2. **Installer les dépendances**
```bash
pnpm install
```

3. **Configuration de l'environnement**
```bash
cp .env.example .env
```

Remplir les variables dans `.env`:
```env
# Base de données
DATABASE_URL="postgresql://username:password@localhost:5432/sportly"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"

# Optionnel (pour plus tard)
STRIPE_SECRET_KEY=""
RESEND_API_KEY=""
```

4. **Préparer la base de données**
```bash
# Générer les migrations
pnpm db:generate

# Appliquer les migrations
pnpm db:migrate

# Ou pousser directement le schéma (développement)
pnpm db:push
```

## 🚀 Démarrage

### Serveur de développement
```bash
pnpm dev
```
L'application sera disponible sur `http://localhost:3000`

### Studio Drizzle (optionnel)
```bash
pnpm db:studio
```
Interface graphique pour explorer la base de données sur `http://localhost:4983`

## 📱 Utilisation

### Première connexion

1. **Accéder à la page d'accueil**: `http://localhost:3000`
2. **Créer un compte**: Cliquer sur "S'inscrire" 
3. **Choisir le type**: Utilisateur ou Club
4. **Remplir le formulaire** d'inscription
5. **Accéder au dashboard** correspondant

### Types d'utilisateurs

#### 👤 Utilisateur
- Dashboard personnel avec événements à venir
- Recherche et inscription aux événements
- Gestion des favoris et connexions
- Profil personnalisable

#### 🏢 Club
- Dashboard de gestion du club
- Création et gestion d'événements
- Statistiques et inscriptions
- Gestion des avis et membres

## 🗂️ Structure du projet

```
sportly/
├── 📁 db/                    # Base de données
│   ├── 📁 schema/           # Schémas Drizzle
│   └── 📄 index.ts          # Configuration DB
├── 📁 lib/                  # Bibliothèques
│   ├── 📄 auth.ts           # Configuration Better Auth
│   └── 📄 auth-client.ts    # Client d'authentification
├── 📁 composables/          # Composables Vue
│   └── 📄 useAuth.ts        # Gestion de l'authentification
├── 📁 middleware/           # Middlewares Nuxt
│   ├── 📄 auth.ts           # Protection des pages
│   └── 📄 guest.ts          # Pages invités uniquement
├── 📁 pages/                # Pages de l'application
│   ├── 📁 auth/             # Authentification
│   ├── 📁 dashboard/        # Dashboards
│   └── 📄 index.vue         # Page d'accueil
├── 📁 layouts/              # Layouts
│   └── 📄 default.vue       # Layout principal
├── 📁 server/               # API Nitro
│   └── 📁 api/auth/         # Routes d'authentification
└── 📄 nuxt.config.ts        # Configuration Nuxt
```

## 🎨 Schéma de base de données

Le projet utilise un schéma complet basé sur le MCD fourni :

### Tables principales
- `accounts` - Comptes utilisateurs/clubs
- `users` - Profils utilisateurs
- `clubs` - Profils clubs
- `events` - Événements sportifs
- `sports` - Référentiel des sports
- `addresses` - Adresses et géolocalisation

### Authentification (Better Auth)
- `sessions` - Sessions utilisateur
- `oauth_accounts` - Comptes OAuth (futur)
- `verification_codes` - Codes de vérification
- `password_resets` - Réinitialisations de mot de passe

## 🔧 Scripts disponibles

```bash
# Développement
pnpm dev                 # Serveur de développement
pnpm build              # Build de production
pnpm preview            # Aperçu de production

# Base de données
pnpm db:generate        # Générer les migrations
pnpm db:migrate         # Appliquer les migrations
pnpm db:push           # Pousser le schéma (dev)
pnpm db:studio         # Interface Drizzle Studio

# Code quality
pnpm lint              # Linter ESLint
pnpm lint:fix          # Corriger automatiquement
```

## 🚀 Déploiement

### Production
```bash
pnpm build
pnpm preview
```

### Variables d'environnement production
Assurez-vous de configurer :
- `DATABASE_URL` - URL de la base de données
- `BETTER_AUTH_SECRET` - Clé secrète (générer une nouvelle)
- `BETTER_AUTH_URL` - URL publique de l'application

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Roadmap

- [ ] **OAuth Providers** (Google, Facebook, Apple)
- [ ] **Paiements Stripe** pour les événements
- [ ] **Géolocalisation** et recherche par proximité
- [ ] **Notifications push**
- [ ] **Chat en temps réel**
- [ ] **Application mobile** (Nuxt + Capacitor)
- [ ] **API publique** pour les partenaires

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Consulter la documentation Nuxt : https://nuxt.com
- Documentation Better Auth : https://better-auth.com
- Documentation Drizzle : https://orm.drizzle.team
