/**
 * Définitions de types et constantes partagées client / serveur.
 * Ce fichier NE contient AUCUNE directive `server-only` ni import Node.js.
 */

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
  number: string;
  email: string;
  name?: string;
  totalCents: number;
  items: OrderItem[];
  status: OrderStatus;
  createdAt: string;
  sessionId?: string;
  carrier?: string;
  trackingNumber?: string;
  address?: {
    line1: string;
    line2?: string | null;
    city: string;
    postal_code: string;
    country: string;
  };
  stripeInfo?: {
    id: string;
  };
};

export type Review = {
  id: string;
  slug: string;
  author: string;
  rating: number;
  comment: string;
  createdAt: string;
  approved: boolean;
  verified: boolean;
  adminReply?: string;
};

export type Rating = {
  average: number;
  count: number;
};
