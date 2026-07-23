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
  sessionId?: string;
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

/** Recherche pour le suivi client : numéro + email doivent correspondre. */
export async function findOrder(number: string, email: string): Promise<Order | null> {
  const orders = await all();
  const n = number.trim().toUpperCase();
  const e = email.trim().toLowerCase();
  return orders.find((o) => o.number === n && o.email === e) ?? null;
}

/* --- Admin --- */
export async function allOrders(): Promise<Order[]> {
  return (await all()).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function setOrderStatus(number: string, status: OrderStatus) {
  const orders = await all();
  const o = orders.find((x) => x.number === number);
  if (o) {
    o.status = status;
    await writeJSON(FILE, orders);
  }
}
