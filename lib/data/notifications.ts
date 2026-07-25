import "server-only";
import { readJSON, writeJSON } from "./store";

export type StockNotification = {
  id: string;
  productSlug: string;
  productName: string;
  email: string;
  createdAt: string;
};

const FILE = "stock_notifications.json";

export async function getNotifications(): Promise<StockNotification[]> {
  return readJSON<StockNotification[]>(FILE, []);
}

/**
 * Vide la file d'attente d'un produit, une fois les inscrits prévenus.
 * Sans cela, chaque nouveau réassort renverrait un email aux mêmes personnes.
 */
export async function clearNotifications(productSlug: string): Promise<void> {
  const list = await getNotifications();
  await writeJSON(
    FILE,
    list.filter((n) => n.productSlug !== productSlug),
  );
}

export async function addNotification(
  productSlug: string,
  productName: string,
  email: string
): Promise<StockNotification> {
  const list = await getNotifications();

  // Une même adresse ne s'inscrit qu'une fois par produit.
  const existing = list.find(
    (n) =>
      n.productSlug === productSlug &&
      n.email.trim().toLowerCase() === email.trim().toLowerCase(),
  );
  if (existing) return existing;

  const newNotif: StockNotification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    productSlug,
    productName,
    email,
    createdAt: new Date().toISOString(),
  };
  list.unshift(newNotif);
  await writeJSON(FILE, list);
  return newNotif;
}
