import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/data/catalog";
import { SITE_URL } from "@/lib/config";

const siteUrl = SITE_URL;

/**
 * Pages indexables. Le panier, le compte client et l'administration en sont
 * volontairement absents : ils n'ont aucune valeur en résultat de recherche et
 * diluent le budget d'exploration du site.
 */
const staticRoutes = [
  "",
  "/boutique",
  "/a-propos",
  "/contact",
  "/livraison",
  "/suivi",
  "/cgv",
  "/mentions-legales",
];

/** Les pages de contenu légal bougent peu et ne méritent pas la même priorité. */
const LOW_PRIORITY = new Set(["/cgv", "/mentions-legales"]);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const products = await getProducts();

  return [
    ...staticRoutes.map((route) => ({
      url: `${siteUrl}${route}`,
      lastModified: now,
      changeFrequency: (LOW_PRIORITY.has(route) ? "yearly" : "weekly") as const,
      priority: route === "" ? 1 : LOW_PRIORITY.has(route) ? 0.3 : 0.7,
    })),
    ...products.map((p) => ({
      url: `${siteUrl}/produit/${p.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
