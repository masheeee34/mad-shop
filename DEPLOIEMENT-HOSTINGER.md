# 🚀 Déployer MAD Shop sur Hostinger

Ce site est une application **Next.js 16** avec des fonctions serveur (paiement Stripe,
emails, assistant IA). Il ne peut donc **pas** être exporté en simple HTML statique :
il lui faut un **serveur Node.js**. Deux méthodes selon votre offre Hostinger.

Le projet est configuré en `output: "standalone"` (voir `next.config.ts`) : le build
génère un serveur autonome et léger dans `.next/standalone/`.

---

## ✅ Pré-requis (à faire une fois)

1. **Node.js 20+** disponible (local et/ou sur le serveur).
2. Vos clés dans les variables d'environnement (voir `.env.example`). Le site
   fonctionne sans, mais paiement / emails / IA restent en veille.
3. Vos photos produits déposées dans `public/products/` (voir le README de ce dossier).

---

## Méthode A — VPS Hostinger (recommandée)

La plus fiable pour Next.js.

```bash
# 1. Se connecter en SSH au VPS puis installer Node 20 (via nvm par ex.)
# 2. Envoyer le projet (git clone ou upload), puis :
npm ci
npm run build

# 3. Assembler le dossier autonome (static + public ne sont pas copiés auto)
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public

# 4. Lancer avec PM2 (redémarrage auto)
npm i -g pm2
cd .next/standalone
PORT=3000 pm2 start server.js --name madshop
pm2 save && pm2 startup
```

Puis dans hPanel : pointez votre domaine sur le VPS et configurez **Nginx** en
reverse proxy vers `http://localhost:3000`, avec **SSL** (Let's Encrypt, gratuit).

Exemple de bloc Nginx :

```nginx
server {
  server_name votredomaine.fr;
  location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

---

## Méthode B — Hébergement Node.js (hPanel, offres Business/Cloud)

1. hPanel → **Avancé → Node.js** → *Créer une application*.
   - Version Node : **20+**
   - Dossier racine : celui de votre upload
   - Fichier de démarrage : `.next/standalone/server.js`
2. Uploadez le projet (ou clonez-le via le terminal intégré).
3. Dans le terminal de l'app :
   ```bash
   npm ci
   npm run build
   cp -r .next/static .next/standalone/.next/static
   cp -r public .next/standalone/public
   ```
4. **Variables d'environnement** : ajoutez-les dans l'interface Node.js
   (les mêmes que `.env.example`), notamment `NEXT_PUBLIC_SITE_URL=https://votredomaine.fr`.
5. Démarrez / redémarrez l'application.

> Si le build est trop lourd pour l'hébergement mutualisé, buildez en local
> (`npm run build`) puis uploadez le dossier `.next/` déjà construit.

---

## 🔑 Configurer les intégrations en production

| Service | À faire |
|---|---|
| **Stripe** | Clés *live* dans `STRIPE_SECRET_KEY`. Créez un webhook vers `https://votredomaine.fr/api/webhook` (événement `checkout.session.completed`) et collez son secret dans `STRIPE_WEBHOOK_SECRET`. |
| **Resend** | Vérifiez votre domaine d'envoi, puis `RESEND_API_KEY`, `EMAIL_FROM` (ex : `MAD Shop <contact@votredomaine.fr>`) et `EMAIL_TO`. |
| **SEO** | `NEXT_PUBLIC_SITE_URL=https://votredomaine.fr` pour le sitemap et les balises. |

---

## 🔁 Mettre à jour le site plus tard

```bash
git pull            # ou réuploadez les fichiers modifiés
npm ci
npm run build
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public
pm2 restart madshop   # (Méthode A) ou redémarrez l'app (Méthode B)
```

---

## ✔️ Checklist avant mise en ligne

- [ ] Photos produits dans `public/products/`
- [ ] Variables d'environnement renseignées (Stripe live, Resend, Anthropic)
- [ ] `NEXT_PUBLIC_SITE_URL` = votre vrai domaine
- [ ] Webhook Stripe créé et testé
- [ ] Domaine d'envoi Resend vérifié
- [ ] SSL (HTTPS) activé
- [ ] Mentions légales complétées (`app/mentions-legales/page.tsx`)
