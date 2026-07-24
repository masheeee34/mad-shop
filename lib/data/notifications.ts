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

export async function addNotification(
  productSlug: string,
  productName: string,
  email: string
): Promise<StockNotification> {
  const list = await getNotifications();
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
