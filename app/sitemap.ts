import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/data/catalog";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://madshop.fr";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const products = await getProducts();
  const staticRoutes = ["", "/boutique", "/a-propos", "/contact", "/livraison", "/suivi", "/mentions-legales"];

  return [
    ...staticRoutes.map((route) => ({
      url: `${siteUrl}${route}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.7,
    })),
    ...products.map((p) => ({
      url: `${siteUrl}/produit/${p.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
