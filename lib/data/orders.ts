import "server-only";
import { readJSON, writeJSON, makeId } from "./store";

const FILE = "orders.json";

export const ORDER_STATUSES = [
  "en_preparation",
  "expediee",
  "livree",
  "annulee",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  en_preparation: "En préparation",
  expediee: "Expédiée",
  livree: "Livrée",
  annulee: "Annulée",
};

export type OrderItem = { name: string; quantity: number };

export type Order = {
  number: string; // ex: MAD-XXXX
  email: string;
  name?: string;
  totalCents: number;
  items: OrderItem[];
  status: OrderStatus;
  createdAt: string;
  /**
   * Référence du paiement Stripe : identifiant de session (`cs_…`) pour le
   * tunnel classique, de PaymentIntent (`pi_…`) pour le paiement express.
   * Sert de clé d'idempotence côté webhook, quel que soit le parcours.
   */
  sessionId?: string;
  /** Identifiant de transporteur (voir lib/carriers.ts). */
  carrier?: string;
  /** Numéro de colis communiqué au client. */
  trackingNumber?: string;
};

async function all(): Promise<Order[]> {
  return readJSON<Order[]>(FILE, []);
}

export async function createOrder(input: {
  email: string;
  name?: string;
  totalCents: number;
  items: OrderItem[];
  sessionId?: string;
}): Promise<Order> {
  const orders = await all();
  const order: Order = {
    number: makeId("MAD-"),
    email: input.email.toLowerCase(),
    name: input.name,
    totalCents: input.totalCents,
    items: input.items,
    status: "en_preparation",
    createdAt: new Date().toISOString(),
    sessionId: input.sessionId,
  };
  orders.push(order);
  await writeJSON(FILE, orders);
  return order;
}

/**
 * Commande déjà enregistrée pour une session Stripe donnée.
 * Stripe rejoue un webhook jusqu'à ce qu'il reçoive un 2xx : sans ce contrôle,
 * un rejeu créerait une commande en double et renverrait un second email.
 */
export async function findOrderBySession(sessionId: string): Promise<Order | null> {
  const orders = await all();
  return orders.find((o) => o.sessionId === sessionId) ?? null;
}

/** Recherche pour le suivi client : numéro + email doivent correspondre. */
export async function findOrder(number: string, email: string): Promise<Order | null> {
  const orders = await all();
  const n = number.trim().toUpperCase();
  const e = email.trim().toLowerCase();
  return orders.find((o) => o.number === n && o.email === e) ?? null;
}

/** Historique d'un client connecté, du plus récent au plus ancien. */
export async function ordersByEmail(email: string): Promise<Order[]> {
  const wanted = email.trim().toLowerCase();
  const orders = await all();
  return orders
    .filter((o) => o.email === wanted)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

/**
 * Vrai si ce client a bien acheté ce produit dans une commande non annulée.
 * Sert à n'accepter que des avis vérifiés.
 *
 * Les commandes ne stockent que le libellé des articles (envoyé par Stripe) :
 * on compare donc sur le nom du produit, en tolérant les variations de casse
 * et d'accents.
 */
export async function hasPurchased(
  email: string,
  productName: string,
): Promise<boolean> {
  const orders = await ordersByEmail(email);
  const wanted = normalizeLabel(productName);

  return orders.some(
    (order) =>
      order.status !== "annulee" &&
      order.items.some((item) => normalizeLabel(item.name) === wanted),
  );
}

function normalizeLabel(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

/* --- Admin --- */
export async function allOrders(): Promise<Order[]> {
  return (await all()).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

/**
 * Change le statut d'une commande.
 * Renvoie la commande mise à jour, ou `null` si elle est introuvable ou si le
 * statut demandé était déjà le sien — ce qui évite de renvoyer un email de
 * notification à chaque enregistrement du formulaire.
 */
export async function setOrderStatus(
  number: string,
  status: OrderStatus,
): Promise<Order | null> {
  const orders = await all();
  const order = orders.find((x) => x.number === number);

  if (!order || order.status === status) return null;

  order.status = status;
  await writeJSON(FILE, orders);
  return order;
}

/**
 * Enregistre le colis. Renvoie la commande mise à jour, ou `null` si rien n'a
 * changé — le suivi ne doit pas déclencher un second email à chaque
 * enregistrement du formulaire.
 */
export async function setOrderTracking(
  number: string,
  carrier: string,
  trackingNumber: string,
): Promise<Order | null> {
  const orders = await all();
  const order = orders.find((x) => x.number === number);
  if (!order) return null;

  const nextNumber = trackingNumber.trim();
  const nextCarrier = nextNumber ? carrier : "";

  if (
    (order.trackingNumber ?? "") === nextNumber &&
    (order.carrier ?? "") === nextCarrier
  ) {
    return null;
  }

  order.trackingNumber = nextNumber || undefined;
  order.carrier = nextCarrier || undefined;
  await writeJSON(FILE, orders);
  return order;
}
