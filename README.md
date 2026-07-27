# MAD Shop

Boutique e-commerce **MAD Shop** — « La qualité à petit prix ».
Audio, sécurité et objets connectés. Direction artistique sombre, accent doré
et signature tricolore reprise du logo.

## Stack

- **Next.js 16** (App Router, Server Components, Turbopack) + **TypeScript**
- **Tailwind CSS v4** — design system maison dans `app/globals.css`
- **Motion** — animations et transitions
- **Zustand** — panier et favoris persistants
- **Stripe Checkout** — paiement, prix recalculés côté serveur
- **Resend** — emails transactionnels
- **Zod** — validation de toutes les entrées serveur

Aucune base de données : le catalogue, les commandes, les avis et les codes
promo sont persistés en JSON dans `/data`. La couche d'accès est isolée dans
`lib/data/`, pour pouvoir passer à Postgres sans toucher au reste du code.

## Fonctionnalités

**Boutique**
- Accueil éditorial animé, boutique filtrable, recherche instantanée (⌘K)
- Fiches produits : galerie, caractéristiques, avis clients, suggestions
- Panier persistant (tiroir + page), favoris, codes promo
- Réservation sans paiement et alerte de retour en stock
- Suivi de commande par numéro + email
- PWA installable, mode hors ligne de base

**Back-office** (`/admin`)
- Catalogue : création, édition, stocks, envoi d'images
- Commandes, modération des avis, codes promo

**Acquisition**
- Données structurées schema.org (produit, avis, fil d'Ariane, boutique)
- Flux produits `/feed.xml` pour Google Merchant Center et Meta Catalog
- Mesure GA4 / Google Ads / Meta / TikTok avec Consent Mode v2
- `sitemap.xml`, `robots.txt`, vignettes de partage générées

Le site tourne **sans aucune clé** : paiement, emails et mesure s'activent
automatiquement dès que les variables d'environnement correspondantes sont
renseignées.

## Démarrer en local

```bash
npm install
```

```bash
cp .env.example .env.local
```

```bash
npm run dev
```

## Sécurité

- Aucune clé ne doit être écrite dans un fichier versionné. `.env*` est ignoré
  par Git ; `.env.example` et `.env.production` ne contiennent que des modèles.
- `ADMIN_PASSWORD` (12 caractères minimum) et `ADMIN_SECRET` (32 minimum) sont
  obligatoires : sans eux, l'espace d'administration reste inaccessible.
- Toutes les routes publiques sont limitées en débit, les entrées validées par
  Zod et les contenus visiteurs échappés avant tout envoi d'email.
- En-têtes CSP, HSTS, `X-Frame-Options` et `Permissions-Policy` définis dans
  `next.config.ts`.

## Personnaliser

| Quoi | Où |
|---|---|
| Catalogue par défaut | `lib/products.ts` |
| Catalogue en production | back-office `/admin/produits` (écrit `data/catalog.json`) |
| Frais de port, seuils, pays livrés | `lib/config.ts` |
| Couleurs, typographie, direction artistique | `app/globals.css` (`@theme`) |
| Clés et intégrations | `.env.local` (modèle : `.env.example`) |

## Déploiement

Voir **[DEPLOIEMENT-HOSTINGER.md](./DEPLOIEMENT-HOSTINGER.md)**.

## Scripts

```bash
npm run dev
```

```bash
npm run build
```

```bash
npm run start
```

```bash
npm run lint
```
