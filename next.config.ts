import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sortie autonome : idéale pour un déploiement Node sur Hostinger.
  // Génère .next/standalone/server.js à lancer avec `node server.js`.
  output: "standalone",

  images: {
    // Formats modernes servis automatiquement par next/image.
    formats: ["image/avif", "image/webp"],
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
