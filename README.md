# MAD Shop 🛍️

Boutique e-commerce **MAD Shop** — « La qualité à petit prix ».
Audio, sécurité et objets connectés. Direction artistique luxe sombre,
accent doré et signature tricolore 🇮🇹, calée sur le logo.

## Stack

- **Next.js 16** (App Router, Server Components, Turbopack) + **TypeScript**
- **Tailwind CSS v4** (design system maison dans `app/globals.css`)
- **Framer Motion** (`motion`) — animations et transitions
- **Zustand** — panier persistant
- **Stripe Checkout** — paiement
- **Resend** — emails (commande, réservation, contact)
- **Claude (Anthropic)** — assistant client IA
- **Zod** — validation des entrées serveur

## Fonctionnalités

- 🏠 Accueil éditorial animé (hero, piliers testé/approuvé, best-sellers, spotlight)
- 🧭 Boutique avec filtres par catégorie
- 📦 Fiches produits (galerie, specs, SEO JSON-LD, produits liés)
- 🛒 Panier (tiroir animé + page détaillée)
- 📌 Réservation de produit sans paiement (→ email)
- 💳 Paiement Stripe (prix recalculés côté serveur)
- ✉️ Emails de confirmation via Resend + webhook Stripe
- 🤖 Assistant IA streamé (Claude Haiku) connaissant le catalogue
- ♿ Accessible, responsive, `prefers-reduced-motion`, SEO (sitemap/robots/OG)

> Le site tourne **sans aucune clé** (mode démo) : paiement, emails et IA
> s'activent automatiquement dès que les variables d'environnement sont présentes.

## Démarrer en local

```bash
npm install
cp .env.example .env.local   # (optionnel) renseignez vos clés
npm run dev                  # http://localhost:3000
```

## Personnaliser

| Quoi | Où |
|---|---|
| Produits, prix, textes | `lib/products.ts` |
| Photos produits | `public/products/` (voir son README) |
| Couleurs / typo / DA | `app/globals.css` (`@theme`) |
| Clés & intégrations | `.env.local` (modèle : `.env.example`) |

## Déploiement

Voir **[DEPLOIEMENT-HOSTINGER.md](./DEPLOIEMENT-HOSTINGER.md)**.

## Scripts

```bash
npm run dev     # développement
npm run build   # build de production (standalone)
npm run start   # servir le build
npm run lint    # linter
```
