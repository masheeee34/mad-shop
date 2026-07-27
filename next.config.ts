import type { NextConfig } from "next";

/**
 * Politique de sécurité du contenu.
 *
 * `unsafe-inline` reste nécessaire sur `script-src` : les balises d'amorçage
 * de Next.js, GA4 et le pixel Meta sont inline. L'alternative (nonce par
 * requête via middleware) forcerait le rendu dynamique de toutes les pages et
 * ferait perdre la génération statique — inacceptable pour un catalogue.
 * Tout le reste est verrouillé sur des origines explicites.
 */
const IS_DEV = process.env.NODE_ENV === "development";

const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self' https://checkout.stripe.com",
  [
    "script-src 'self' 'unsafe-inline'",
    "https://js.stripe.com",
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
    "https://connect.facebook.net",
    "https://analytics.tiktok.com",
  ].join(" "),
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  [
    "connect-src 'self'",
    // Rechargement à chaud du serveur de développement.
    ...(IS_DEV ? ["ws://localhost:*", "http://localhost:*"] : []),
    "https://api.stripe.com",
    // Interrogé par l'Express Checkout Element pour savoir quels
    // portefeuilles proposer. Sans lui, aucun bouton ne s'affiche.
    "https://merchant-ui-api.stripe.com",
    "https://www.google-analytics.com",
    "https://analytics.google.com",
    "https://region1.google-analytics.com",
    "https://www.googletagmanager.com",
    "https://connect.facebook.net",
    "https://analytics.tiktok.com",
  ].join(" "),
  // `pay.google.com` : feuille de paiement Google Pay, ouverte en iframe.
  "frame-src https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com https://pay.google.com",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  // Inutile en local (http://localhost) et bloquant pour le développement.
  ...(IS_DEV ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const nextConfig: NextConfig = {
  // View Transitions désactivées : non supportées sur Safari macOS (WebKit)
  // et provoquent un crash complet de la page sur ce navigateur.
  // experimental: { viewTransition: true },

  // Sortie autonome : idéale pour un déploiement Node sur Hostinger.
  output: "standalone",

  // ESLint est déjà passé en amont : le relancer pendant `next build` allonge
  // la compilation sur l'hébergement et, au moindre avertissement promu en
  // erreur, fait échouer tout le déploiement. Les erreurs TypeScript, elles,
  // restent vérifiées.
  eslint: { ignoreDuringBuilds: true },

  // Masque la version du framework dans les en-têtes de réponse.
  poweredByHeader: false,

  images: {
    // Formats modernes servis automatiquement par next/image.
    formats: ["image/avif", "image/webp"],
    // Tailles optimisées pour les appareils mobiles courants.
    deviceSizes: [390, 430, 640, 750, 828, 1080, 1200, 1920],
    // Un SVG distant peut embarquer du script : on ne l'autorise jamais.
    dangerouslyAllowSVG: false,
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: CSP },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            /**
             * `payment` est délégué à js.stripe.com : Apple Pay et Google Pay
             * s'exécutent dans l'iframe de Stripe, qui ne peut appeler
             * l'API Payment Request que si on l'y autorise explicitement.
             */
            key: "Permissions-Policy",
            value:
              'camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(self "https://js.stripe.com")',
          },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
      {
        // Aucune page d'administration ne doit être mise en cache,
        // ni par le navigateur ni par un proxy intermédiaire.
        source: "/admin/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      {
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
      },
      {
        // Les images produits portent un nom unique : cache long et immuable.
        source: "/products/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
