"use client";

/**
 * Envoie un événement à GA4 (gtag) et au Meta Pixel (fbq) s'ils sont présents.
 * Sans effet si le tracking n'est pas configuré.
 */

type Params = Record<string, unknown>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

/** Événement GA4 générique. */
export function gaEvent(name: string, params: Params = {}) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", name, params);
  }
}

/** Événement Meta Pixel standard. */
export function pixelEvent(name: string, params: Params = {}) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", name, params);
  }
}

/** Ajout au panier (GA4 + Meta). */
export function trackAddToCart(item: {
  slug: string;
  name: string;
  priceCents: number;
  quantity: number;
}) {
  const value = (item.priceCents * item.quantity) / 100;
  gaEvent("add_to_cart", {
    currency: "EUR",
    value,
    items: [{ item_id: item.slug, item_name: item.name, quantity: item.quantity }],
  });
  pixelEvent("AddToCart", {
    currency: "EUR",
    value,
    content_ids: [item.slug],
    content_type: "product",
  });
}

/** Achat confirmé (à appeler sur la page de succès). */
export function trackPurchase(valueCents: number, orderId?: string) {
  gaEvent("purchase", {
    currency: "EUR",
    value: valueCents / 100,
    transaction_id: orderId,
  });
  pixelEvent("Purchase", { currency: "EUR", value: valueCents / 100 });
}
