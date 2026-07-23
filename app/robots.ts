import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://madshop.fr";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/commande/", "/admin", "/suivi"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
