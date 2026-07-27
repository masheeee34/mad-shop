"use client";

/**
 * Couche de mesure e-commerce.
 *
 * Un seul appel métier (`trackAddToCart`, `trackBeginCheckout`…) alimente
 * simultanément GA4, Google Ads, Meta Pixel et TikTok Pixel, avec le schéma
 * d'événements attendu par chaque régie. C'est ce qui permet aux algorithmes
 * d'enchères d'optimiser sur l'achat plutôt que sur le clic.
 *
 * Toutes les fonctions sont sans effet tant qu'aucun identifiant n'est
 * configuré ou tant que le visiteur n'a pas consenti.
 */

type Params = Record<string, unknown>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    ttq?: { track: (event: string, params?: Params) => void };
    dataLayer?: unknown[];
  }
}

const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
const PURCHASE_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL;

const CURRENCY = "EUR";

/** Article normalisé, converti ensuite au format de chaque régie. */
export type TrackedItem = {
  slug: string;
  name: string;
  priceCents: number;
  quantity?: number;
  category?: string;
};

const euros = (cents: number) => Math.round(cents) / 100;

const totalValue = (items: TrackedItem[]) =>
  euros(items.reduce((sum, i) => sum + i.priceCents * (i.quantity ?? 1), 0));

const gaItems = (items: TrackedItem[]) =>
  items.map((i) => ({
    item_id: i.slug,
    item_name: i.name,
    item_category: i.category,
    price: euros(i.priceCents),
    quantity: i.quantity ?? 1,
    currency: CURRENCY,
  }));

const metaContents = (items: TrackedItem[]) =>
  items.map((i) => ({
    id: i.slug,
    quantity: i.quantity ?? 1,
    item_price: euros(i.priceCents),
  }));

/* -------------------------------------------------------------------------- */
/*  Primitives                                                                 */
/* -------------------------------------------------------------------------- */

export function gaEvent(name: string, params: Params = {}) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", name, params);
}

export function pixelEvent(name: string, params: Params = {}) {
  if (typeof window === "undefined") return;
  window.fbq?.("track", name, params);
}

export function tiktokEvent(name: string, params: Params = {}) {
  if (typeof window === "undefined") return;
  window.ttq?.track(name, params);
}

/* -------------------------------------------------------------------------- */
/*  Parcours d'achat                                                           */
/* -------------------------------------------------------------------------- */

/** Consultation d'une fiche produit. */
export function trackViewItem(item: TrackedItem) {
  const value = totalValue([item]);
  gaEvent("view_item", { currency: CURRENCY, value, items: gaItems([item]) });
  pixelEvent("ViewContent", {
    currency: CURRENCY,
    value,
    content_type: "product",
    content_ids: [item.slug],
    content_name: item.name,
  });
  tiktokEvent("ViewContent", {
    currency: CURRENCY,
    value,
    content_id: item.slug,
    content_name: item.name,
  });
}

/** Affichage d'une liste de produits (boutique, suggestions). */
export function trackViewItemList(items: TrackedItem[], listName: string) {
  if (items.length === 0) return;
  gaEvent("view_item_list", { item_list_name: listName, items: gaItems(items) });
}

/** Sélection d'un produit dans une liste — mesure le merchandising. */
export function trackSelectItem(item: TrackedItem, listName: string) {
  gaEvent("select_item", { item_list_name: listName, items: gaItems([item]) });
}

export function trackAddToCart(item: TrackedItem) {
  const value = totalValue([item]);
  gaEvent("add_to_cart", { currency: CURRENCY, value, items: gaItems([item]) });
  pixelEvent("AddToCart", {
    currency: CURRENCY,
    value,
    content_type: "product",
    content_ids: [item.slug],
    contents: metaContents([item]),
  });
  tiktokEvent("AddToCart", {
    currency: CURRENCY,
    value,
    content_id: item.slug,
    quantity: item.quantity ?? 1,
  });
}

export function trackRemoveFromCart(item: TrackedItem) {
  gaEvent("remove_from_cart", {
    currency: CURRENCY,
    value: totalValue([item]),
    items: gaItems([item]),
  });
}

export function trackAddToWishlist(item: TrackedItem) {
  const value = totalValue([item]);
  gaEvent("add_to_wishlist", { currency: CURRENCY, value, items: gaItems([item]) });
  pixelEvent("AddToWishlist", {
    currency: CURRENCY,
    value,
    content_ids: [item.slug],
    content_type: "product",
  });
  tiktokEvent("AddToWishlist", { currency: CURRENCY, value, content_id: item.slug });
}

export function trackViewCart(items: TrackedItem[]) {
  if (items.length === 0) return;
  gaEvent("view_cart", {
    currency: CURRENCY,
    value: totalValue(items),
    items: gaItems(items),
  });
}

/**
 * Clic sur « Passer au paiement ». C'est l'événement d'optimisation le plus
 * utile tant que le volume d'achats reste trop faible pour entraîner les
 * campagnes sur la conversion finale.
 */
export function trackBeginCheckout(items: TrackedItem[], promoCode?: string) {
  const value = totalValue(items);
  gaEvent("begin_checkout", {
    currency: CURRENCY,
    value,
    coupon: promoCode,
    items: gaItems(items),
  });
  pixelEvent("InitiateCheckout", {
    currency: CURRENCY,
    value,
    num_items: items.reduce((n, i) => n + (i.quantity ?? 1), 0),
    content_ids: items.map((i) => i.slug),
    contents: metaContents(items),
    content_type: "product",
  });
  tiktokEvent("InitiateCheckout", { currency: CURRENCY, value });
}

/** Achat confirmé. Déclenché une seule fois, sur la page de succès. */
export function trackPurchase(input: {
  valueCents: number;
  orderId?: string;
  items?: TrackedItem[];
}) {
  const value = euros(input.valueCents);

  gaEvent("purchase", {
    currency: CURRENCY,
    value,
    transaction_id: input.orderId,
    items: input.items ? gaItems(input.items) : undefined,
  });

  // Conversion Google Ads : c'est cet événement, et non `purchase`,
  // sur lequel les campagnes enchérissent.
  if (GOOGLE_ADS_ID && PURCHASE_LABEL) {
    gaEvent("conversion", {
      send_to: PURCHASE_LABEL,
      value,
      currency: CURRENCY,
      transaction_id: input.orderId,
    });
  }

  pixelEvent("Purchase", {
    currency: CURRENCY,
    value,
    content_type: "product",
    ...(input.items
      ? { content_ids: input.items.map((i) => i.slug), contents: metaContents(input.items) }
      : {}),
  });

  tiktokEvent("CompletePayment", { currency: CURRENCY, value });
}

/* -------------------------------------------------------------------------- */
/*  Engagement                                                                 */
/* -------------------------------------------------------------------------- */

export function trackSearch(term: string) {
  if (!term.trim()) return;
  gaEvent("search", { search_term: term });
  pixelEvent("Search", { search_string: term });
}

/** Alerte de réapprovisionnement, réservation, message de contact. */
export function trackLead(source: string, item?: TrackedItem) {
  gaEvent("generate_lead", { currency: CURRENCY, method: source });
  pixelEvent("Lead", {
    content_name: item?.name ?? source,
    ...(item ? { content_ids: [item.slug] } : {}),
  });
  tiktokEvent("SubmitForm", { content_name: item?.name ?? source });
}
