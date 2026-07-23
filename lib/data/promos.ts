import "server-only";
import { readJSON, writeJSON } from "./store";

const FILE = "promos.json";

export type Promo = {
  code: string; // toujours en MAJUSCULES
  type: "percent" | "amount";
  value: number; // percent: 10 => -10% | amount: centimes (500 => -5 €)
  active: boolean;
  label?: string;
};

const seed: Promo[] = [
  { code: "BIENVENUE10", type: "percent", value: 10, active: true, label: "Offre de bienvenue" },
];

async function all(): Promise<Promo[]> {
  return readJSON<Promo[]>(FILE, seed);
}

export async function getPromos(): Promise<Promo[]> {
  return all();
}

/** Renvoie le promo si le code existe et est actif, sinon null. */
export async function validatePromo(code: string): Promise<Promo | null> {
  const wanted = code.trim().toUpperCase();
  const promos = await all();
  return promos.find((p) => p.active && p.code === wanted) ?? null;
}

/** Calcule la réduction (en centimes) pour un sous-total donné. */
export function discountFor(promo: Promo, subtotalCents: number): number {
  if (promo.type === "percent") {
    return Math.round((subtotalCents * promo.value) / 100);
  }
  return Math.min(promo.value, subtotalCents);
}

/* --- Admin --- */
export async function savePromos(promos: Promo[]): Promise<void> {
  await writeJSON(
    FILE,
    promos.map((p) => ({ ...p, code: p.code.trim().toUpperCase() })),
  );
}
