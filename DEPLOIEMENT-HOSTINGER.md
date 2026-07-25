# Déployer MAD Shop sur Hostinger

MAD Shop est une application **Next.js 16** avec des fonctions serveur
(paiement Stripe, emails, back-office). Elle ne peut donc **pas** être exportée
en HTML statique : il lui faut un **serveur Node.js**.

Le projet est configuré en `output: "standalone"` : le build produit un serveur
autonome et léger dans `.next/standalone/`.

---

## Pré-requis

1. **Node.js 20+** disponible en local et sur le serveur.
2. Les variables d'environnement du fichier `.env.example` renseignées côté
   hébergeur. Le site fonctionne sans, mais paiement, emails et mesure restent
   en veille.
3. Les photos produits déposées dans `public/products/`.

---

## Point de vigilance : la persistance des données

En mode `standalone`, le serveur démarre depuis `.next/standalone`. Sans
configuration, le catalogue (`data/`) et les images envoyées depuis le
back-office sont écrits **à l'intérieur du dossier de build** — et donc
effacés au déploiement suivant.

Définissez ces deux variables sur des dossiers situés **hors de `.next`** :

```bash
DATA_DIR=/home/user/madshop-data
UPLOAD_DIR=/home/user/madshop-uploads
```

`UPLOAD_DIR` doit être servi publiquement sous `/products/`. Sur un VPS, le
plus simple est un lien symbolique :

```bash
ln -sfn /home/user/madshop-uploads /home/user/app/.next/standalone/public/products
```

Sauvegardez régulièrement `DATA_DIR` : il contient les commandes et les avis.

---

## Méthode A — VPS Hostinger (recommandée)

```bash
npm ci
```

```bash
npm run build
```

`static/` et `public/` ne sont pas copiés automatiquement dans le dossier
autonome :

```bash
cp -r .next/static .next/standalone/.next/static && cp -r public .next/standalone/public
```

Lancement supervisé par PM2 :

```bash
npm i -g pm2 && cd .next/standalone && PORT=3000 pm2 start server.js --name madshop && pm2 save && pm2 startup
```

Puis dans hPanel : pointez le domaine sur le VPS et configurez **Nginx** en
reverse proxy vers `http://localhost:3000`, avec **SSL** (Let's Encrypt).

```nginx
server {
  server_name votredomaine.fr;

  # Les webhooks Stripe et les envois d'images ont besoin de marge.
  client_max_body_size 8M;

  location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

> `X-Forwarded-For` est indispensable : c'est cet en-tête qui permet à la
> limitation de débit de distinguer les visiteurs. Sans lui, toutes les
> requêtes semblent venir de la même adresse.

---

## Méthode B — Hébergement Node.js (hPanel, offres Business/Cloud)

1. hPanel → **Avancé → Node.js** → *Créer une application*
   - Version Node : **20+**
   - Dossier racine : celui de votre upload
   - Fichier de démarrage : `.next/standalone/server.js`
2. Uploadez le projet, ou clonez-le depuis le terminal intégré.
3. Dans le terminal de l'application :

```bash
npm ci && npm run build && cp -r .next/static .next/standalone/.next/static && cp -r public .next/standalone/public
```

4. Renseignez les **variables d'environnement** dans l'interface Node.js,
   en particulier `NEXT_PUBLIC_SITE_URL=https://votredomaine.fr`.
5. Démarrez ou redémarrez l'application.

---

## Configurer les intégrations en production

| Service | À faire |
|---|---|
| **Stripe** | Clés *live* dans `STRIPE_SECRET_KEY` et `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`. Créez un webhook vers `https://votredomaine.fr/api/webhook` en cochant **`checkout.session.completed`** (commande, stock, emails) **et `checkout.session.expired`** (relance des paniers abandonnés — sans lui, aucun email de relance ne part). Collez son secret dans `STRIPE_WEBHOOK_SECRET`. |
| **Administration** | `ADMIN_PASSWORD` (12 caractères minimum) et `ADMIN_SECRET` (`openssl rand -hex 32`). Sans ces valeurs, `/admin` reste inaccessible. |
| **Resend** | Vérifiez le domaine d'envoi, puis renseignez `RESEND_API_KEY`, `EMAIL_FROM` et `EMAIL_TO`. |
| **SEO** | `NEXT_PUBLIC_SITE_URL` conditionne le sitemap, les URL canoniques et les données structurées. |
| **Google Merchant** | Déclarez le flux `https://votredomaine.fr/feed.xml`. Même URL pour un catalogue Meta. |
| **Mesure** | `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_GOOGLE_ADS_ID` + `NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL`, `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_TIKTOK_PIXEL_ID`. |

---

## Mettre à jour le site

```bash
git pull && npm ci && npm run build && cp -r .next/static .next/standalone/.next/static && cp -r public .next/standalone/public && pm2 restart madshop
```

---

## Checklist avant mise en ligne

- [ ] Aucune clé réelle dans un fichier versionné (`git log -p` pour vérifier)
- [ ] `ADMIN_PASSWORD` et `ADMIN_SECRET` définis, forts, jamais commités
- [ ] `DATA_DIR` et `UPLOAD_DIR` pointent sur des dossiers persistants sauvegardés
- [ ] `NEXT_PUBLIC_SITE_URL` = le vrai domaine, en `https://`
- [ ] Webhook Stripe créé et testé, avec `checkout.session.completed` **et** `checkout.session.expired`
- [ ] Domaine d'envoi Resend vérifié
- [ ] SSL actif et redirection HTTP → HTTPS en place (l'en-tête HSTS est envoyé)
- [ ] `X-Forwarded-For` transmis par le reverse proxy
- [ ] Mentions légales complétées (`app/mentions-legales/page.tsx`)
- [ ] Flux `/feed.xml` et `/sitemap.xml` accessibles publiquement
