import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/data/catalog";
import { SITE_URL } from "@/lib/config";

const siteUrl = SITE_URL;

/**
 * Pages indexables. Le panier et l'administration en sont
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

  // Annoter le type de retour plutôt que d'affirmer celui de chaque champ :
  // `changeFrequency` est alors contraint par le contexte, et toute la forme
  // de l'entrée est vérifiée.
  type Entry = MetadataRoute.Sitemap[number];

  return [
    ...staticRoutes.map(
      (route): Entry => ({
        url: `${siteUrl}${route}`,
        lastModified: now,
        changeFrequency: LOW_PRIORITY.has(route) ? "yearly" : "weekly",
        priority: route === "" ? 1 : LOW_PRIORITY.has(route) ? 0.3 : 0.7,
      }),
    ),
    ...products.map(
      (p): Entry => ({
        url: `${siteUrl}/produit/${p.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
      }),
    ),
  ];
}
