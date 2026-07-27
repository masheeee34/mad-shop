/* Paramètres boutique centralisés. */

/** Nom commercial, utilisé dans les métadonnées et les données structurées. */
export const BRAND_NAME = "MAD Shop";

/** Signature de marque. */
export const BRAND_TAGLINE = "La qualité à petit prix";

/** URL canonique du site. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://madshop.fr";

/** Seuil de livraison offerte (en centimes) — Île-de-France. */
export const FREE_SHIPPING_CENTS = 15000; // 150 €

/** Frais de livraison standard (en centimes) sous le seuil. */
export const SHIPPING_CENTS = 490; // 4,90 €

/** Délai de rétractation légal, en jours. */
export const RETURN_WINDOW_DAYS = 14;

/** Pays livrés — liste partagée par Stripe Checkout et le flux produits. */
export const SHIPPING_COUNTRIES = [
  "FR",
  "BE",
  "LU",
  "CH",
  "DE",
  "ES",
  "IT",
  "NL",
  "PT",
] as const;

/** Numéro WhatsApp business (format international sans +), via env. */
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP ?? "";

/**
 * Comptes sociaux de la boutique. Une icône dont le lien mène à l'accueil du
 * réseau plutôt qu'au compte de la marque décrédibilise le pied de page :
 * tant qu'une URL n'est pas renseignée, l'icône correspondante n'est pas
 * affichée du tout.
 */
export const SOCIAL_LINKS = {
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "",
  facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL ?? "",
  tiktok: process.env.NEXT_PUBLIC_TIKTOK_URL ?? "",
} as const;
