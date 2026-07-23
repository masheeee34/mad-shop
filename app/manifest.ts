import type { MetadataRoute } from "next";

/**
 * PWA Manifest — Next.js 16 natif (app/manifest.ts).
 * L'app s'installe sur l'écran d'accueil iOS/Android comme une vraie app.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MAD Shop — La qualité à petit prix",
    short_name: "MAD Shop",
    description:
      "Audio, sécurité et objets connectés testés et approuvés. Livraison 24-48h en France et en Europe.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b0b0c",
    theme_color: "#0b0b0c",
    orientation: "portrait",
    scope: "/",
    categories: ["shopping", "lifestyle"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
