/* Paramètres boutique centralisés. */

/** Seuil de livraison offerte (en centimes). */
export const FREE_SHIPPING_CENTS = 6000; // 60 €

/** Frais de livraison standard (en centimes) sous le seuil. */
export const SHIPPING_CENTS = 490; // 4,90 €

/** Numéro WhatsApp business (format international sans +), via env. */
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP ?? "";
