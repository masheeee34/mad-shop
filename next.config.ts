import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // View Transitions API (React 19 + Next.js 16) — animations de navigation natives.
  experimental: {
    viewTransition: true,
  },

  // Sortie autonome : idéale pour un déploiement Node sur Hostinger.
  // Génère .next/standalone/server.js à lancer avec `node server.js`.
  output: "standalone",

  images: {
    // Formats modernes servis automatiquement par next/image.
    formats: ["image/avif", "image/webp"],
    // Tailles optimisées pour les appareils mobiles courants.
    deviceSizes: [390, 430, 640, 750, 828, 1080, 1200, 1920],
  },

  // Bonnes pratiques de sécurité des en-têtes HTTP.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
