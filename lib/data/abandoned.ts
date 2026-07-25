import "server-only";
import { readJSON, writeJSON } from "./store";

const FILE = "abandoned_carts.json";

/**
 * Paniers abandonnés : sessions de paiement ouvertes puis jamais réglées.
 *
 * L'email n'est pas demandé au visiteur — il provient de la session Stripe,
 * qui le collecte de toute façon avant le paiement. Aucune friction ajoutée
 * au tunnel d'achat, et une relance possible sur les seuls abandons réels.
 */
export type AbandonedCart = {
  sessionId: string;
  email: string;
  items: { slug: string; quantity: number }[];
  totalCents: number;
  createdAt: string;
  /** Date d'envoi de la relance, si elle a eu lieu. */
  remindedAt?: string;
  /** Date de la commande finalement passée, si le panier a été récupéré. */
  recoveredAt?: string;
};

async function all(): Promise<AbandonedCart[]> {
  return readJSON<AbandonedCart[]>(FILE, []);
}

export async function getAbandonedCarts(): Promise<AbandonedCart[]> {
  return (await all()).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function getAbandonedCart(
  sessionId: string,
): Promise<AbandonedCart | null> {
  return (await all()).find((c) => c.sessionId === sessionId) ?? null;
}

/** Enregistre un abandon, sans jamais créer de doublon pour une même session. */
export async function recordAbandonedCart(
  cart: Omit<AbandonedCart, "createdAt">,
): Promise<AbandonedCart | null> {
  const carts = await all();
  if (carts.some((c) => c.sessionId === cart.sessionId)) return null;

  const entry: AbandonedCart = { ...cart, createdAt: new Date().toISOString() };
  carts.push(entry);
  await writeJSON(FILE, carts);
  return entry;
}

export async function markReminded(sessionId: string): Promise<void> {
  await patch(sessionId, { remindedAt: new Date().toISOString() });
}

/**
 * Marque comme récupéré tout panier abandonné de la même adresse.
 * Le client qui revient repart souvent d'un panier neuf plutôt que du lien de
 * relance : on ne veut pas continuer à le relancer pour un achat déjà fait.
 */
export async function markRecoveredByEmail(email: string): Promise<void> {
  const wanted = email.trim().toLowerCase();
  const carts = await all();
  const now = new Date().toISOString();
  let changed = false;

  for (const cart of carts) {
    if (cart.email === wanted && !cart.recoveredAt) {
      cart.recoveredAt = now;
      changed = true;
    }
  }

  if (changed) await writeJSON(FILE, carts);
}

async function patch(sessionId: string, values: Partial<AbandonedCart>) {
  const carts = await all();
  const cart = carts.find((c) => c.sessionId === sessionId);
  if (!cart) return;
  Object.assign(cart, values);
  await writeJSON(FILE, carts);
}
